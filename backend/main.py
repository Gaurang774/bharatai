from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from datetime import datetime, timedelta
import random

# Import ALL models so Base.metadata knows about them
from models.user import User
from models.conversation import Conversation, Message
from models.audit_log import AuditLog
from models.document import Document
from models.policy_rule import PolicyRule

from routers import auth, chat, audit, documents, models, rag_debug, policy
from services.auth_service import get_password_hash

app = FastAPI(title="BharatAI API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(audit.router)
app.include_router(documents.router)
app.include_router(models.router)
app.include_router(rag_debug.router)
app.include_router(policy.router)

from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="BharatAI API",
        version="1.0.0",
        description="Core API for Sovereign Gov AI Platform",
        routes=app.routes,
    )
    # Fix the tokenUrl to be absolute and correct
    if "components" in openapi_schema and "securitySchemes" in openapi_schema["components"]:
        for scheme in openapi_schema["components"]["securitySchemes"].values():
            if scheme.get("type") == "oauth2":
                for flow in scheme.get("flows", {}).values():
                    if "tokenUrl" in flow:
                        flow["tokenUrl"] = "/api/auth/token"
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

DEFAULT_RULES = [
    # ── BLOCK rules (highest risk) ──────────────────────
    {
        "name": "Nuclear Information Block",
        "pattern": "nuclear",
        "pattern_type": "keyword",
        "ministry": "ALL",
        "action": "BLOCK",
        "clearance_required": 5,
        "description": "Block all nuclear-related queries"
    },
    {
        "name": "Classified Document Block",
        "pattern": "top secret|classified|above secret",
        "pattern_type": "regex",
        "ministry": "ALL",
        "action": "BLOCK",
        "clearance_required": 4,
        "description": "Block queries referencing classified documents"
    },
    {
        "name": "Troop Movement Block",
        "pattern": "troop|troop deployment|military movement",
        "pattern_type": "keyword",
        "ministry": "ALL",
        "action": "BLOCK",
        "clearance_required": 4,
        "description": "Block defense operational queries"
    },
    {
        "name": "Cabinet Decision Block",
        "pattern": "cabinet decision|cabinet minutes|cabinet meeting",
        "pattern_type": "keyword",
        "ministry": "ALL",
        "action": "BLOCK",
        "clearance_required": 4,
        "description": "Block cabinet-level confidential queries"
    },
    
    # ── REDACT rules (medium risk) ───────────────────────
    {
        "name": "Aadhaar Number Redaction",
        "pattern": r"\b\d{4}\s?\d{4}\s?\d{4}\b",
        "pattern_type": "regex",
        "ministry": "ALL",
        "action": "REDACT",
        "clearance_required": 0,
        "description": "Auto-redact Aadhaar numbers from all queries"
    },
    {
        "name": "PAN Number Redaction",
        "pattern": r"\b[A-Z]{5}\d{4}[A-Z]\b",
        "pattern_type": "regex",
        "ministry": "ALL",
        "action": "REDACT",
        "clearance_required": 0,
        "description": "Auto-redact PAN card numbers"
    },
    {
        "name": "Bank Account Redaction",
        "pattern": r"\b\d{9,18}\b",
        "pattern_type": "regex",
        "ministry": "ALL",
        "action": "REDACT",
        "clearance_required": 0,
        "description": "Auto-redact bank account numbers"
    },
    {
        "name": "GPS Coordinates Redaction",
        "pattern": r"\b\d{1,3}\.\d+[NS],?\s?\d{1,3}\.\d+[EW]\b",
        "pattern_type": "regex",
        "ministry": "ALL",
        "action": "REDACT",
        "clearance_required": 0,
        "description": "Auto-redact GPS coordinates"
    },
    
    # ── FLAG rules (low risk, monitor only) ─────────────
    {
        "name": "Tax Evasion Flag",
        "pattern": "tax evasion|tax fraud|shell company",
        "pattern_type": "keyword",
        "ministry": "Finance",
        "action": "FLAG",
        "clearance_required": 0,
        "description": "Flag tax investigation queries for oversight"
    },
    {
        "name": "Defense Budget Flag",
        "pattern": "defense budget|military budget|weapon procurement",
        "pattern_type": "keyword",
        "ministry": "Defense",
        "action": "FLAG",
        "clearance_required": 0,
        "description": "Flag defense spending queries"
    },
    {
        "name": "Missile Flag",
        "pattern": "missile|ballistic|warhead",
        "pattern_type": "keyword",
        "ministry": "ALL",
        "action": "FLAG",
        "clearance_required": 0,
        "description": "Flag missile-related queries"
    },
]


