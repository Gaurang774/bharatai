# 🇮🇳 BharatAI: Sovereign Intelligence Specification

BharatAI is a secure, localized, and generative intelligence platform designed specifically for the administrative and mission-critical workflows of the Government of India. It eliminates dependency on foreign cloud AI while ensuring absolute data sovereignty.

## 🏛️ The RAG Solution (Retrieval-Augmented Generation)

BharatAI provides a **Mission-Specific Knowledge Engine**. Standard LLMs have generic knowledge; BharatAI uses RAG to ground the AI in actual government documents.

### What problem does it solve?

1.  **Hallucinations**: Traditional AI often makes up facts. BharatAI's RAG forces the AI to check approved PDFs/documents first.
2.  **Document Silos**: Key administrative knowledge is often buried in thousands of PDFs. BharatAI indexes these for instant retrieval.
3.  **Sovereign Compliance**: No data ever leaves the NIC-controlled environment. All indexing and search happen locally.

### How it works:

- **Ingestion**: Admins upload policy documents, court orders, or administrative manuals.
- **Vectorization**: Documents are chunked and turned into "embeddings" using local AI models.
- **Ministry Isolation**: Data is stored in **Ministry-specific namespaces** in ChromaDB (Defense knowledge doesn't leak into Finance).
- **Contextual Synthesis**: When a user asks a question, the system retrieves relevant facts and passes them to Llama3 as the ground truth.

---

## 🛠️ Functional Capabilities

### 1. Secure Sovereign Access

- **Role-Based Control**: Multi-tier access for Officers, Analysts, and Administrators.
- **JWT Security**: All interactions are signed and encrypted via JSON Web Tokens.
- **Safe Termination**: Explicit session killing to ensure no persistent data leaks.

### 2. Intelligent Chat Terminal

- **Dynamic Context Injection**: Automatically tells the AI which ministry the user belongs to.
- **Real-time Streaming**: Word-by-word response generation for a fluid, responsive experience.
- **Large Context Window**: Optimized for analyzing long government policies and legal texts.

### 3. Prompt Governance (The Firewall)

- **Keyword Classification**: Real-time detection of sensitive terms (Classified, Troop movements, Aadhaar, etc.).
- **Institutional Guardrails**: Blocks AI from discussing prohibited topics or generating insecure outputs.
- **Risk Indicator**: Visually flags sensitive responses for human oversight.

### 4. Governance & Audit Terminal

- **Full Transparency**: Logs every single query and AI response across the entire organization.
- **Visual Analytics**: Real-time statistics on system usage, risky queries, and performance metrics.
- **Evidence Export**: Downloadable interaction logs for institutional record-keeping.
- **Document Management**: Centralized hub for managing the sovereign knowledge base.

---

## 💻 Technical Infrastructure

| Layer            | Component         | Description                                                  |
| :--------------- | :---------------- | :----------------------------------------------------------- |
| **Frontend**     | Next.js 14        | Responsive, premium dark-themed interface with Tailwind CSS. |
| **Backend**      | FastAPI           | High-performance Python framework for sovereign scaling.     |
| **Intelligence** | Ollama (Llama3)   | Local LLM running on sovereign hardware (No Cloud API).      |
| **Memory**       | ChromaDB          | Vector database for ministry-specific RAG retrieval.         |
| **Database**     | SQLite/PostgreSQL | Relational storage for audit history and user accounts.      |

---

## 🚀 Deployment & Usage

### 1. Seeding User Data

The system comes pre-configured with secure credentials for demonstration:

- **Admin**: `admin@nic.gov.in` (Pass: `admin123`)
- **Officer**: `officer@finance.gov.in` (Pass: `officer123`)

### 2. Routine Maintenance

- **Ollama**: Ensure the service is running on Port 11434.
- **Storage**: Maintain at least 10GB of free space for local model weights and document vectors.

---

_Created by National Informatics Centre (NIC) | BharatAI Division_
