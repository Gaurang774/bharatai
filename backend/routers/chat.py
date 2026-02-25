from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import time
from datetime import datetime

from database import get_db
from routers.auth import get_current_user
from models.user import User
from models.conversation import Conversation, Message
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
    rag_context, rag_doc_count, rag_confidence = rag.retrieve_context(message, ministry_context)

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
        bg_db = SessionLocal()
        try:
            start_time = time.time()
            full_response = ""
            
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
                response_time_ms=duration_ms
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
