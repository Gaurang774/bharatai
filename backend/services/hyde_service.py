import os
import logging
import requests
from typing import Optional

from services.embeddings_service import EmbeddingsService

logger = logging.getLogger("bharatai")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")


class HyDEService:
    """
    Hypothetical Document Embeddings (HyDE).

    For short or vague queries, generates a plausible hypothetical
    government document excerpt that WOULD answer the question,
    then uses that text as the search vector instead of the raw query.

    This dramatically improves recall for short queries like
    "PMJAY limit" because the hypothetical document shares vocabulary
    with real documents in the knowledge base.

    Activates only when word count < SHORT_QUERY_THRESHOLD.
    Falls back gracefully to normal embedding if LLM is unavailable.
    """

    SHORT_QUERY_THRESHOLD = 10  # words

    def __init__(self):
        self.embeddings = EmbeddingsService()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def should_use_hyde(self, query: str) -> bool:
        """
        Returns True if the query is short/vague enough to benefit from HyDE.
        Short queries (< 10 words) lack enough semantic signal on their own.
        """
        return len(query.split()) < self.SHORT_QUERY_THRESHOLD

    def generate_hypothetical_document(
        self,
        query: str,
        ministry: str
    ) -> Optional[str]:
        """
        Ask local Ollama to write a SHORT fake-but-plausible government
        document excerpt (3-4 sentences) that would answer the query.

        Returns the generated text, or None if Ollama is unavailable.
        """
        system_prompt = (
            f"You are a government document generator for the {ministry} Ministry of India. "
            "Generate a SHORT hypothetical document excerpt (3-4 sentences, under 100 words) "
            "that would perfectly answer the following query. "
            "Write it as if extracted from an actual government circular or policy document. "
            "Do NOT say 'hypothetically' or 'if'. Write directly as document text. "
            "Do NOT answer the user directly — write as a document."
        )
        user_prompt = f"Query: {query}"

        try:
            response = requests.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": os.getenv("OLLAMA_MODEL", "llama3"),
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user",   "content": user_prompt},
                    ],
                    "stream": False,
                    "options": {
                        "temperature": 0.4,  # Slightly creative for plausible document text
                        "num_ctx": 512,
                    },
                },
                timeout=20,
            )
            response.raise_for_status()
            hyp_doc = response.json()["message"]["content"].strip()
            logger.info(
                f"HyDE generated hypothetical doc ({len(hyp_doc.split())} words) "
                f"for query: '{query[:60]}'"
            )
            return hyp_doc
        except Exception as e:
            logger.warning(f"HyDE document generation failed (non-fatal): {e}")
            return None

    def get_hyde_embedding(
        self,
        query: str,
        ministry: str
    ) -> tuple[list[float], Optional[str]]:
        """
        Generates hypothetical document and embeds it.

        Returns:
            (embedding_vector, hypothetical_doc_text)

        Falls back to embedding the original query if generation fails.
        """
        hyp_doc = self.generate_hypothetical_document(query, ministry)
        if hyp_doc:
            embedding = self.embeddings.embed_text(hyp_doc)
            return embedding, hyp_doc
        else:
            # Graceful fallback: embed original query
            logger.info("HyDE fallback: using original query embedding")
            embedding = self.embeddings.embed_text(query)
            return embedding, None

    def hybrid_hyde_search(
        self,
        query: str,
        ministry: str,
        chroma_collection,
        n_results: int = 10
    ) -> tuple[list[str], Optional[str]]:
        """
        Runs BOTH normal and HyDE vector searches and merges results.

        Strategy:
          1. Normal embedding (original query) → vector search
          2. HyDE embedding  (hypothetical doc) → vector search
          3. Merge + deduplicate (normal results prioritized)

        Returns:
            (combined_chunks, hypothetical_doc_text)
        """
        if chroma_collection.count() == 0:
            return [], None

        safe_n = min(n_results, chroma_collection.count())

        # --- 1. Normal vector search ---
        normal_embedding = self.embeddings.embed_text(query)
        try:
            normal_results = chroma_collection.query(
                query_embeddings=[normal_embedding],
                n_results=safe_n,
                include=["documents"]
            )["documents"][0]
        except Exception as e:
            logger.error(f"HyDE normal search error: {e}")
            normal_results = []

        # --- 2. HyDE vector search ---
        hyde_embedding, hyp_doc = self.get_hyde_embedding(query, ministry)
        try:
            hyde_results = chroma_collection.query(
                query_embeddings=[hyde_embedding],
                n_results=safe_n,
                include=["documents"]
            )["documents"][0]
        except Exception as e:
            logger.error(f"HyDE hyde search error: {e}")
            hyde_results = []

        # --- 3. Merge and deduplicate (normal results come first) ---
        seen: set[int] = set()
        combined: list[str] = []
        for doc in normal_results + hyde_results:
            key = hash(doc[:100])
            if key not in seen:
                seen.add(key)
                combined.append(doc)

        logger.info(
            f"HyDE search: {len(normal_results)} normal + "
            f"{len(hyde_results)} hyde = {len(combined)} unique chunks"
        )

        return combined, hyp_doc
