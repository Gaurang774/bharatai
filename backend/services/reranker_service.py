from sentence_transformers import CrossEncoder
from typing import List
import logging
import os

logger = logging.getLogger("bharatai")


class RerankerService:
    """
    Cross-encoder reranker that scores true relevance
    between query and retrieved chunks.

    Vector search finds "similar" text.
    Reranker finds "relevant" text. Big difference.
    """

    _instance = None
    _model = None

    MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    RELEVANCE_THRESHOLD = 0.1  # Below this, chunk is not relevant

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _load_model(self):
        if self._model is None:
            logger.info("Loading cross-encoder reranker...")
            self.__class__._model = CrossEncoder(
                self.MODEL_NAME,
                cache_dir=os.getenv("MODEL_CACHE_DIR", "./model_cache")
            )
            logger.info("Reranker loaded")

    def rerank(
        self,
        query: str,
        chunks: List[str],
        top_k: int = 3
    ) -> List[dict]:
        """
        Score and rank chunks by relevance to query.
        Returns top_k most relevant chunks with scores.
        """
        if not chunks:
            return []

        self._load_model()

        # Score all (query, chunk) pairs at once
        pairs = [[query, chunk] for chunk in chunks]
        scores = self._model.predict(pairs)

        # Combine chunks with scores
        scored_chunks = [
            {
                "text": chunk,
                "relevance_score": float(score),
                "rank": i
            }
            for i, (chunk, score) in enumerate(zip(chunks, scores))
        ]

        # Sort by relevance score
        scored_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)

        # Filter by threshold and return top_k
        relevant = [
            chunk for chunk in scored_chunks
            if chunk["relevance_score"] > self.RELEVANCE_THRESHOLD
        ]

        logger.info(
            f"Reranking: {len(chunks)} chunks → {len(relevant[:top_k])} relevant"
        )

        return relevant[:top_k]
