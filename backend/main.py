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

from routers import auth, chat, audit, documents, models
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
                {"email": "admin@nic.gov.in", "password": "admin123", "role": "admin", "ministry": "NIC"},
                {"email": "officer@finance.gov.in", "password": "finance123", "role": "officer", "ministry": "Finance"},
                {"email": "analyst@defense.gov.in", "password": "defense123", "role": "analyst", "ministry": "Defense"},
            ]
            for u in test_users:
                new_user = User(
                    email=u["email"],
                    password_hash=get_password_hash(u["password"]),
                    role=u["role"],
                    ministry=u["ministry"]
                )
                db.add(new_user)
            db.commit()
            print("Demo users seeded successfully.")
        else:
            print("Users already exist, skipping seed.")
        
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

    except Exception as e:
        print(f"⚠️ Database seed error: {e}")
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "BharatAI Sovereign AI Platform API is online"}

