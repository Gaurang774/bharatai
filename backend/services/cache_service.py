import hashlib
import math
import logging
from datetime import datetime, timedelta
from typing import Optional

from services.embeddings_service import EmbeddingsService

logger = logging.getLogger("bharatai")


class SemanticQueryCache:
    """
    Production cache that matches queries by MEANING, not just exact strings.

    Lookup hierarchy (fastest → slowest):
      1. Exact match  — O(1) MD5 dict lookup
      2. Semantic match — cosine similarity scan (≥ threshold)
      3. Cache miss  — caller must run full RAG pipeline

    Example:
      "What are PMJAY rules?" (set)
      "List PMJAY rules"     (get) → semantic HIT at ~94% similarity
    """

    def __init__(
        self,
        ttl_minutes: int = 10,
        max_size: int = 500,
        semantic_threshold: float = 0.90,
    ):
        self._exact_cache: dict = {}
        self._semantic_cache: list = []       # [{embedding, query, ministry, data, cached_at}]
        self.ttl = timedelta(minutes=ttl_minutes)
        self.max_size = max_size
        self.semantic_threshold = semantic_threshold

        # Reuse the same singleton embeddings model as the rest of the pipeline
        self.embeddings = EmbeddingsService()

        # Stats counters
        self.exact_hits = 0
        self.semantic_hits = 0
        self.misses = 0

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get(self, query: str, ministry: str) -> Optional[dict]:
        """
        Returns cached data if found (exact or semantic), else None.
        Attaches 'cache_type': 'exact' | 'semantic' to returned dict.
        """
        # 1. Exact match (fast path)
        result = self._exact_get(query, ministry)
        if result is not None:
            self.exact_hits += 1
            logger.info(f"Cache EXACT HIT for: '{query[:60]}'")
            return {**result, "cache_type": "exact"}

        # 2. Semantic match (embedding-based)
        result = self._semantic_get(query, ministry)
        if result is not None:
            self.semantic_hits += 1
            return {**result, "cache_type": "semantic"}

        self.misses += 1
        return None

    def set(self, query: str, ministry: str, data: dict):
        """Store response in both exact and semantic cache."""
        self._exact_set(query, ministry, data)
        self._semantic_set(query, ministry, data)

    def invalidate_ministry(self, ministry: str):
        """
        Remove all cache entries for a ministry.
        Called automatically after a new document is uploaded.
        """
        keys_to_delete = [
            k for k, v in self._exact_cache.items()
            if v.get("ministry") == ministry.lower()
        ]
        for k in keys_to_delete:
            del self._exact_cache[k]

        self._semantic_cache = [
            e for e in self._semantic_cache
            if e["ministry"] != ministry
        ]
        logger.info(
            f"Cache invalidated for '{ministry}': "
            f"removed {len(keys_to_delete)} exact + rebuilt semantic list"
        )

    def stats(self) -> dict:
        total = self.exact_hits + self.semantic_hits + self.misses
        return {
            "exact_cache_size":    len(self._exact_cache),
            "semantic_cache_size": len(self._semantic_cache),
            "exact_hits":          self.exact_hits,
            "semantic_hits":       self.semantic_hits,
            "misses":              self.misses,
            "total_requests":      total,
            "exact_hit_ratio":    f"{self.exact_hits/total:.1%}" if total else "0%",
            "semantic_hit_ratio": f"{self.semantic_hits/total:.1%}" if total else "0%",
            "overall_hit_ratio":  f"{(self.exact_hits+self.semantic_hits)/total:.1%}" if total else "0%",
        }

    # ------------------------------------------------------------------
    # Exact cache (unchanged from original QueryCache)
    # ------------------------------------------------------------------

    def _make_key(self, query: str, ministry: str) -> str:
        normalized = f"{query.lower().strip()}|{ministry.lower()}"
        return hashlib.md5(normalized.encode()).hexdigest()

    def _exact_get(self, query: str, ministry: str) -> Optional[dict]:
        key = self._make_key(query, ministry)
        if key not in self._exact_cache:
            return None
        entry = self._exact_cache[key]
        if datetime.now() - entry["cached_at"] > self.ttl:
            del self._exact_cache[key]
            return None
        return entry["data"]

    def _exact_set(self, query: str, ministry: str, data: dict):
        if len(self._exact_cache) >= self.max_size:
            oldest = min(
                self._exact_cache,
                key=lambda k: self._exact_cache[k]["cached_at"]
            )
            del self._exact_cache[oldest]
        key = self._make_key(query, ministry)
        self._exact_cache[key] = {
            "data":      data,
            "ministry":  ministry.lower(),
            "cached_at": datetime.now(),
        }

    # ------------------------------------------------------------------
    # Semantic cache
    # ------------------------------------------------------------------

    def _semantic_get(self, query: str, ministry: str) -> Optional[dict]:
        """Scan semantic cache for the highest-similarity unexpired entry."""
        if not self._semantic_cache:
            return None

        query_emb = self.embeddings.embed_text(query)
        now = datetime.now()

        best_score = 0.0
        best_entry = None

        for entry in self._semantic_cache:
            if now - entry["cached_at"] > self.ttl:
                continue
            if entry["ministry"] != ministry:
                continue
            score = self._cosine_similarity(query_emb, entry["embedding"])
            if score > best_score:
                best_score = score
                best_entry = entry

        if best_score >= self.semantic_threshold and best_entry:
            logger.info(
                f"Cache SEMANTIC HIT — {best_score:.1%} similarity "
                f"| Original cached query: '{best_entry['query'][:60]}'"
            )
            return best_entry["data"]

        return None

    def _semantic_set(self, query: str, ministry: str, data: dict):
        """Store a query + its embedding in the semantic cache."""
        if len(self._semantic_cache) >= self.max_size:
            self._semantic_cache.pop(0)   # Evict oldest

        self._semantic_cache.append({
            "query":     query,
            "ministry":  ministry,
            "embedding": self.embeddings.embed_text(query),
            "data":      data,
            "cached_at": datetime.now(),
        })

    # ------------------------------------------------------------------
    # Utilities
    # ------------------------------------------------------------------

    @staticmethod
    def _cosine_similarity(emb1: list[float], emb2: list[float]) -> float:
        """Pure-Python cosine similarity (no numpy required)."""
        dot  = sum(a * b for a, b in zip(emb1, emb2))
        mag1 = math.sqrt(sum(a * a for a in emb1))
        mag2 = math.sqrt(sum(b * b for b in emb2))
        if mag1 == 0 or mag2 == 0:
            return 0.0
        return dot / (mag1 * mag2)


# ---------------------------------------------------------------------------
# Backward-compatibility alias — keeps existing callers working untouched
# ---------------------------------------------------------------------------
class QueryCache(SemanticQueryCache):
    """
    Drop-in alias for the old QueryCache class.
    All existing references continue to work; they now benefit from
    semantic matching automatically.
    """
    def __init__(self, ttl_minutes: int = 10, max_size: int = 500):
        super().__init__(
            ttl_minutes=ttl_minutes,
            max_size=max_size,
            semantic_threshold=0.90,
        )
