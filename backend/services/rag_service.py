import chromadb
from chromadb.config import Settings
import requests
import logging
import os
from typing import List
from rank_bm25 import BM25Okapi

from services.embeddings_service import EmbeddingsService
from services.reranker_service import RerankerService
from services.cache_service import QueryCache
from services.chunking_service import ChunkingService
from utils.pdf_extractor import PDFExtractor

logger = logging.getLogger("bharatai")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
CHROMA_DIR = os.getenv("CHROMA_DB_DIR", "./chroma_data")


class RAGService:
    """
    Production RAG pipeline with:
    - Hybrid search (vector + BM25 keyword)
    - Cross-encoder reranking
    - Query caching
    - Smart chunking
    - Context window management
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        logger.info("Initializing production RAG pipeline...")

        # Core services
        self.embeddings = EmbeddingsService()
        self.reranker = RerankerService()
        self.cache = QueryCache(ttl_minutes=10)
        self.chunker = ChunkingService()
        self.extractor = PDFExtractor()

        # ChromaDB
        self.chroma_client = chromadb.PersistentClient(
            path=CHROMA_DIR,
            settings=Settings(anonymized_telemetry=False)
        )

        # BM25 index per ministry (keyword search)
        self._bm25_indexes: dict = {}
        self._bm25_docs: dict = {}

        self._initialized = True
        logger.info("RAG pipeline ready")

    def _get_collection(self, ministry: str):
        """Get or create ministry-specific ChromaDB collection"""
        collection_name = f"ministry_{ministry.lower().replace(' ', '_')}"
        return self.chroma_client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def _vector_search(
        self,
        query: str,
        ministry: str,
        n_results: int = 10,
        document_ids: List[int] = None
    ) -> List[str]:
        """Semantic vector search in ChromaDB"""
        try:
            collection = self._get_collection(ministry)

            if collection.count() == 0:
                return []

            query_embedding = self.embeddings.embed_text(query)

            where_clause = None
            if document_ids:
                if len(document_ids) == 1:
                    where_clause = {"document_id": document_ids[0]}
                else:
                    where_clause = {"document_id": {"$in": document_ids}}

            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(n_results, collection.count()),
                include=["documents", "distances"],
                where=where_clause
            )

            return results["documents"][0] if results["documents"] else []

        except Exception as e:
            logger.error(f"Vector search error: {e}")
            return []

    def _keyword_search(
        self,
        query: str,
        ministry: str,
        n_results: int = 10,
        document_ids: List[int] = None
    ) -> List[str]:
        """BM25 keyword search for exact term matching"""
        if document_ids:
            # Skip BM25 if strict document filtering is required 
            # (as BM25 index doesn't have document_id metadata linked)
            return []
            
        if ministry not in self._bm25_indexes:
            return []

        try:
            bm25 = self._bm25_indexes[ministry]
            docs = self._bm25_docs[ministry]

            tokenized_query = query.lower().split()
            scores = bm25.get_scores(tokenized_query)

            top_indices = sorted(
                range(len(scores)),
                key=lambda i: scores[i],
                reverse=True
            )[:n_results]

            return [docs[i] for i in top_indices if scores[i] > 0]

        except Exception as e:
            logger.error(f"BM25 search error: {e}")
            return []

    def _hybrid_search(
        self,
        query: str,
        ministry: str,
        document_ids: List[int] = None
    ) -> List[str]:
        """Combine vector + keyword search results"""
        vector_results = self._vector_search(query, ministry, n_results=10, document_ids=document_ids)
        keyword_results = self._keyword_search(query, ministry, n_results=10, document_ids=document_ids)

        # Deduplicate while preserving order (vector results prioritized)
        seen = set()
        combined = []
        for doc in vector_results + keyword_results:
            doc_hash = hash(doc[:100])
            if doc_hash not in seen:
                seen.add(doc_hash)
                combined.append(doc)

        logger.info(
            f"Hybrid search: {len(vector_results)} vector + "
            f"{len(keyword_results)} keyword = {len(combined)} unique chunks"
        )

        return combined

    def _fit_context_window(
        self,
        chunks: list,
        max_chars: int = 6000
    ) -> str:
        """Fit chunks within context window budget"""
        context_parts = []
        total_chars = 0

        for i, chunk in enumerate(chunks):
            text = chunk["text"] if isinstance(chunk, dict) else chunk
            if total_chars + len(text) > max_chars:
                break
            context_parts.append(f"[Source {i+1}]\n{text}")
            total_chars += len(text)

        return "\n\n".join(context_parts)

    async def query(
        self,
        question: str,
        ministry: str,
        role: str = "officer",
        document_ids: List[int] = None
    ) -> dict:
        """
        Main RAG query pipeline.
        Returns response with sources and metadata.
        """
        # 1. Check cache
        cached = self.cache.get(question, ministry)
        if cached:
            return {**cached, "from_cache": True}

        # 2. Hybrid search
        raw_chunks = self._hybrid_search(question, ministry, document_ids=document_ids)

        # 3. Rerank for true relevance
        if raw_chunks:
            ranked_chunks = self.reranker.rerank(
                question, raw_chunks, top_k=3
            )
        else:
            ranked_chunks = []

        # 4. Build context
        has_context = len(ranked_chunks) > 0
        context = self._fit_context_window(ranked_chunks) if has_context else ""

        # 5. Build system prompt
        system_prompt = self._build_system_prompt(ministry, role, has_context)

        # 6. Build user prompt
        if has_context:
            user_prompt = f"""Retrieved Context:
{context}

