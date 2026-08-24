# BharatAI — Sovereign Government AI Platform

BharatAI is a secure, sovereign AI assistant designed for Indian government employees. It provides a production-ready alternative to external AI tools, ensuring that all data remains within Indian infrastructure.

## 🏛️ Architecture

```
+---------------------------------------+
|            Next.js Frontend           |
|  (Chat UI, Admin Panel, Auth handling)|
+-------------------+-------------------+
                    |
                    v
+-------------------+-------------------+
|            FastAPI Backend            |
| (Auth, Chat Orchestrator, Firewall,   |
|  Audit Service, RAG Logic)            |
+----------+--------+---------+---------+
           |        |         |
           v        v         v
    +------+---+ +--+-----+ +-+-------+
    |PostgreSQL| |ChromaDB| | Ollama  |
    | (Users,  | |(Vector  | |(Llama3  |
    |  Logs)   | | Store)  | | Local)  |
    +----------+ +---------+ +---------+
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Lucide React, Framer Motion
- **Backend**: FastAPI, SQLAlchemy, JWT, LangChain
- **AI/ML**: Ollama (Llama 3), ChromaDB (Vector DB)
- **Infrastructure**: Docker, PostgreSQL

## 🚀 Setup Instructions

### Prerequisites

- Docker & Docker Compose
- [Ollama](https://ollama.com/) installed and running locally
- Run `ollama pull llama3`

### Run with Docker (Recommended)

1. Clone the repository.
2. Ensure Ollama is running on your host machine.
3. Run orchestration:
   ```bash
   docker-compose up --build
   ```
4. Access BharatAI:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`

### Manual Setup (For Development)

**Backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## 🔑 Test User Credentials

| Email                  | Password   | Role    | Ministry |
| ---------------------- | ---------- | ------- | -------- |
| admin@nic.gov.in       | admin123   | Admin   | NIC      |
| officer@finance.gov.in | finance123 | Officer | Finance  |
| analyst@defense.gov.in | defense123 | Analyst | Defense  |

## 🛡️ Key Features

- **Prompt Firewall**: Scans for 15+ sensitive government keywords (e.g., Aadhaar, classified).
- **Ministry Context**: Tailors LLM responses based on selected ministry.
- **Sovereign RAG**: Upload PDFs to the Admin Panel for ministry-specific knowledge retrieval.
- **Document Vault**: Upload PDFs directly within the chat interface for isolated, multi-document intelligence retrieval.
- **Dynamic Prompt Suggestions**: Automatically tailors initial chat prompts based on the authenticated user's assigned Ministry.
- **Dynamic Web Search Fallback**: Seamlessly falls back to public internet searches via DuckDuckGo when internal RAG yields no context, strictly isolating unverified sources.
- **Full Audit**: Admin dashboard monitors every interaction with real-time risk flagging and external search tracking.

---

&copy; 2024 National Informatics Centre (NIC) | Secure Sovereign Mode 🟢
