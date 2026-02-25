from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from database import get_db
from routers.auth import get_current_user
from models.user import User
from models.audit_log import AuditLog

router = APIRouter(prefix="/api/audit", tags=["audit"])

def check_admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@router.get("/logs")
async def get_audit_logs(
    ministry: Optional[str] = None,
    flagged_only: bool = False,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    admin: User = Depends(check_admin)
):
    query = db.query(AuditLog)
    if ministry:
        query = query.filter(AuditLog.ministry == ministry)
    if flagged_only:
        query = query.filter(AuditLog.is_flagged == True)
    
    return query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()

@router.get("/stats")
async def get_stats(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    total_queries = db.query(AuditLog).count()
    flagged_queries = db.query(AuditLog).filter(AuditLog.is_flagged == True).count()
    active_users = db.query(func.count(AuditLog.user_id.distinct())).scalar()
    
    most_active_ministry = db.query(
        AuditLog.ministry, func.count(AuditLog.id).label("count")
    ).group_by(AuditLog.ministry).order_by(func.count(AuditLog.id).desc()).first()

    return {
        "total_queries_today": total_queries, # Simplification for demo
        "flagged_queries": flagged_queries,
        "active_users": active_users,
        "most_active_ministry": most_active_ministry[0] if most_active_ministry else "N/A"
    }

@router.get("/export")
async def export_audit_csv(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    # Simulating export - in real world this would return a StreamingResponse with CSV
    logs = db.query(AuditLog).all()
    header = "Timestamp,User,Ministry,Query,Flagged,Keywords,Time(ms)\n"
    rows = []
    for log in logs:
        rows.append(f"{log.created_at},{log.user_email},{log.ministry},{log.query_preview},{log.is_flagged},{log.sensitivity_keywords_found},{log.response_time_ms}")
    
    return {"csv_data": header + "\n".join(rows)}
