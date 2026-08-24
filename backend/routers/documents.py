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
    doc_type: str = Form("general"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Remove admin restriction so users can upload docs to their own vault
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        db_doc = DBDocument(
            filename=file.filename,
            ministry=ministry,
            uploaded_by=current_user.email,
            chunk_count=0
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)

        rag = RAGService()
        ingestion_result = rag.ingest_document(
            filepath=file_path,
            ministry=ministry,
            doc_type=doc_type,
            filename=file.filename,
            document_id=db_doc.id
        )

        db_doc.chunk_count = ingestion_result["chunk_count"]
        db.commit()

        scanned_note = " (OCR used — scanned PDF detected)" if ingestion_result["is_scanned"] else ""
        hindi_note = " | Hindi content detected." if ingestion_result["language"] == "hi" else ""
        table_note = " | Tables extracted." if ingestion_result["has_tables"] else ""

        return {
            "message": f"File uploaded and processed{scanned_note}",
            "document_id": db_doc.id,
            "chunks": ingestion_result["chunk_count"],
            "pages": ingestion_result["page_count"],
            "total_words": ingestion_result["total_words"],
            "language": ingestion_result["language"],
            "has_tables": ingestion_result["has_tables"],
            "is_scanned": ingestion_result["is_scanned"],
            "notes": f"✅ Ingested successfully.{hindi_note}{table_note}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG Processing Error: {str(e)}")


@router.get("/list")
async def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Ownership Validation: Only return documents uploaded by the current user
    return db.query(DBDocument).filter(DBDocument.uploaded_by == current_user.email).order_by(DBDocument.created_at.desc()).all()
