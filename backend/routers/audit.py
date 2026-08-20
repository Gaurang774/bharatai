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

    # Count distinct ministries that have logs
    active_ministries = db.query(func.count(AuditLog.ministry.distinct())).scalar() or 0

    # Average response time in ms
    avg_ms_result = db.query(func.avg(AuditLog.response_time_ms)).scalar()
    avg_response_ms = round(avg_ms_result) if avg_ms_result else 0
    
    most_active_ministry = db.query(
        AuditLog.ministry, func.count(AuditLog.id).label("count")
    ).group_by(AuditLog.ministry).order_by(func.count(AuditLog.id).desc()).first()

    return {
        "total_queries_today": total_queries,
        "flagged_queries": flagged_queries,
        "active_users": active_users,
        "active_ministries": active_ministries,
        "avg_response_ms": avg_response_ms,
        "most_active_ministry": most_active_ministry[0] if most_active_ministry else "N/A"
    }

@router.get("/export")
async def export_audit_csv(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    from fastapi.responses import StreamingResponse
    import io

    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()

    output = io.StringIO()
    output.write("Timestamp,User,Ministry,Query,Flagged,Keywords,Time(ms)\n")
    for log in logs:
        # Escape commas in query text
        query_safe = f'"{log.query_preview}"' if "," in (log.query_preview or "") else (log.query_preview or "")
        output.write(
            f"{log.created_at},{log.user_email},{log.ministry},"
            f"{query_safe},{log.is_flagged},{log.sensitivity_keywords_found},{log.response_time_ms}\n"
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bharatai_audit_logs.csv"}
    )