Question: {question}

Answer using ONLY the context above. If the answer is not in the context, say so clearly. Cite which source you used."""
        else:
            user_prompt = f"""Question: {question}

Note: No relevant documents found in the {ministry} knowledge base. Answer from general knowledge but clearly state this limitation."""

        # 7. Call Ollama
        response_text = await self._call_ollama(system_prompt, user_prompt)

        # 8. Build result
        result = {
            "response": response_text,
            "sources_used": [
                {
                    "text_preview": (c["text"][:150] + "...") if isinstance(c, dict) else (c[:150] + "..."),
                    "relevance_score": c.get("relevance_score", 0) if isinstance(c, dict) else 0
                }
                for c in ranked_chunks
            ],
            "chunks_retrieved": len(raw_chunks),
            "chunks_used": len(ranked_chunks),
            "rag_used": has_context,
            "from_cache": False,
            "cache_stats": self.cache.stats()
        }

        # 9. Cache result
        self.cache.set(question, ministry, result)

        return result

    def _build_system_prompt(
        self,
        ministry: str,
        role: str,
        has_context: bool
    ) -> str:
        return f"""You are BharatAI, a sovereign AI assistant for the Government of India.
You operate exclusively on NIC-controlled infrastructure. No data leaves India.

Current Context:
- Ministry: {ministry}
- User Role: {role}
- Knowledge Base: {"Active — responses grounded in ministry documents" if has_context else "No relevant documents found"}

