from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from routers.auth import get_current_user
from models.user import User
from models.policy_rule import PolicyRule

router = APIRouter(prefix="/api/policy", tags=["Policy Engine"])

class CreateRuleRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    ministry: str = "ALL"
    pattern: str
    pattern_type: str = "keyword"   # keyword / regex / domain
    action: str                      # BLOCK / REDACT / FLAG / WARN
    clearance_required: int = 0

class UpdateRuleRequest(BaseModel):
    is_active: Optional[bool] = None
    action: Optional[str] = None
    clearance_required: Optional[int] = None
    description: Optional[str] = None

def admin_only(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin access required")
    return current_user

@router.get("/rules")
async def list_rules(
    ministry: str = None,
    active_only: bool = True,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db)
):
    """List all policy rules with trigger counts"""
    query = db.query(PolicyRule)
    if active_only:
        query = query.filter(PolicyRule.is_active == True)
    if ministry:
        query = query.filter(
            (PolicyRule.ministry == ministry) |
            (PolicyRule.ministry == "ALL")
        )
    rules = query.order_by(PolicyRule.trigger_count.desc()).all()
    return {"rules": rules, "total": len(rules)}

@router.post("/rules")
async def create_rule(
    request: CreateRuleRequest,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db)
):
    """Create a new policy rule"""
    # Validate action
    valid_actions = ["BLOCK", "REDACT", "FLAG", "WARN"]
    if request.action not in valid_actions:
        raise HTTPException(400, f"Action must be one of: {valid_actions}")
    
    # Validate pattern type
    valid_types = ["keyword", "regex", "domain"]
    if request.pattern_type not in valid_types:
        raise HTTPException(400, f"Pattern type must be one of: {valid_types}")
    
    rule = PolicyRule(
        name=request.name,
        description=request.description,
        ministry=request.ministry,
        pattern=request.pattern,
        pattern_type=request.pattern_type,
        action=request.action,
        clearance_required=request.clearance_required,
        created_by=current_user.id,
        is_active=True,
        trigger_count=0
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    
    return {
        "message": f"Rule '{rule.name}' created successfully",
        "rule_id": rule.id
    }

@router.patch("/rules/{rule_id}")
async def update_rule(
    rule_id: int,
    request: UpdateRuleRequest,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db)
):
    """Update or toggle a policy rule"""
    rule = db.query(PolicyRule).filter(PolicyRule.id == rule_id).first()
    if not rule:
        raise HTTPException(404, "Rule not found")
    
    # Increment version on any change
    rule.version += 1
    
    if request.is_active is not None:
        rule.is_active = request.is_active
    if request.action:
        rule.action = request.action
    if request.clearance_required is not None:
        rule.clearance_required = request.clearance_required
    if request.description:
        rule.description = request.description
    
    db.commit()
    return {"message": "Rule updated", "version": rule.version}

@router.delete("/rules/{rule_id}")
async def delete_rule(
    rule_id: int,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db)
):
    """Soft delete — deactivates rule"""
    rule = db.query(PolicyRule).filter(PolicyRule.id == rule_id).first()
    if not rule:
        raise HTTPException(404, "Rule not found")
    rule.is_active = False
    db.commit()
    return {"message": f"Rule '{rule.name}' deactivated"}

@router.get("/rules/stats")
async def policy_stats(
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db)
):
    """Get policy engine statistics"""
    total = db.query(PolicyRule).count()
    active = db.query(PolicyRule).filter(PolicyRule.is_active == True).count()
    most_triggered = db.query(PolicyRule)\
        .order_by(PolicyRule.trigger_count.desc())\
        .limit(5).all()
    
    return {
        "total_rules": total,
        "active_rules": active,
        "inactive_rules": total - active,
        "most_triggered": [
            {"name": r.name, "count": r.trigger_count, "action": r.action}
            for r in most_triggered
        ]
    }

@router.post("/rules/test")
async def test_rule(
    query: str,
    ministry: str = "General",
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db)
):
    """
    Test endpoint — runs a query through policy engine
    without actually sending to LLM.
    Perfect for admins to test new rules before activating.
    """
    from services.policy_engine import PolicyEngine
    engine = PolicyEngine()
    decision = engine.evaluate(
        query=query,
        user=current_user,
        ministry=ministry,
        db=db
    )
    return {
        "original_query": query,
        "action": decision.action,
        "risk_level": decision.risk_level,
        "redacted_query": decision.redacted_query,
        "triggered_rules": decision.triggered_rules,
        "explanation": decision.explanation,
        "would_reach_llm": decision.action != "BLOCK"
    }
