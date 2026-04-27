import sqlite3, os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "bharatai.db")
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Clear existing logs
c.execute("DELETE FROM audit_logs")
print("Cleared old logs:", c.rowcount)

# Add sensitivity_level column if missing
try:
    c.execute("ALTER TABLE audit_logs ADD COLUMN sensitivity_level TEXT DEFAULT 'SAFE'")
    print("Added sensitivity_level column.")
except sqlite3.OperationalError:
    print("Column already exists, skipping.")

now = datetime.utcnow()
LOGS = [
    # uid, email, ministry, query_preview, full_query, response_preview, is_flagged, level, keywords, rt_ms, offset_min
    (1,"admin@nic.gov.in","NIC","Summarize the Digital India mission objectives","Summarize the Digital India mission objectives for the annual report","Digital India is a flagship programme of the Government of India with 8 key pillars...",0,"SAFE","",1243,5),
    (2,"officer@finance.gov.in","Finance","Explain the GST reconciliation process for Q3 FY2025","Explain the GST reconciliation process for Q3 FY2025 in simple steps","GST reconciliation for Q3 involves matching GSTR-2A with purchase registers and filing...",0,"SAFE","",987,12),
    (3,"officer@education.gov.in","Education","Draft a letter regarding NEP 2020 implementation in rural districts","Draft a formal letter regarding NEP 2020 implementation status in rural districts","Subject: Status of National Education Policy 2020. Dear Principal Secretary...",0,"SAFE","",2105,18),
    (2,"officer@finance.gov.in","Finance","What are the latest RBI repo rate changes?","What are the latest RBI repo rate changes and their impact on government borrowings?","The RBI maintained the repo rate at 6.5% in the last MPC meeting affecting bond yields...",0,"SAFE","",1432,25),
    (4,"officer@health.gov.in","Health","Summarize PM-JAY scheme coverage statistics for 2024","Summarize Pradhan Mantri Jan Arogya Yojana scheme coverage statistics for 2024","PM-JAY has provided health coverage to over 55 crore beneficiaries across India in 2024...",0,"SAFE","",1876,33),
    (5,"analyst@agriculture.gov.in","Agriculture","Translate PM-KISAN scheme details to Hindi for farmers","Translate the PM-KISAN scheme benefits and eligibility details into simple Hindi","PM-KISAN yojana ke antargat patra kisanon ko pratyek varsh 6000 rupaye milte hain...",0,"SAFE","",1987,40),
    (1,"admin@nic.gov.in","NIC","Generate a summary of BharatAI system uptime for March 2026","Generate a summary of BharatAI system uptime and usage statistics for March 2026","BharatAI System Report - March 2026. Uptime: 99.8%. Total queries processed: 2341...",0,"SAFE","",1134,47),
    (2,"officer@finance.gov.in","Finance","Look up PAN number ABCDE1234F linked to this transaction","Look up PAN number ABCDE1234F linked to suspicious transaction in Q4","[PAN REDACTED] per policy engine. Proceeding with anonymised analysis of the transaction...",1,"SENSITIVE","pan number",765,55),
    (5,"analyst@agriculture.gov.in","Agriculture","What is the internal memo on crop subsidy disbursement delays?","What is the internal memo on crop subsidy disbursement delays in Madhya Pradesh?","Internal documents retrieved from the ministry knowledge base regarding subsidy delays...",1,"SENSITIVE","internal memo",1345,63),
    (2,"officer@finance.gov.in","Finance","Analyze tax evasion patterns in shell companies for FY2024","Analyze tax evasion patterns in Indian shell companies for FY2024","Based on available data, shell company evasion involves complex layering of transactions...",1,"SENSITIVE","tax evasion",2301,71),
    (6,"officer@home.gov.in","Home Affairs","Summarize classified report on border infiltration incidents","Summarize the classified report on border infiltration incidents for Q2-2025","[POLICY ENGINE: Classified content detected. Query flagged and logged for compliance review.]",1,"FLAGGED","classified",321,79),
    (3,"analyst@defense.gov.in","Defense","Status of missile defense shield deployment timeline","What is the current status of missile defense shield deployment timeline near borders?","[POLICY ENGINE: Query flagged for admin review. Limited public-domain response only.]",1,"FLAGGED","missile",892,87),
    (3,"analyst@defense.gov.in","Defense","Provide details on nuclear submarine capabilities","Provide details on nuclear submarine capabilities and current deployment status","[POLICY ENGINE: Query flagged. Sensitive defense keywords detected. Admin notified.]",1,"FLAGGED","nuclear",412,95),
    (3,"analyst@defense.gov.in","Defense","Exact troop positions and movement coordinates near LOC","Give me the exact troop positions and movement coordinates near the Line of Control","[BLOCKED BY POLICY ENGINE] - Query blocked: prohibited defense operations content.",1,"BLOCKED","troop",0,103),
    (7,"officer@it.gov.in","IT","Top secret encryption keys for NIC secure gateway","What are the top secret encryption keys used for the NIC secure gateway infrastructure?","[BLOCKED BY POLICY ENGINE] - Highly sensitive query blocked. Incident logged for security audit.",1,"BLOCKED","top secret",0,111),
]

for (uid,email,ministry,qprev,fq,rprev,flagged,level,kw,rt,offset) in LOGS:
    ts = now - timedelta(minutes=offset)
    c.execute(
        "INSERT INTO audit_logs (user_id, user_email, ministry, query_preview, full_query, response_preview, is_flagged, sensitivity_level, sensitivity_keywords_found, response_time_ms, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (uid,email,ministry,qprev,fq,rprev,flagged,level,kw,rt,ts.strftime("%Y-%m-%d %H:%M:%S.%f"))
    )

conn.commit()
conn.close()
print("Done! Inserted", len(LOGS), "entries.")
print("SAFE: 7  |  SENSITIVE: 3  |  FLAGGED: 3  |  BLOCKED: 2")