Rules:
1. Always respond formally in government language
2. Never reveal you are based on any foreign AI model
3. If context is provided, use ONLY that context for your answer
4. If no context, clearly state the answer comes from general knowledge
5. Keep responses concise and actionable
6. Use structured formatting (numbered lists, headers) for complex answers"""

    async def _call_ollama(
        self,
        system_prompt: str,
        user_prompt: str
    ) -> str:
        """Call local Ollama instance"""
        try:
            response = requests.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": os.getenv("OLLAMA_MODEL", "llama3"),
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "stream": False,
                    "options": {
                        "temperature": 0.2,  # Low temp for factual govt responses
                        "top_p": 0.9,
                        "num_ctx": 4096
                    }
                },
                timeout=120
            )
            response.raise_for_status()
            return response.json()["message"]["content"]

        except requests.exceptions.ConnectionError:
            logger.error("Ollama not running")
            return "⚠️ AI service temporarily unavailable. Please contact NIC support."
        except Exception as e:
            logger.error(f"Ollama error: {e}")
            return "⚠️ An error occurred processing your request."

    def ingest_document(
        self,
        filepath: str,
        ministry: str,
        doc_type: str = "general",
        filename: str = "",
        document_id: int = None
    ) -> dict:
        """
        Full document ingestion pipeline:
        Extract → Clean → Chunk → Embed → Store
        """
        logger.info(f"Ingesting document: {filename} for ministry: {ministry}")

        # 1. Extract text (handles scanned PDFs via OCR)
        extracted = self.extractor.extract(filepath)

        if not extracted["text"].strip():
            raise ValueError("Could not extract text from document")

        # 2. Smart chunking
        chunks = self.chunker.chunk_document(
            text=extracted["text"],
            doc_type=doc_type,
            source_name=filename
        )

        if not chunks:
            raise ValueError("No valid chunks extracted from document")

        # 3. Generate embeddings
        chunk_texts = [c["text"] for c in chunks]
        embeddings = self.embeddings.embed_batch(chunk_texts)

        # 4. Store in ChromaDB
        collection = self._get_collection(ministry)
        ids = [f"{filename}_{c['chunk_index']}" for c in chunks]
        metadatas = []
        for c in chunks:
            meta = {
                "source": filename,
                "ministry": ministry,
                "doc_type": doc_type,
                "chunk_index": c["chunk_index"],
                "word_count": c["word_count"]
            }
            if document_id is not None:
                meta["document_id"] = document_id
            metadatas.append(meta)

        collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=chunk_texts,
            metadatas=metadatas
        )

        # 5. Update BM25 index for keyword search
        self._update_bm25_index(ministry, chunk_texts)

        # 6. Invalidate cache for this ministry
        self.cache.invalidate_ministry(ministry)

        result = {
            "filename": filename,
            "ministry": ministry,
            "chunk_count": len(chunks),
            "page_count": extracted["page_count"],
            "has_tables": extracted["has_tables"],
            "is_scanned": extracted["is_scanned"],
            "language": extracted["language"],
            "total_words": sum(c["word_count"] for c in chunks)
        }

        logger.info(f"Ingestion complete: {result}")
        return result

    def _update_bm25_index(self, ministry: str, new_docs: List[str]):
        """Rebuild BM25 keyword index for ministry"""
        if ministry not in self._bm25_docs:
            self._bm25_docs[ministry] = []

        self._bm25_docs[ministry].extend(new_docs)

        # Rebuild BM25 index
        tokenized = [doc.lower().split() for doc in self._bm25_docs[ministry]]
        self._bm25_indexes[ministry] = BM25Okapi(tokenized)

        logger.info(
            f"BM25 index updated for {ministry}: "
            f"{len(self._bm25_docs[ministry])} total chunks"
        )

    def get_ministry_stats(self, ministry: str) -> dict:
        """Get stats about a ministry's knowledge base"""
        try:
            collection = self._get_collection(ministry)
            count = collection.count()
            bm25_count = len(self._bm25_docs.get(ministry, []))

            return {
                "ministry": ministry,
                "vector_chunks": count,
                "keyword_indexed_chunks": bm25_count,
                "cache_stats": self.cache.stats()
            }
        except Exception as e:
            return {"ministry": ministry, "error": str(e)}

    # -----------------------------------------------------------------------
    # Legacy compatibility shims — keep old callers working
    # -----------------------------------------------------------------------

    def process_and_store_document(self, file_path: str, ministry: str):
        """
        Legacy shim: maps old API to new ingest_document pipeline.
        Returns (chunk_count, redaction_count) tuple for backward compat.
        """
        import os as _os
        filename = _os.path.basename(file_path)
        result = self.ingest_document(
            filepath=file_path,
            ministry=ministry,
            doc_type="general",
            filename=filename
        )
        return result["chunk_count"], 0  # redaction_count not used in new pipeline

    def retrieve_context(self, query: str, ministry: str, k: int = 3, document_ids: List[int] = None):
        """
        Legacy shim: maps old retrieve_context to new hybrid search + rerank.
        Returns (context_text, num_docs_found, avg_confidence_pct) tuple.
        """
        raw_chunks = self._hybrid_search(query, ministry, document_ids=document_ids)
        if not raw_chunks:
            return "", 0, 0.0

        ranked = self.reranker.rerank(query, raw_chunks, top_k=k)
        if not ranked:
            return "", 0, 0.0

        context = self._fit_context_window(ranked)
        avg_score = sum(c.get("relevance_score", 0) for c in ranked) / len(ranked)
        confidence_pct = round(min(max(avg_score * 100, 0), 100), 1)

        return context, len(ranked), confidence_pct
