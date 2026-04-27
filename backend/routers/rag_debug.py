from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.rag_service import RAGService
from routers.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/rag", tags=["RAG Debug"])


class DebugQueryRequest(BaseModel):
    query: str
    ministry: str


@router.post("/debug")
async def debug_rag(
    request: DebugQueryRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Debug endpoint — shows exactly what RAG retrieves.
    Admin only.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    rag = RAGService()

    # Show step by step what happens
    vector_chunks = rag._vector_search(request.query, request.ministry, n_results=10)
    keyword_chunks = rag._keyword_search(request.query, request.ministry, n_results=10)

    all_chunks = list(set(vector_chunks + keyword_chunks))
    ranked = rag.reranker.rerank(request.query, all_chunks, top_k=5) if all_chunks else []

    return {
        "query": request.query,
        "ministry": request.ministry,
        "vector_results": len(vector_chunks),
        "keyword_results": len(keyword_chunks),
        "after_reranking": len(ranked),
        "top_chunks": ranked,
        "cache_stats": rag.cache.stats()
    }


@router.get("/stats/{ministry}")
async def ministry_stats(
    ministry: str,
    current_user: User = Depends(get_current_user)
):
    """Get knowledge base stats for a ministry"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    rag = RAGService()
    return rag.get_ministry_stats(ministry)
