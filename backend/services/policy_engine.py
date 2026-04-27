import re
import logging
from sqlalchemy.orm import Session
from models.policy_rule import PolicyRule
from models.user import User

logger = logging.getLogger("bharatai")

class PolicyDecision:
    """Result of policy evaluation"""
    def __init__(self):
        self.action         = "ALLOW"     # ALLOW/BLOCK/REDACT/FLAG/WARN
        self.triggered_rules = []         # Which rules fired
        self.redacted_query  = None       # Query after redaction
        self.block_reason    = None       # Why it was blocked
        self.risk_level      = "SAFE"     # SAFE/SENSITIVE/FLAGGED/BLOCKED
        self.policy_version  = 1
        self.explanation     = ""         # Human readable explanation

class PolicyEngine:
    """
    Dynamic policy enforcement engine.
    
    Replaces hardcoded keyword list with:
    - Database-driven rules
    - Clearance level enforcement
    - Auto-redaction
    - Full explainability
    """
    
    def evaluate(
        self,
        query: str,
        user: User,
        ministry: str,
        db: Session
    ) -> PolicyDecision:
        """
        Run query through all active policy rules.
        Returns PolicyDecision with action and explanation.
        
        Evaluation order (priority):
        1. BLOCK rules    → evaluated first, highest priority
        2. REDACT rules   → auto-clean PII
        3. FLAG rules     → allow but log
        4. WARN rules     → alert user but allow
        """
        decision = PolicyDecision()
        working_query = query
        
        # Fetch all active rules for this ministry
        rules = self._get_applicable_rules(ministry, db)
        
        # Sort by priority: BLOCK first, then REDACT, FLAG, WARN
        priority = {"BLOCK": 0, "REDACT": 1, "FLAG": 2, "WARN": 3}
        rules.sort(key=lambda r: priority.get(r.action, 99))
        
        for rule in rules:
            matched = self._evaluate_rule(rule, working_query)
            
            if not matched:
                continue
            
            # Check clearance level
            if user.clearance_level < rule.clearance_required:
                # User doesn't have clearance — escalate action to BLOCK
                decision.action = "BLOCK"
                decision.triggered_rules.append({
                    "rule_id": rule.id,
                    "rule_name": rule.name,
                    "action": "BLOCK",
                    "reason": f"Insufficient clearance. "
                              f"Required: Level {rule.clearance_required}, "
                              f"Your level: {user.clearance_level}"
                })
                decision.block_reason = (
                    f"Access Denied: '{rule.name}' requires "
                    f"clearance Level {rule.clearance_required}. "
                    f"Your clearance is Level {user.clearance_level}."
                )
                decision.risk_level = "BLOCKED"
                
                # Increment trigger count
                rule.trigger_count += 1
                db.commit()
                
                # BLOCK is final — stop evaluating
                break
            
            # Apply action
            if rule.action == "BLOCK":
                decision.action = "BLOCK"
                decision.block_reason = f"Blocked by policy: {rule.name}"
                decision.risk_level = "BLOCKED"
                decision.triggered_rules.append({
                    "rule_id": rule.id,
                    "rule_name": rule.name,
                    "action": "BLOCK",
                    "pattern": rule.pattern,
                    "description": rule.description
                })
                rule.trigger_count += 1
                db.commit()
                break
            
            elif rule.action == "REDACT":
                redacted = self._apply_redaction(working_query, rule)
                if redacted != working_query:
                    decision.triggered_rules.append({
                        "rule_id": rule.id,
                        "rule_name": rule.name,
                        "action": "REDACT",
                        "description": rule.description
                    })
                    working_query = redacted
                    if decision.action == "ALLOW":
                        decision.action = "REDACT"
                    decision.risk_level = "SENSITIVE"
                    rule.trigger_count += 1
                    db.commit()
            
            elif rule.action == "FLAG":
                decision.triggered_rules.append({
                    "rule_id": rule.id,
                    "rule_name": rule.name,
                    "action": "FLAG",
                    "description": rule.description
                })
                if decision.action == "ALLOW":
                    decision.action = "FLAG"
                    decision.risk_level = "FLAGGED"
                rule.trigger_count += 1
                db.commit()
            
            elif rule.action == "WARN":
                decision.triggered_rules.append({
                    "rule_id": rule.id,
                    "rule_name": rule.name,
                    "action": "WARN",
                    "description": rule.description
                })
                if decision.action == "ALLOW":
                    decision.action = "WARN"
                    decision.risk_level = "SENSITIVE"
                rule.trigger_count += 1
                db.commit()
        
        # Set final redacted query
        decision.redacted_query = working_query
        
        # Build human-readable explanation
        decision.explanation = self._build_explanation(decision)
        
        return decision
    
    def _get_applicable_rules(
        self,
        ministry: str,
        db: Session
    ) -> list[PolicyRule]:
        """Get all active rules for this ministry"""
        return db.query(PolicyRule).filter(
            PolicyRule.is_active == True,
            (PolicyRule.ministry == "ALL") |
            (PolicyRule.ministry == ministry)
        ).all()
    
    def _evaluate_rule(
        self,
        rule: PolicyRule,
        query: str
    ) -> bool:
        """Check if rule matches query"""
        query_lower = query.lower()
        
        if rule.pattern_type == "keyword":
            # Check each keyword/phrase in pattern
            keywords = [k.strip() for k in rule.pattern.split("|")]
            return any(kw in query_lower for kw in keywords)
        
        elif rule.pattern_type == "regex":
            try:
                return bool(re.search(rule.pattern, query, re.IGNORECASE))
            except re.error:
                logger.error(f"Invalid regex in rule {rule.id}: {rule.pattern}")
                return False
        
        return False
    
    def _apply_redaction(
        self,
        query: str,
        rule: PolicyRule
    ) -> str:
        """Replace sensitive content with [REDACTED]"""
        try:
            if rule.pattern_type == "regex":
                return re.sub(
                    rule.pattern,
                    "[REDACTED]",
                    query,
                    flags=re.IGNORECASE
                )
            elif rule.pattern_type == "keyword":
                keywords = [k.strip() for k in rule.pattern.split("|")]
                result = query
                for kw in keywords:
                    result = re.sub(
                        re.escape(kw),
                        "[REDACTED]",
                        result,
                        flags=re.IGNORECASE
                    )
                return result
        except Exception as e:
            logger.error(f"Redaction error for rule {rule.id}: {e}")
        return query
    
    def _build_explanation(self, decision: PolicyDecision) -> str:
        """Build human readable explanation for the decision"""
        if decision.action == "ALLOW":
            return "Query passed all policy checks."
        
        elif decision.action == "BLOCK":
            rules_list = ", ".join(
                r["rule_name"] for r in decision.triggered_rules
            )
            return (
                f"Query blocked by policy engine. "
                f"Triggered rules: {rules_list}. "
                f"Reason: {decision.block_reason}"
            )
        
        elif decision.action == "REDACT":
            rules_list = ", ".join(
                r["rule_name"] for r in decision.triggered_rules
                if r["action"] == "REDACT"
            )
            return (
                f"Sensitive content automatically redacted. "
                f"Applied rules: {rules_list}. "
                f"Query has been cleaned before processing."
            )
        
        elif decision.action == "FLAG":
            rules_list = ", ".join(
                r["rule_name"] for r in decision.triggered_rules
            )
            return (
                f"Query flagged for oversight. "
                f"Triggered rules: {rules_list}. "
                f"Interaction logged for admin review."
            )
        
        return "Policy evaluation complete."
