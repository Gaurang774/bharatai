from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    user_email = Column(String, nullable=False)
    ministry = Column(String, nullable=False)
    query_preview = Column(String(100))
    full_query = Column(Text)
    response_preview = Column(Text)
    is_flagged = Column(Boolean, default=False)
    sensitivity_level = Column(String(20), default="SAFE")  # SAFE / SENSITIVE / FLAGGED / BLOCKED
    sensitivity_keywords_found = Column(Text)  # comma-separated keywords
    response_time_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
