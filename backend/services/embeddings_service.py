from sentence_transformers import SentenceTransformer
from typing import List
import logging
import os

logger = logging.getLogger("bharatai")


class EmbeddingsService:
    """
    Singleton embedding service.
    Uses multilingual model that supports:
    - English (primary)
    - Hindi (Devanagari)
    - Other Indian languages
    """

    _instance = None
    _model = None

    # Multilingual model that understands Indian languages
    # Much better than english-only models for govt docs
    MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _load_model(self):
        if self._model is None:
            logger.info(f"Loading embedding model: {self.MODEL_NAME}")
            self._model = SentenceTransformer(
                self.MODEL_NAME,
                cache_folder=os.getenv("MODEL_CACHE_DIR", "./model_cache")
            )
            logger.info("Embedding model loaded successfully")

    def embed_text(self, text: str) -> List[float]:
        """Embed a single text string"""
        self._load_model()
        return self._model.encode(text, normalize_embeddings=True).tolist()

    def embed_batch(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """Embed multiple texts efficiently"""
        self._load_model()
        embeddings = self._model.encode(
            texts,
            batch_size=batch_size,
            normalize_embeddings=True,
            show_progress_bar=len(texts) > 100
        )
        return embeddings.tolist()

    def similarity(self, text1: str, text2: str) -> float:
        """Compute cosine similarity between two texts"""
        self._load_model()
        emb1 = self._model.encode(text1, normalize_embeddings=True)
        emb2 = self._model.encode(text2, normalize_embeddings=True)
        return float(emb1 @ emb2)
