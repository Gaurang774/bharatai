from sqlalchemy.orm import Session
from models.audit_log import AuditLog
from typing import List, Optional

class AuditService:
    @staticmethod
    def log_interaction(
        db: Session,
        user_id: int,
        user_email: str,
        ministry: str,
        query: str,
        response: str,
        is_flagged: bool,
        found_keywords: List[str],
        response_time_ms: int,
        sensitivity_level: str = "SAFE"
    ):
        audit_entry = AuditLog(
            user_id=user_id,
            user_email=user_email,
            ministry=ministry,
            query_preview=query[:100],
            full_query=query,
            response_preview=response[:200],
            is_flagged=is_flagged,
            sensitivity_level=sensitivity_level.upper(),
            sensitivity_keywords_found=",".join(found_keywords) if isinstance(found_keywords, list) else str(found_keywords),
            response_time_ms=response_time_ms
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        return audit_entry
