from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil
from database import get_db
from routers.auth import get_current_user
from models.user import User
from models.document import Document as DBDocument
from services.rag_service import RAGService

router = APIRouter(prefix="/api/documents", tags=["documents"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(
    ministry: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can upload documents")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        rag = RAGService()
        chunk_count, redaction_count = rag.process_and_store_document(file_path, ministry)
        
        db_doc = DBDocument(
            filename=file.filename,
            ministry=ministry,
            uploaded_by=current_user.email,
            chunk_count=chunk_count
        )
        db.add(db_doc)
        db.commit()
        
        return {
            "message": "File uploaded and processed",
            "chunks": chunk_count,
            "redactions": redaction_count,
            "redaction_note": f"🛡️ {redaction_count} PII items (Aadhaar/PAN/Phone/Email) were automatically redacted before indexing." if redaction_count > 0 else "No PII detected."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG Processing Error: {str(e)}")

@router.get("/list")
async def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(DBDocument).all()