DEMO_AUDIT_ENTRIES = [
    # Finance Ministry — Normal
    {"email": "officer@finance.gov.in", "ministry": "Finance", "query": "Summarize FY2024 Q3 GDP growth projections", "flagged": False, "keywords": "", "ms": 1230},
    {"email": "officer@finance.gov.in", "ministry": "Finance", "query": "Draft budget allocation memo for infrastructure sector", "flagged": False, "keywords": "", "ms": 2100},
    {"email": "analyst@finance.gov.in", "ministry": "Finance", "query": "Compare GST collection trends Q1 vs Q2 2024", "flagged": False, "keywords": "", "ms": 890},
    {"email": "officer@finance.gov.in", "ministry": "Finance", "query": "What are the latest RBI repo rate changes?", "flagged": False, "keywords": "", "ms": 760},
    # Finance — Flagged
    {"email": "officer@finance.gov.in", "ministry": "Finance", "query": "Analyze offshore tax evasion patterns in shell companies", "flagged": True, "keywords": "tax evasion", "ms": 1800},
    {"email": "analyst@finance.gov.in", "ministry": "Finance", "query": "List all bank account holders with deposits over 10Cr", "flagged": True, "keywords": "bank account", "ms": 2500},
    # Defense Ministry — Normal
    {"email": "analyst@defense.gov.in", "ministry": "Defense", "query": "Summarize DRDO annual report 2024 highlights", "flagged": False, "keywords": "", "ms": 1450},
    {"email": "analyst@defense.gov.in", "ministry": "Defense", "query": "Draft procurement timeline for naval fleet modernization", "flagged": False, "keywords": "", "ms": 1900},
    {"email": "officer@defense.gov.in", "ministry": "Defense", "query": "Generate logistics report for border infrastructure", "flagged": False, "keywords": "", "ms": 1100},
    # Defense — Flagged (High Risk)
    {"email": "analyst@defense.gov.in", "ministry": "Defense", "query": "What is the current troop deployment status on the northern border?", "flagged": True, "keywords": "troop,classified", "ms": 3200},
    {"email": "officer@defense.gov.in", "ministry": "Defense", "query": "Provide details on nuclear submarine capabilities", "flagged": True, "keywords": "nuclear,classified", "ms": 2800},
    {"email": "analyst@defense.gov.in", "ministry": "Defense", "query": "Status of missile defense shield deployment timeline", "flagged": True, "keywords": "missile", "ms": 1600},
    # Health Ministry
    {"email": "officer@health.gov.in", "ministry": "Health", "query": "PMJAY scheme eligibility criteria for rural households", "flagged": False, "keywords": "", "ms": 680},
    {"email": "officer@health.gov.in", "ministry": "Health", "query": "Summarize COVID-19 vaccination coverage data for UP", "flagged": False, "keywords": "", "ms": 920},
    {"email": "analyst@health.gov.in", "ministry": "Health", "query": "Draft inter-ministry health budget proposal", "flagged": False, "keywords": "", "ms": 1340},
    # Law Ministry
    {"email": "officer@law.gov.in", "ministry": "Law", "query": "Analyze Digital Personal Data Protection Act 2023 implications", "flagged": False, "keywords": "", "ms": 1560},
    {"email": "officer@law.gov.in", "ministry": "Law", "query": "Draft RTI response template for infrastructure projects", "flagged": False, "keywords": "", "ms": 870},
    {"email": "analyst@law.gov.in", "ministry": "Law", "query": "What are the key provisions of the IT Amendment Act?", "flagged": False, "keywords": "", "ms": 1020},
    # Education Ministry
    {"email": "officer@education.gov.in", "ministry": "Education", "query": "NEP 2020 implementation status across states", "flagged": False, "keywords": "", "ms": 740},
    {"email": "officer@education.gov.in", "ministry": "Education", "query": "Generate report on Samagra Shiksha Abhiyan outcomes", "flagged": False, "keywords": "", "ms": 1180},
    # General — Mixed
    {"email": "admin@nic.gov.in", "ministry": "General", "query": "System health check and performance diagnostics", "flagged": False, "keywords": "", "ms": 340},
    {"email": "admin@nic.gov.in", "ministry": "General", "query": "Review all flagged queries from last 24 hours", "flagged": False, "keywords": "", "ms": 520},
    # More Flagged entries for demo impact
    {"email": "officer@finance.gov.in", "ministry": "Finance", "query": "Look up PAN number ABCDE1234F linked to this transaction", "flagged": True, "keywords": "pan number", "ms": 1700},
    {"email": "analyst@defense.gov.in", "ministry": "Defense", "query": "Access top secret briefing on Indo-Pacific strategy", "flagged": True, "keywords": "top secret", "ms": 3800},
    {"email": "officer@law.gov.in", "ministry": "Law", "query": "Access cabinet decision minutes from last session", "flagged": True, "keywords": "cabinet decision,confidential", "ms": 2100},
]


