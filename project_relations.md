# BharatAI Project Relationships & Dependency Map

This document maps the relationships and data flow between all the major files in the BharatAI frontend and backend. 

**Use this file as a reference:** Before making changes to a core file, search this document to see what other files depend on it to prevent breaking the application.

---

## 1. Backend Architecture Flow

The backend is built with FastAPI and follows a Controller-Service-Model architecture.

### Routers (Controllers) -> Services -> Models
- **`main.py`** 
  - **Mounts**: `auth.py`, `chat.py`, `documents.py`, `audit.py`
  - **Dependencies**: Initializes the database schema from `database.py`.

- **`routers/chat.py`** (Core Orchestrator)
  - **Depends on**: `services/rag_service.py`, `services/llm_service.py`, `services/audit_service.py`
  - **DB Models**: `models/conversation.py`
  - **Effect**: If the return signature of `rag_service.retrieve_context` or `perform_web_search` changes, `chat.py` MUST be updated.

- **`routers/documents.py`**
  - **Depends on**: `services/rag_service.py` (specifically `ingest_document`)
  - **DB Models**: `models/document.py`
  - **Effect**: If `ingest_document` requires new arguments (e.g., `doc_type`), `documents.py` MUST be updated.

- **`routers/auth.py`**
  - **Depends on**: `services/auth_service.py`
  - **DB Models**: `models/user.py`

### Internal Service Dependencies
- **`services/rag_service.py`** (Most complex service)
  - **Depends on**: `embeddings_service.py`, `chunking_service.py`, `reranker_service.py`, `utils/pdf_extractor.py`.
  - **Effect**: Changes here cascade up to `chat.py` and `documents.py`.

---

## 2. Frontend Architecture Flow

The frontend is built with Next.js App Router and React context.

### Pages -> Layouts & Smart Components
- **`app/dashboard/page.tsx`** (Main Chat View)
  - **Depends on**: `ChatWindow.tsx`, `ChatInput.tsx`, `SensitiveWarning.tsx`, `Sidebar.tsx`, `TopBar.tsx`.
  - **API Lib**: `lib/api.ts` (`chatApi.sendMessage`, `documentApi.upload`).
  - **State Flow**: State lives here (e.g., `messages`, `isLoading`). If you change the `Message` interface, you MUST update `MessageBubble.tsx` and the state array here.

- **`app/admin/page.tsx`** (Admin Oversight)
  - **Depends on**: `AuditTable.tsx`, `StatsCards.tsx`, `FilterBar.tsx`.
  - **API Lib**: `lib/api.ts` (`adminApi.getLogs`, `adminApi.getStats`).

- **`app/documents/page.tsx`** (Document Vault)
  - **Depends on**: `documents/` components.
  - **API Lib**: `lib/api.ts` (`documentApi.list`).

### Component Relationships
- **`components/chat/ChatWindow.tsx`**
  - **Depends on**: `MessageBubble.tsx`, `SuggestedPrompts.tsx`, `TypingIndicator.tsx`.
  - **Effect**: Receives the `messages` array from `dashboard/page.tsx`. If it requires new props, `dashboard/page.tsx` MUST be updated.

- **`components/chat/ChatInput.tsx`**
  - **Effect**: If the payload generated here (like file attachments) changes, `handleSendMessage` in `dashboard/page.tsx` MUST be updated to accept the new payload type.

- **`components/chat/MessageBubble.tsx`**
  - **Effect**: Relies strictly on the `Message` interface defined in `dashboard/page.tsx`. 

---

## 3. Cross-Stack API Contracts (Frontend <-> Backend)

When modifying these endpoints, BOTH the FastAPI router and the `lib/api.ts` Axios caller must be updated simultaneously.

| Feature | Frontend Caller (`lib/api.ts`) | Backend Router (`routers/`) | Data Model Payload |
| :--- | :--- | :--- | :--- |
| **Login** | `authApi.login` | `auth.py` -> `POST /login` | `username`, `password` |
| **Chat Stream** | `chatApi.sendMessage` | `chat.py` -> `POST /stream` | `message`, `language`, `document_ids` |
| **Document Upload** | `documentApi.upload` | `documents.py` -> `POST /upload` | `FormData(file, ministry)` |
| **Admin Logs** | `adminApi.getLogs` | `audit.py` -> `GET /logs` | `page`, `ministry`, `flagged_only` |
| **Chat Suggestions** | `chatApi.getSuggestions` | `chat.py` -> `GET /suggestions` | Relies purely on JWT context |

## 4. How to Handle Updates Safely
1. **Identify the core file**: e.g., if asked to update OCR logic, it starts at `utils/pdf_extractor.py`.
2. **Trace up the tree**: `pdf_extractor.py` is used by `rag_service.py`. 
3. **Check the router**: `rag_service.py` is used by `documents.py`.
4. **Check the frontend**: `documents.py` is called by `dashboard/page.tsx` (for chat attachment uploads) and `documents/page.tsx`. 
5. **Update all links in the chain**: Ensure no type mismatches occur between the updated layers.
