import hashlib
from datetime import datetime, timedelta
from typing import Optional
import logging

logger = logging.getLogger("bharatai")


class QueryCache:
    """
    In-memory cache for RAG responses.
    Prevents identical queries from hitting Ollama repeatedly.

    Production upgrade: Replace with Redis for multi-worker support.
    """

    def __init__(self, ttl_minutes: int = 10, max_size: int = 500):
        self._cache: dict = {}
        self.ttl = timedelta(minutes=ttl_minutes)
        self.max_size = max_size
        self.hits = 0
        self.misses = 0

    def _make_key(self, query: str, ministry: str) -> str:
        normalized = f"{query.lower().strip()}|{ministry.lower()}"
        return hashlib.md5(normalized.encode()).hexdigest()

    def get(self, query: str, ministry: str) -> Optional[dict]:
        key = self._make_key(query, ministry)

        if key not in self._cache:
            self.misses += 1
            return None

        entry = self._cache[key]
        if datetime.now() - entry["cached_at"] > self.ttl:
            del self._cache[key]
            self.misses += 1
            return None

        self.hits += 1
        logger.info(f"Cache HIT — ratio: {self.hit_ratio:.1%}")
        return entry["data"]

    def set(self, query: str, ministry: str, data: dict):
        # Evict oldest entry if cache is full
        if len(self._cache) >= self.max_size:
            oldest_key = min(
                self._cache,
                key=lambda k: self._cache[k]["cached_at"]
            )
            del self._cache[oldest_key]

        key = self._make_key(query, ministry)
        self._cache[key] = {
            "data": data,
            "cached_at": datetime.now()
        }

    def invalidate_ministry(self, ministry: str):
        """Clear all cache entries for a ministry (call after new doc upload)"""
        # Simple approach: clear all on new upload
        # Production: tag entries by ministry and selectively clear
        self._cache.clear()
        logger.info(f"Cache invalidated for ministry: {ministry}")

    @property
    def hit_ratio(self) -> float:
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0.0

    def stats(self) -> dict:
        return {
            "size": len(self._cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_ratio": f"{self.hit_ratio:.1%}"
        }