@app.on_event("startup")
def on_startup():
    """Create tables and seed demo data on first run."""
    # Pre-initialize RAG singleton
    from services.rag_service import RAGService
    RAGService()

    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Seed demo users
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            test_users = [
                {"email": "admin@nic.gov.in", "password": "admin123", "role": "admin", "ministry": "NIC", "clearance_level": 5},
                {"email": "officer@finance.gov.in", "password": "finance123", "role": "officer", "ministry": "Finance", "clearance_level": 2},
                {"email": "analyst@defense.gov.in", "password": "defense123", "role": "analyst", "ministry": "Defense", "clearance_level": 3},
            ]
            for u in test_users:
                new_user = User(
                    email=u["email"],
                    password_hash=get_password_hash(u["password"]),
                    role=u["role"],
                    ministry=u["ministry"],
                    clearance_level=u.get("clearance_level", 1)
                )
                db.add(new_user)
            db.commit()
            print("Demo users seeded successfully.")
        else:
            print("Users already exist, skipping seed.")
            
        # Seed default policy rules
        if db.query(PolicyRule).count() == 0:
            # Assume user ID 1 is the admin seeded above
            for rule_data in DEFAULT_RULES:
                rule = PolicyRule(
                    **rule_data,
                    created_by=1,
                    is_active=True,
                    trigger_count=0,
                    version=1
                )
                db.add(rule)
            db.commit()
            print(f"Seeded {len(DEFAULT_RULES)} default policy rules")
        
        # Seed audit data for demo
        if db.query(AuditLog).count() == 0:
            base_time = datetime.now() - timedelta(hours=6)
            for i, entry in enumerate(DEMO_AUDIT_ENTRIES):
                timestamp = base_time + timedelta(minutes=random.randint(1, 360))
                log = AuditLog(
                    user_id=1,
                    user_email=entry["email"],
                    ministry=entry["ministry"],
                    query_preview=entry["query"][:100],
                    full_query=entry["query"],
                    response_preview=f"[BharatAI Response for: {entry['query'][:40]}...]",
                    is_flagged=entry["flagged"],
                    sensitivity_keywords_found=entry["keywords"],
                    response_time_ms=entry["ms"],
                    created_at=timestamp,
                )
                db.add(log)
            db.commit()
            print(f"[OK] {len(DEMO_AUDIT_ENTRIES)} realistic audit entries seeded.")
        else:
            print("[OK] Audit data already exists, skipping seed.")

        print("\n--- Registered Routes ---")
        for route in app.routes:
            if hasattr(route, "path"):
                print(f"Path: {route.path}")
        print("-------------------------\n")

    except Exception as e:
        print(f"⚠️ Database seed error: {e}")
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "BharatAI Sovereign AI Platform API is online"}

