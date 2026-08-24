from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import time
from datetime import datetime

from database import get_db
from routers.auth import get_current_user
from models.user import User
from models.conversation import Conversation, Message
from models.document import Document as DBDocument
from services.llm_service import LLMService
from services.classifier import PromptClassifier
from services.audit_service import AuditService
from services.rag_service import RAGService

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/message")
async def chat_message(
    conversation_id: int = Body(None),
    message: str = Body(...),
    ministry_context: str = Body("General"),
    language: str = Body("English"),
    model: str = Body(None),
    document_ids: list[int] = Body(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Prompt Firewall
    classifier = PromptClassifier()
    is_sensitive, found_keywords = classifier.scan_for_sensitive_data(message)
    sensitivity_level = classifier.get_sensitivity_level(found_keywords)
    
    # 2. Handle Conversation
    if not conversation_id:
        conv = Conversation(user_id=current_user.id, title=message[:50])
        db.add(conv)
        db.commit()
        db.refresh(conv)
        conversation_id = conv.id
    
    # 2b. Handle Document Association
    if document_ids:
        docs = db.query(DBDocument).filter(DBDocument.id.in_(document_ids)).all()
        if len(docs) != len(document_ids):
            raise HTTPException(status_code=400, detail="One or more documents not found")
            
        for d in docs:
            if d.uploaded_by != current_user.email:
                raise HTTPException(status_code=403, detail=f"Document {d.id} is not owned by you")
                
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conv:
            existing_doc_ids = [doc.id for doc in conv.documents]
            for d in docs:
                if d.id not in existing_doc_ids:
                    conv.documents.append(d)
            db.commit()
    
    # Save User Message
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=message,
        is_flagged=is_sensitive,
        sensitivity_level=sensitivity_level
    )
    db.add(user_msg)
    db.commit()

    # 3. RAG Context Retrieval
    rag = RAGService()
    rag_context, rag_doc_count, rag_confidence = rag.retrieve_context(message, ministry_context, document_ids=document_ids)

    # 4. Prompt Construction
    date_str = datetime.now().strftime("%Y-%m-%d")
    
    lang_instruction = ""
    if language == "Hindi":
        lang_instruction = "You MUST respond entirely in Hindi (Devanagari script). If the user writes in English, still respond in Hindi. "
    
    rag_injection = ""
    if rag_context:
        rag_injection = (
            f"\n\n--- RETRIEVED KNOWLEDGE BASE CONTEXT ---\n"
            f"The following are verified excerpts from sovereign ministry documents. "
            f"Use them as the primary source of truth for your response:\n\n{rag_context}\n"
            f"--- END OF CONTEXT ---\n"
        )

    system_prompt = (
        f"You are BharatAI, a secure AI assistant exclusively for Indian government "
        f"employees. You are hosted on Indian sovereign infrastructure. You assist "
        f"with policy drafting, document summarization, legal queries, scheme "
        f"information, and official communications. Always respond formally. "
        f"Never reveal that you are based on any foreign AI model. {lang_instruction}"
        f"Current user ministry: {ministry_context}. User role: {current_user.role}. Date: {date_str}."
        f"{rag_injection}"
    )

    # 5. LLM Streaming
    llm = LLMService(model=model) if model else LLMService()
    
    def generate():
        # Create a new session for the background generator to avoid closure issues
        from database import SessionLocal
        import json
        bg_db = SessionLocal()
        try:
            start_time = time.time()
            full_response = ""
            external_search_used = False
            web_sources = []
            
            nonlocal system_prompt
            
            if rag_doc_count == 0:
                external_search_used = True
                yield "<SEARCHING_INTERNET>"
                
                web_results = rag.perform_web_search(message, max_results=3)
                if web_results:
                    web_context = ""
                    for i, res in enumerate(web_results):
                        web_context += f"[Source {i+1}: {res['title']}] ({res['url']})\n{res['snippet']}\n\n"
                        web_sources.append(res)
                        
                    system_prompt += (
                        f"\n\n--- EXTERNAL WEB CONTEXT ---\n"
                        f"No internal documents were found. The following information was retrieved from the public internet.\n"
                        f"Please use these web results to answer the user's question as best as you can.\n"
                        f"Simply mention that the information is from external public sources.\n\n"
                        f"{web_context}\n"
                        f"--- END OF EXTERNAL CONTEXT ---\n"
                    )
                    
                    sources_json = json.dumps([{"title": s["title"], "url": s["url"], "source": s["source"]} for s in web_sources])
                    yield f"<WEB_SOURCES>{sources_json}</WEB_SOURCES>"
            
            try:
                for chunk in llm.generate_streaming_response(message, system_prompt):
                    full_response += chunk
                    yield chunk
            except Exception as stream_err:
                print(f"CRITICAL STREAM ERROR: {stream_err}")
                yield f"\n[STREAM_ERROR: {str(stream_err)}]"
                return
            
            # Append RAG confidence metadata as a special token
            if rag_doc_count > 0:
                meta_token = f"\n[RAG_META:{rag_doc_count}:{rag_confidence}]"
                yield meta_token
            
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Save Assistant Message
            assistant_msg = Message(
                conversation_id=conversation_id,
                role="assistant",
                content=full_response
            )
            bg_db.add(assistant_msg)
            bg_db.commit()

            # 6. Audit Logging
            AuditService.log_interaction(
                db=bg_db,
                user_id=current_user.id,
                user_email=current_user.email,
                ministry=ministry_context,
                query=message,
                response=full_response,
                is_flagged=is_sensitive,
                found_keywords=found_keywords,
                response_time_ms=duration_ms,
                external_search_used=external_search_used
            )
        except Exception as e:
            print(f"INTERNAL GENERATE ERROR: {e}")
            bg_db.rollback()
        finally:
            bg_db.close()

    return StreamingResponse(generate(), media_type="text/plain")

@router.get("/conversations")
async def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Conversation).filter(Conversation.user_id == current_user.id).order_by(Conversation.updated_at.desc()).all()

