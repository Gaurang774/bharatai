```latex
% ============================================================================
%  BharatAI — Sovereign Government AI Platform
%  Detailed Project Report
%  Problem Statement: Gov_01 — One Nation. One AI Framework. Total Trust.
% ============================================================================

\documentclass[12pt, a4paper]{article}

% --- Packages ---
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage{geometry}
\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{hyperref}
\usepackage{enumitem}
\usepackage{booktabs}
\usepackage{longtable}
\usepackage{titlesec}
\usepackage{fancyhdr}
\usepackage{float}
\usepackage{tcolorbox}
\usepackage{array}
\usepackage{caption}
\usepackage{tikz}

\geometry{margin=1in}

% --- Colors ---
\definecolor{bharatOrange}{HTML}{FF9933}
\definecolor{bharatGreen}{HTML}{138808}
\definecolor{bharatBlue}{HTML}{000080}
\definecolor{sectionColor}{HTML}{1A1A2E}
\definecolor{accentGold}{HTML}{D4A017}

% --- Header / Footer ---
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\textcolor{bharatBlue}{\textbf{BharatAI — Sovereign Intelligence}}}
\fancyhead[R]{\textcolor{bharatOrange}{Gov\_01}}
\fancyfoot[C]{\thepage}
\renewcommand{\headrulewidth}{1pt}
\renewcommand{\headrule}{\hbox to\headwidth{\textcolor{bharatOrange}{\leaders\hrule height \headrulewidth\hfill}}}

% --- Title Formatting ---
\titleformat{\section}{\Large\bfseries\color{bharatBlue}}{}{0em}{}[\titlerule]
\titleformat{\subsection}{\large\bfseries\color{sectionColor}}{}{0em}{}
\titleformat{\subsubsection}{\normalsize\bfseries\color{bharatGreen}}{}{0em}{}

% --- Hyperlink Setup ---
\hypersetup{
    colorlinks=true,
    linkcolor=bharatBlue,
    urlcolor=bharatGreen,
    citecolor=bharatOrange,
}

% --- Custom Box ---
\newtcolorbox{highlightbox}[1][]{
    colback=bharatOrange!5,
    colframe=bharatOrange,
    fonttitle=\bfseries,
    title=#1,
    arc=3mm,
    boxrule=1pt
}

\newtcolorbox{techbox}[1][]{
    colback=bharatBlue!5,
    colframe=bharatBlue,
    fonttitle=\bfseries,
    title=#1,
    arc=2mm,
    boxrule=0.8pt
}

% ============================================================================
\begin{document}

% --- Title Page ---
\begin{titlepage}
    \centering
    \vspace*{2cm}

    {\Huge\bfseries\textcolor{bharatBlue}{BharatAI}}\\[0.5cm]
    {\Large\textcolor{bharatOrange}{One Nation. One AI Framework. Total Trust.}}\\[1cm]

    \rule{\textwidth}{2pt}\\[0.5cm]

    {\large\textbf{Problem Statement: Gov\_01}}\\[0.3cm]
    {\large Sovereign Government AI Platform for India}\\[1cm]

    \begin{highlightbox}[Mission Statement]
        To build a secure, sovereign, and self-hosted AI intelligence platform
        that empowers Indian government employees to leverage generative AI
        without compromising national data sovereignty, security, or compliance.
    \end{highlightbox}

    \vfill

    {\large\textbf{Team BharatAI}}\\[0.3cm]
    {\normalsize National Informatics Centre (NIC) — Sovereign AI Division}\\[0.3cm]
    {\normalsize February 2026}\\[1cm]

    \rule{\textwidth}{1pt}
\end{titlepage}

% --- Table of Contents ---
\tableofcontents
\newpage

% ============================================================================
\section{Executive Summary}
% ============================================================================

BharatAI is a production-grade, sovereign AI assistant purpose-built for the
administrative and mission-critical workflows of the Government of India. It
provides an end-to-end alternative to foreign commercial AI tools (ChatGPT,
Copilot, Gemini) by running entirely on Indian sovereign infrastructure —
ensuring that \textbf{no government data ever leaves Indian borders}.

The platform combines a locally hosted Large Language Model (LLM), a
Retrieval-Augmented Generation (RAG) engine grounded in official government
documents, a real-time prompt firewall for sensitive content detection, and a
comprehensive governance audit terminal — all deployable on NIC-controlled
hardware with zero dependency on foreign cloud services.

\begin{highlightbox}[Key Value Proposition]
    \textbf{Every query to ChatGPT is a data export.}\\
    \textbf{Every query to BharatAI is a sovereign operation.}
\end{highlightbox}

% ============================================================================
\section{The Current Problem}
% ============================================================================

\subsection{Shadow AI Adoption in Government}

Government employees across ministries and departments are rapidly adopting
advanced public AI tools (e.g., ChatGPT, Microsoft Copilot, Google Gemini) for:

\begin{itemize}[leftmargin=1.5cm]
    \item Policy drafting and analysis
    \item Summarization of large administrative documents
    \item Internal and external communications
    \item Research and data interpretation
    \item Citizen grievance handling
\end{itemize}

This \textbf{shadow adoption} is driven by urgent productivity needs — but it
comes at a \textbf{catastrophic cost to national security}.

\subsection{The Data Sovereignty Crisis}

\begin{techbox}[Critical Risks of Using Foreign AI Tools]
    \begin{enumerate}[leftmargin=1cm]
        \item \textbf{Systemic Data Leakage:} Every query sent to ChatGPT, Copilot,
              or Gemini is routed to foreign servers (USA/Azure Global). Sensitive
              government data leaves sovereign Indian control permanently.

        \item \textbf{Intellectual Property Exfiltration:} Queries related to
              infrastructure policy, tax reform, defense logistics, and citizen
              grievances sent to public LLMs may train foreign commercial models,
              compromising India's strategic advantage.

        \item \textbf{Zero Audit Trail:} Government ministries have \textbf{no
              visibility} into what data is being shared with foreign AI services.
              There is no logging, no compliance, and no accountability.

        \item \textbf{No Ministry Isolation:} Public AI tools have no concept of
              departmental boundaries. Defense-related queries could theoretically
              be accessed alongside finance or health data on the same platform.

        \item \textbf{Foreign Model Lock-in:} Dependence on foreign AI creates a
              strategic vulnerability — policy decisions become reliant on services
              that can be restricted, modified, or discontinued unilaterally.

        \item \textbf{Regulatory Non-Compliance:} Usage of foreign AI tools violates
              multiple Indian data protection and sovereignty frameworks, including
              the Digital Personal Data Protection Act (DPDP), 2023.
    \end{enumerate}
\end{techbox}

% ============================================================================
\section{What Problem Are We Solving}
% ============================================================================

BharatAI directly addresses the Gov\_01 problem statement:

\begin{center}
    \textit{``Uncontrolled usage creates systemic data leakage and untracked
    exfiltration of state intellectual property. Queries related to
    infrastructure, tax policy, defense logistics, and citizen grievances sent
    to public LLMs may train foreign commercial models, compromising India's
    digital sovereignty and competitive edge.''}
\end{center}

\subsection{Our Solution: A Sovereign AI Framework}

We provide a \textbf{complete, self-hosted AI platform} that delivers:

\begin{enumerate}[leftmargin=1.5cm]
    \item \textbf{100\% Data Sovereignty:} All AI inference runs on local
          hardware. Zero external API calls. Works fully offline and air-gapped.

    \item \textbf{Ministry-Isolated Intelligence:} Each ministry gets its own
          isolated knowledge namespace. Defense data never touches Finance.
          Health data never leaks to Commerce.

    \item \textbf{Prompt Security Firewall:} Real-time detection and blocking of
          sensitive government keywords (Classified, Aadhaar, Troop Movements,
          Nuclear, Cabinet Decisions, etc.) with configurable policy rules.

    \item \textbf{Retrieval-Augmented Generation (RAG):} AI responses are
          grounded in actual, verified government documents — not internet
          hallucinations. Admins upload policy PDFs which are chunked, vectorized,
          and stored locally.

    \item \textbf{Full Governance \& Audit Trail:} Every single query, response,
          risk flag, and user action is logged with timestamps for institutional
          accountability and evidence export.

    \item \textbf{PII Redaction Engine:} Automatic detection and redaction of
          Aadhaar numbers, PAN numbers, phone numbers, and email addresses from
          all AI interactions.
\end{enumerate}

% ============================================================================
\section{Why Is This Usable}
% ============================================================================

BharatAI is not a research prototype — it is a \textbf{production-ready platform}
designed for real government workflows:

\subsection{User Experience}

\begin{itemize}[leftmargin=1.5cm]
    \item \textbf{Familiar Chat Interface:} Premium dark-themed UI that mirrors
          the experience of ChatGPT — minimal learning curve for government staff.
    \item \textbf{Real-Time Streaming:} Word-by-word response generation for a
          fluid, responsive experience identical to commercial AI tools.
    \item \textbf{Hindi \& Regional Language Support:} Native bilingual interface
          supporting Hindi and English for inclusive adoption across ministries.
    \item \textbf{Role-Based Access:} Multi-tier access control for Officers,
          Analysts, and Administrators with JWT-secured authentication.
    \item \textbf{Document Upload:} Admin panel for uploading PDFs, policy
          documents, and administrative manuals into the sovereign knowledge base.
\end{itemize}

\subsection{Deployment Simplicity}

\begin{itemize}[leftmargin=1.5cm]
    \item \textbf{One-Command Deployment:} Entire platform launches with a single
          \texttt{docker-compose up --build} command.
    \item \textbf{No Cloud Dependencies:} Runs entirely on-premise using Docker
          containers. Compatible with NIC data centres and government hardware.
    \item \textbf{GPU Optional:} Works on CPU-only hardware; NVIDIA GPU support
          available for accelerated inference when available.
    \item \textbf{Minimal Storage:} Requires only 10GB of free space for model
          weights and document vectors.
\end{itemize}

% ============================================================================
\section{Existing Solutions \& Alternatives}
% ============================================================================

\begin{longtable}{|p{3cm}|p{3.5cm}|p{3.5cm}|p{3.5cm}|}
    \hline
    \rowcolor{bharatBlue!10}
    \textbf{Feature} & \textbf{ChatGPT / Copilot / Gemini} & \textbf{Open-Source LLMs (Raw)} & \textbf{BharatAI} \\
    \hline
    Data stays in India & \textcolor{red}{\textbf{No}} — routed to US servers & \textcolor{bharatGreen}{\textbf{Yes}} — if self-hosted & \textcolor{bharatGreen}{\textbf{Yes}} — by design \\
    \hline
    Works offline (air-gapped) & \textcolor{red}{\textbf{No}} & \textcolor{bharatGreen}{\textbf{Yes}} & \textcolor{bharatGreen}{\textbf{Yes}} \\
    \hline
    Ministry-level data isolation & \textcolor{red}{\textbf{No}} & \textcolor{red}{\textbf{No}} — needs custom dev & \textcolor{bharatGreen}{\textbf{Yes}} — built-in \\
    \hline
    Prompt security firewall & \textcolor{red}{\textbf{No}} & \textcolor{red}{\textbf{No}} — needs custom dev & \textcolor{bharatGreen}{\textbf{Yes}} — 15+ keyword rules \\
    \hline
    Full audit trail & \textcolor{red}{\textbf{No}} & \textcolor{red}{\textbf{No}} — needs custom dev & \textcolor{bharatGreen}{\textbf{Yes}} — real-time logging \\
    \hline
    PII redaction & \textcolor{red}{\textbf{No}} & \textcolor{red}{\textbf{No}} — needs custom dev & \textcolor{bharatGreen}{\textbf{Yes}} — Aadhaar, PAN, etc. \\
    \hline
    Hindi / Regional language & {\textbf{Partial}} & {\textbf{Model dependent}} & \textcolor{bharatGreen}{\textbf{Native support}} \\
    \hline
    Custom knowledge base (RAG) & \textcolor{red}{\textbf{No}} & \textcolor{red}{\textbf{No}} — significant dev & \textcolor{bharatGreen}{\textbf{Yes}} — hybrid search \\
    \hline
    Government compliance & \textcolor{red}{\textbf{No}} & \textcolor{red}{\textbf{No}} — raw tool & \textcolor{bharatGreen}{\textbf{Yes}} — DPDP ready \\
    \hline
    Production-ready UI & \textcolor{bharatGreen}{\textbf{Yes}} & \textcolor{red}{\textbf{No}} — CLI only & \textcolor{bharatGreen}{\textbf{Yes}} — premium UI \\
    \hline
    One-click deployment & \textcolor{bharatGreen}{\textbf{Yes}} (SaaS) & \textcolor{red}{\textbf{No}} — expert setup & \textcolor{bharatGreen}{\textbf{Yes}} — Docker Compose \\
    \hline
    Free from foreign lock-in & \textcolor{red}{\textbf{No}} & \textcolor{bharatGreen}{\textbf{Yes}} & \textcolor{bharatGreen}{\textbf{Yes}} \\
    \hline
\end{longtable}

% ============================================================================
\section{Why BharatAI Is Unique}
% ============================================================================

\subsection{Purpose-Built for Indian Governance}

Unlike generic AI tools, BharatAI is architected \textit{from the ground up} for
the specific needs of Indian government administration:

\begin{enumerate}[leftmargin=1.5cm]
    \item \textbf{Sovereign-First Architecture:} Not a wrapper around a foreign
          API. The entire AI stack — from the LLM to the vector database to the
          embedding model — runs on Indian hardware.

    \item \textbf{Dynamic Policy Engine:} Database-driven policy rules with
          clearance-level enforcement, auto-redaction, and full explainability.
          Rules can be configured per ministry without code changes.

    \item \textbf{Hybrid RAG Pipeline:} Combines semantic vector search (ChromaDB)
          with BM25 keyword search and cross-encoder reranking for superior
          document retrieval accuracy — far beyond basic RAG implementations.

    \item \textbf{India-Specific PII Detection:} Built-in regex patterns for
          Aadhaar (12-digit), PAN (ABCDE1234F), Indian mobile numbers (10-digit
          starting with 6-9), and email addresses — automatically redacted in
          real-time.

    \item \textbf{Ministry Namespace Isolation:} ChromaDB collections are
          partitioned by ministry. A Defense query cannot retrieve Finance
          documents and vice versa. This is enforced at the database level.

    \item \textbf{Complete Audit Infrastructure:} Every interaction is logged with
          user identity, ministry context, query content, AI response, sensitivity
          keywords detected, risk level, and response time — exportable for
          compliance reporting.
\end{enumerate}

\subsection{Competitive Differentiators}

\begin{highlightbox}[What Makes BharatAI Different]
    \begin{itemize}
        \item \textbf{Not just a chatbot} — it is a governed intelligence platform
        \item \textbf{Not just open-source LLMs} — it adds policy enforcement, audit, and RAG
        \item \textbf{Not just self-hosted} — it is ministry-isolated and compliance-ready
        \item \textbf{Not just a prototype} — it is Docker-deployable production software
    \end{itemize}
\end{highlightbox}

% ============================================================================
\section{Prototype Screenshots}
% ============================================================================

% --- Prototype Image 1: Login Page ---
\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\vspace{5cm}\centering
        \textit{[Insert Prototype Screenshot Here]}
    \vspace{5cm}}}
    \caption{\textbf{Login Page} — Secure JWT-authenticated login interface with
    role-based access for government employees. Supports Admin, Officer, and
    Analyst roles with ministry-specific credentials.}
    \label{fig:login}
\end{figure}

\newpage

% --- Prototype Image 2: Chat Dashboard ---
\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\vspace{5cm}\centering
        \textit{[Insert Prototype Screenshot Here]}
    \vspace{5cm}}}
    \caption{\textbf{Chat Dashboard} — The sovereign AI chat terminal with
    real-time streaming responses, ministry context injection, conversation
    history sidebar, and Hindi/English language toggle. Sensitive queries are
    flagged with visual risk indicators.}
    \label{fig:chat}
\end{figure}

\newpage

% --- Prototype Image 3: Admin Panel ---
\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\vspace{5cm}\centering
        \textit{[Insert Prototype Screenshot Here]}
    \vspace{5cm}}}
    \caption{\textbf{Admin Governance Panel} — Real-time audit dashboard showing
    all user interactions, risk-flagged queries, system usage statistics,
    performance metrics, and document management interface for uploading policy
    PDFs into the sovereign RAG knowledge base.}
    \label{fig:admin}
\end{figure}

\newpage

% --- Prototype Image 4: Prompt Firewall in Action ---
\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\vspace{5cm}\centering
        \textit{[Insert Prototype Screenshot Here]}
    \vspace{5cm}}}
    \caption{\textbf{Prompt Firewall — Sensitive Query Detection} — Demonstration
    of the real-time prompt governance system detecting sensitive keywords
    (e.g., ``classified'', ``troop movements'', ``Aadhaar number'') and applying
    appropriate policy actions: BLOCK, REDACT, FLAG, or WARN with full
    explainability.}
    \label{fig:firewall}
\end{figure}

% ============================================================================
\section{Frequently Asked Questions (FAQ)}
% ============================================================================

\subsection{General Questions}

\begin{enumerate}[leftmargin=1.5cm, label=\textbf{Q\arabic*.}]
    \item \textbf{What is BharatAI?}\\
    BharatAI is a sovereign, self-hosted AI assistant designed exclusively for
    Indian government employees. It provides the same generative AI capabilities
    as ChatGPT — policy drafting, summarization, analysis — but runs entirely on
    Indian infrastructure with zero data leaving the country.

    \item \textbf{Why can't government employees just use ChatGPT?}\\
    Every query sent to ChatGPT is processed on foreign servers (primarily in the
    USA). Government queries about defense, tax policy, infrastructure, and
    citizen data are effectively exported to foreign corporations. This creates
    untracked data leakage, violates sovereignty principles, and potentially
    trains foreign AI models on Indian state intellectual property.

    \item \textbf{Is BharatAI as good as ChatGPT?}\\
    BharatAI uses Meta's Llama 3 model, which is a state-of-the-art open-source
    LLM competitive with GPT-3.5/4 on many tasks. Additionally, BharatAI
    enhances the LLM with RAG (grounding responses in actual government
    documents), which ChatGPT cannot do with internal ministry data.

    \item \textbf{Can BharatAI work without internet?}\\
    Yes. BharatAI is fully air-gapped capable. All components — the LLM, vector
    database, embedding models, and application servers — run locally. It is
    ideal for secure government networks with restricted internet access.

    \item \textbf{How is data kept secure between ministries?}\\
    BharatAI uses ministry-specific namespaced collections in ChromaDB. Documents
    uploaded by the Defense ministry are stored in a completely separate vector
    space from Finance or Health documents. Cross-ministry data access is
    impossible at the database level.

    \item \textbf{What happens if an employee asks about classified information?}\\
    The Prompt Firewall detects sensitive keywords in real-time. Depending on the
    policy rule configuration, the system will either BLOCK the query entirely,
    REDACT sensitive portions, FLAG it for admin oversight, or WARN the user.
    All flagged interactions are logged in the audit trail.
\end{enumerate}

\subsection{Technical Questions}

\begin{enumerate}[leftmargin=1.5cm, label=\textbf{Q\arabic*.}]
    \item \textbf{What AI model does BharatAI use?}\\
    BharatAI uses Meta's \textbf{Llama 3} running via \textbf{Ollama} — a local
    LLM runtime. The model runs entirely on the host machine with no external
    API calls. It supports streaming, context windows up to 8K tokens, and
    temperature-controlled generation.

    \item \textbf{What is the RAG pipeline?}\\
    RAG (Retrieval-Augmented Generation) grounds AI responses in real documents:
    \begin{itemize}
        \item \textbf{Ingestion:} PDFs are uploaded → extracted → chunked → embedded
        \item \textbf{Storage:} Embeddings stored in ChromaDB with ministry namespaces
        \item \textbf{Retrieval:} Hybrid search (Vector + BM25) with cross-encoder reranking
        \item \textbf{Generation:} Retrieved context injected into LLM prompt as ground truth
    \end{itemize}

    \item \textbf{What database systems are used?}\\
    \begin{itemize}
        \item \textbf{PostgreSQL / SQLite:} For user accounts, audit logs, conversations, and policy rules
        \item \textbf{ChromaDB:} Vector database for document embeddings and semantic search
        \item \textbf{BM25 Index:} In-memory keyword index for hybrid search retrieval
    \end{itemize}

    \item \textbf{How is the system deployed?}\\
    BharatAI uses Docker Compose with 5 containerized services: PostgreSQL,
    ChromaDB, Ollama (LLM Runtime), FastAPI Backend, and Next.js Frontend. A
    single \texttt{docker-compose up --build} command starts the entire platform.

    \item \textbf{What are the hardware requirements?}\\
    \begin{itemize}
        \item \textbf{Minimum:} 8GB RAM, 4-core CPU, 10GB storage (CPU inference)
        \item \textbf{Recommended:} 16GB RAM, 8-core CPU, NVIDIA GPU (6GB+ VRAM), 50GB storage
        \item \textbf{Production:} 32GB+ RAM, NVIDIA A100/H100 GPU, NIC data centre deployment
    \end{itemize}
\end{enumerate}

% ============================================================================
\section{Technical Architecture (Competition Details)}
% ============================================================================

\subsection{System Architecture Overview}

\begin{techbox}[High-Level Architecture]
\begin{verbatim}
+---------------------------------------+
|          Next.js 14 Frontend          |
|  (Chat UI, Admin Panel, Auth, i18n)   |
+-------------------+-------------------+
                    |  REST API (JWT Secured)
                    v
+-------------------+-------------------+
|           FastAPI Backend             |
|  Auth | Chat Orchestrator | Firewall  |
|  Audit Service | RAG Logic | Policy   |
+-----+--------+--------+------+-------+
      |        |        |      |
      v        v        v      v
+------+ +--------+ +------+ +-------+
|Postgr| |ChromaDB| |Ollama| | BM25  |
|  SQL | |(Vector | |(Llama| |(Keyword|
|(RBAC)| | Store) | |  3)  | | Index)|
+------+ +--------+ +------+ +-------+
\end{verbatim}
\end{techbox}

\subsection{Technology Stack}

\begin{longtable}{|p{3cm}|p{3.5cm}|p{7cm}|}
    \hline
    \rowcolor{bharatBlue!10}
    \textbf{Layer} & \textbf{Technology} & \textbf{Purpose} \\
    \hline
    Frontend & Next.js 14, Tailwind CSS, Lucide React, Framer Motion &
    Premium dark-themed responsive interface with chat streaming, admin
    dashboard, and bilingual support (Hindi/English) \\
    \hline
    Backend & FastAPI (Python), SQLAlchemy, Pydantic, JWT &
    High-performance async API server with ORM, request validation, and
    token-based authentication \\
    \hline
    LLM Runtime & Ollama (Llama 3) &
    Local LLM inference engine running Meta's Llama 3 model with streaming
    support, temperature control (0.3), and 2048 token prediction window \\
    \hline
    Vector DB & ChromaDB &
    Ministry-namespaced vector database storing document embeddings for
    semantic similarity search \\
    \hline
    Embeddings & Local Embedding Model via Ollama &
    Document and query embeddings generated locally — no external API calls \\
    \hline
    Keyword Search & BM25Okapi (rank-bm25) &
    Classic keyword matching for hybrid search, combining with vector search
    for superior retrieval accuracy \\
    \hline
    Relational DB & PostgreSQL / SQLite &
    User accounts, RBAC roles, audit logs, conversation history, document
    metadata, and policy rules \\
    \hline
    Containerization & Docker, Docker Compose &
    5-service orchestration: DB, ChromaDB, Ollama, Backend, Frontend with
    persistent volumes and health checks \\
    \hline
\end{longtable}

\subsection{Backend Service Architecture}

\begin{longtable}{|p{3.5cm}|p{10cm}|}
    \hline
    \rowcolor{bharatGreen!10}
    \textbf{Service} & \textbf{Description} \\
    \hline
    \texttt{llm\_service.py} &
    Manages connection to local Ollama instance. Handles streaming response
    generation with configurable temperature (0.3) and prediction window
    (2048 tokens). Includes graceful fallback to mock responses if Ollama
    is unavailable. \\
    \hline
    \texttt{rag\_service.py} &
    Production RAG pipeline with hybrid search (vector + BM25), cross-encoder
    reranking, query caching, smart chunking, and context window management
    (6000 char budget). Singleton pattern for resource efficiency. Full
    document ingestion pipeline: Extract → Clean → Chunk → Embed → Store. \\
    \hline
    \texttt{policy\_engine.py} &
    Dynamic policy enforcement engine with database-driven rules. Supports
    four policy actions: BLOCK (highest priority), REDACT (auto-clean PII),
    FLAG (allow but log), WARN (alert user). Clearance-level enforcement
    with human-readable explanations for every decision. \\
    \hline
    \texttt{classifier.py} &
    Prompt classification service scanning for 15+ sensitive government
    keywords (Aadhaar, PAN, Troop, Missile, Classified, Nuclear, Defense
    Budget, Tax Evasion, etc.) with three-tier sensitivity levels: Low,
    Medium, High. \\
    \hline
    \texttt{redaction\_service.py} &
    PII redaction engine with India-specific regex patterns for Aadhaar
    numbers (12-digit), PAN numbers (ABCDE1234F format), Indian mobile
    numbers (10-digit, 6-9 prefix), and email addresses. Replaces detected
    PII with tagged redaction markers. \\
    \hline
    \texttt{audit\_service.py} &
    Comprehensive interaction logging service capturing user identity,
    ministry context, query content (preview + full), AI response preview,
    sensitivity keywords found, flagged status, and response time in
    milliseconds. \\
    \hline
    \texttt{auth\_service.py} &
    JWT-based authentication with role-based access control (Admin, Officer,
    Analyst). Secure password hashing and token management with configurable
    expiration. \\
    \hline
\end{longtable}

\subsection{Data Models}

\begin{longtable}{|p{3cm}|p{10.5cm}|}
    \hline
    \rowcolor{accentGold!15}
    \textbf{Model} & \textbf{Fields \& Purpose} \\
    \hline
    \texttt{User} &
    id, email, hashed\_password, role (Admin/Officer/Analyst), ministry,
    clearance\_level, is\_active, created\_at \\
    \hline
    \texttt{AuditLog} &
    id, user\_id, user\_email, ministry, query\_preview, full\_query,
    response\_preview, is\_flagged, sensitivity\_keywords\_found,
    response\_time\_ms, timestamp \\
    \hline
    \texttt{Conversation} &
    id, user\_id, title, messages (JSON), ministry\_context, created\_at,
    updated\_at \\
    \hline
    \texttt{Document} &
    id, filename, ministry, doc\_type, chunk\_count, uploaded\_by,
    uploaded\_at, status \\
    \hline
    \texttt{PolicyRule} &
    id, name, description, ministry\_scope, keywords, action
    (BLOCK/REDACT/FLAG/WARN), clearance\_required, is\_active, priority,
    created\_at \\
    \hline
\end{longtable}

\subsection{API Endpoints}

\begin{longtable}{|p{2cm}|p{4cm}|p{7.5cm}|}
    \hline
    \rowcolor{bharatOrange!10}
    \textbf{Method} & \textbf{Endpoint} & \textbf{Description} \\
    \hline
    POST & \texttt{/auth/register} & Register new government user \\
    \hline
    POST & \texttt{/auth/login} & JWT token authentication \\
    \hline
    GET & \texttt{/auth/me} & Get current user profile \\
    \hline
    POST & \texttt{/chat/} & Send message with streaming AI response \\
    \hline
    GET & \texttt{/chat/conversations} & List user's conversations \\
    \hline
    GET & \texttt{/chat/conversations/\{id\}} & Get conversation history \\
    \hline
    POST & \texttt{/documents/upload} & Upload PDF to sovereign RAG \\
    \hline
    GET & \texttt{/documents/} & List uploaded documents \\
    \hline
    GET & \texttt{/audit/logs} & Get audit logs (Admin only) \\
    \hline
    GET & \texttt{/audit/stats} & Get system statistics (Admin only) \\
    \hline
\end{longtable}

\subsection{Security Architecture}

\begin{highlightbox}[Multi-Layer Security Model]
    \begin{enumerate}
        \item \textbf{Authentication Layer:} JWT tokens with configurable expiration,
              secure password hashing (bcrypt), and role-based access control.
        \item \textbf{Prompt Firewall Layer:} Real-time keyword classification with
              15+ sensitive term patterns and three-tier sensitivity scoring.
        \item \textbf{Policy Engine Layer:} Database-driven, ministry-scoped policy
              rules with four action types and clearance-level enforcement.
        \item \textbf{PII Redaction Layer:} Automatic detection and replacement of
              Aadhaar, PAN, phone numbers, and email addresses.
        \item \textbf{Data Isolation Layer:} Ministry-namespaced ChromaDB collections
              preventing cross-department data access.
        \item \textbf{Audit Layer:} Complete interaction logging with query content,
              response content, risk level, and performance metrics.
        \item \textbf{Infrastructure Layer:} Air-gapped deployment capability with
              Docker containerization and no external network dependencies.
    \end{enumerate}
\end{highlightbox}

% ============================================================================
\section{Impact \& Future Roadmap}
% ============================================================================

\subsection{Immediate Impact}

\begin{itemize}[leftmargin=1.5cm]
    \item \textbf{Data Protection:} Prevents leakage of sensitive government data
          to foreign AI corporations.
    \item \textbf{Regulatory Compliance:} Aligns with DPDP Act 2023 and
          government data localization mandates.
    \item \textbf{Productivity:} Gives government employees AI-powered productivity
          without compromising security.
    \item \textbf{Accountability:} Full audit trail enables institutional oversight
          and evidence-based governance.
\end{itemize}

\subsection{Future Roadmap}

\begin{enumerate}[leftmargin=1.5cm]
    \item \textbf{Multi-Model Support:} Integration with Mistral, Phi-3, and
          Indian language-optimized models.
    \item \textbf{Advanced Analytics:} ML-based anomaly detection on audit logs
          for proactive threat identification.
    \item \textbf{Federation:} Secure inter-ministry knowledge sharing with
          cryptographic access controls.
    \item \textbf{Mobile App:} Secure mobile client for field officers and remote
          government employees.
    \item \textbf{Voice Interface:} Hindi and regional language voice input for
          accessibility in rural administrative offices.
    \item \textbf{NIC Cloud Integration:} Native deployment on MeghRaj (GI Cloud)
          for pan-India scalability.
\end{enumerate}

% ============================================================================
\section{Conclusion}
% ============================================================================

BharatAI represents a paradigm shift in how Indian government institutions
interact with artificial intelligence. By providing a sovereign, auditable, and
ministry-isolated AI platform, we eliminate the existential risk of data
exfiltration while empowering government employees with world-class generative
AI capabilities.

\begin{center}
    \textbf{\large\textcolor{bharatBlue}{One Nation. One AI Framework. Total Trust.}}
\end{center}

\vspace{1cm}

\begin{center}
    \rule{0.5\textwidth}{1pt}\\[0.5cm]
    \textbf{BharatAI — Sovereign Intelligence Platform}\\
    National Informatics Centre (NIC)\\
    Government of India\\[0.3cm]
    \textcolor{bharatGreen}{\texttt{Secure Sovereign Mode}} \textcolor{bharatGreen}{$\bullet$}
\end{center}

\end{document}
```
