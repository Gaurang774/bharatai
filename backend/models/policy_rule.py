from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class PolicyRule(Base):
    __tablename__ = "policy_rules"
    
    id              = Column(Integer, primary_key=True, index=True)
    
    # Rule Identity
    name            = Column(String, nullable=False)
    description     = Column(String)
    version         = Column(Integer, default=1)
    
    # Rule Conditions
    ministry        = Column(String, default="ALL")  
    # "ALL" means applies to every ministry
    # "Finance" means only Finance ministry
    
    pattern         = Column(String, nullable=False)
    # Can be: exact keyword, regex pattern, or semantic label
    
    pattern_type    = Column(String, default="keyword")
    # "keyword"  → exact string match
    # "regex"    → regex pattern match
    # "domain"   → topic/domain classification
    
    # Rule Action
    action          = Column(String, nullable=False)
    # "BLOCK"  → reject query entirely
    # "REDACT" → remove the sensitive part, allow rest
    # "FLAG"   → allow but mark as flagged in audit
    # "WARN"   → show warning, let user decide
    
    # Access Control
    clearance_required = Column(Integer, default=0)
    # 0 = no clearance needed
    # 1-5 = minimum clearance level required
    
    # Rule Management
    is_active       = Column(Boolean, default=True)
    created_by      = Column(Integer, ForeignKey("users.id"))
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Audit
    trigger_count   = Column(Integer, default=0)
    # How many times this rule has triggered
    # Helps admins see which rules are most active