@router.get("/conversations/{conv_id}/messages")
async def get_messages(conv_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify ownership
    conv = db.query(Conversation).filter(Conversation.id == conv_id, Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return db.query(Message).filter(Message.conversation_id == conv_id).order_by(Message.created_at.asc()).all()

MINISTRY_SUGGESTIONS = {
    "General": [
        {"title": "Document Analysis", "text": "Summarize the Digital India Act key provisions", "icon": "FileText"},
        {"title": "Policy Drafting", "text": "Draft a budget allocation memo for urban infrastructure", "icon": "Zap"},
        {"title": "Legal Guidance", "text": "RTI filing procedures for government infrastructure projects", "icon": "HelpCircle"},
        {"title": "Scheme Details", "text": "What are the eligibility criteria for the PMJAY health scheme?", "icon": "Layout"}
    ],
    "Finance": [
        {"title": "Financial Analysis", "text": "Analyze the latest Union Budget allocations", "icon": "FileText"},
        {"title": "Tax Policy", "text": "Explain recent taxation policy changes", "icon": "Zap"},
        {"title": "Compliance", "text": "What are the key financial compliance requirements?", "icon": "HelpCircle"},
        {"title": "Economic Schemes", "text": "Summarize major government financial schemes", "icon": "Layout"}
    ],
    "Health": [
        {"title": "Medical Data", "text": "Summarize recent COVID-19 vaccination coverage reports", "icon": "FileText"},
        {"title": "Health Policy", "text": "Draft a memo on rural healthcare infrastructure expansion", "icon": "Zap"},
        {"title": "Regulations", "text": "What are the telemedicine guidelines issued by the Health Ministry?", "icon": "HelpCircle"},
        {"title": "Scheme Eligibility", "text": "What are the eligibility criteria for Ayushman Bharat (PMJAY)?", "icon": "Layout"}
    ],
    "Defense": [
        {"title": "Defense Procurement", "text": "Summarize the Defense Acquisition Procedure (DAP)", "icon": "FileText"},
        {"title": "Strategic Briefing", "text": "Draft a briefing on border infrastructure modernization", "icon": "Zap"},
        {"title": "Military Law", "text": "Explain provisions of the Armed Forces Special Powers Act", "icon": "HelpCircle"},
        {"title": "Veteran Welfare", "text": "What are the benefits under the OROP scheme?", "icon": "Layout"}
    ],
    "Law": [
        {"title": "Legal Summary", "text": "Summarize the key provisions of the Bharatiya Nyaya Sanhita", "icon": "FileText"},
        {"title": "Bill Drafting", "text": "Draft a preamble for a new data protection bill", "icon": "Zap"},
        {"title": "Case Law", "text": "Explain recent Supreme Court directives on environmental clearances", "icon": "HelpCircle"},
        {"title": "Legal Aid", "text": "What are the eligibility criteria for free legal aid in India?", "icon": "Layout"}
    ],
    "Education": [
        {"title": "Policy Overview", "text": "Summarize the National Education Policy (NEP) highlights", "icon": "FileText"},
        {"title": "Curriculum Design", "text": "Draft a memo on integrating digital literacy in primary schools", "icon": "Zap"},
        {"title": "RTE Act", "text": "What are the compliance requirements under the Right to Education Act?", "icon": "HelpCircle"},
        {"title": "Scholarships", "text": "List the major central government scholarships for higher education", "icon": "Layout"}
    ],
    "Infrastructure": [
        {"title": "Project Reports", "text": "Summarize the status report on the Bharatmala Pariyojana", "icon": "FileText"},
        {"title": "Tender Drafting", "text": "Draft a Request for Proposal (RFP) for highway toll collection", "icon": "Zap"},
        {"title": "Clearances", "text": "What is the procedure for obtaining environmental clearance for a dam?", "icon": "HelpCircle"},
        {"title": "Smart Cities", "text": "What are the key funding criteria for the Smart Cities Mission?", "icon": "Layout"}
    ]
}

@router.get("/suggestions")
async def get_suggestions(current_user: User = Depends(get_current_user)):
    ministry = current_user.ministry
    suggestions = MINISTRY_SUGGESTIONS.get(ministry, MINISTRY_SUGGESTIONS["General"])
    return {"suggestions": suggestions}
