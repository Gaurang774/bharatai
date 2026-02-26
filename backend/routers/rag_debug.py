from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.rag_service import RAGService
from routers.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/rag", tags=["RAG Debug"])


class DebugFullRequest(BaseModel):
    query: str
    ministry: str


class DebugQueryRequest(BaseModel):
    query: str
    ministry: str


@router.post("/debug/full")
async def full_rag_debug(
    request: DebugFullRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Admin-only diagnostic endpoint that exposes all 3 new pipeline features:
    - Query rewriting  (acronym expansion, spell correction, LLM expansion, ministry context)
    - HyDE decision    (whether hypothetical doc was generated + preview)
    - Semantic cache   (hit type: exact / semantic / miss + full stats)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    rag = RAGService()

    # 1. Query rewriting
    rewrite = rag.rewriter.rewrite(request.query, request.ministry, use_llm=False)

    # 2. HyDE decision
    hyde_activated = rag.hyde.should_use_hyde(rewrite["rewritten"])
    hyp_doc = None
    if hyde_activated:
        _, hyp_doc = rag.hyde.get_hyde_embedding(
            rewrite["rewritten"], request.ministry
        )

    # 3. Cache state
    cache_result = rag.cache.get(request.query, request.ministry)

    return {
        "original_query":      request.query,
        "rewritten_query":     rewrite["rewritten"],
        "expansions_applied":  rewrite["expansions_applied"],
        "acronyms_found":      rewrite["acronyms_found"],
        "hyde_activated":      hyde_activated,
        "hypothetical_document": hyp_doc,
        "cache_hit":           cache_result is not None,
        "cache_type":          cache_result.get("cache_type") if cache_result else "miss",
        "cache_stats":         rag.cache.stats(),
    }


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
