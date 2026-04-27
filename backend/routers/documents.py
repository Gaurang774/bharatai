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
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can upload documents")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        rag = RAGService()
        ingestion_result = rag.ingest_document(
            filepath=file_path,
            ministry=ministry,
            doc_type=doc_type,
            filename=file.filename
        )

        db_doc = DBDocument(
            filename=file.filename,
            ministry=ministry,
            uploaded_by=current_user.email,
            chunk_count=ingestion_result["chunk_count"]
        )
        db.add(db_doc)
        db.commit()

        scanned_note = " (OCR used — scanned PDF detected)" if ingestion_result["is_scanned"] else ""
        hindi_note = " | Hindi content detected." if ingestion_result["language"] == "hi" else ""
        table_note = " | Tables extracted." if ingestion_result["has_tables"] else ""

        return {
            "message": f"File uploaded and processed{scanned_note}",
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
    return db.query(DBDocument).all()
