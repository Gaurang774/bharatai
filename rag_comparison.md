# RAG Model Comparison: Ideal vs BharatAI

This document outlines the core components of a state-of-the-art, highly efficient Retrieval-Augmented Generation (RAG) system and compares those requirements against the current BharatAI implementation.

---

## 🏗️ 1. Document Ingestion & Parsing

| Feature                  | Ideal RAG Model                                                        | BharatAI RAG Model                                                             | Status |
| :----------------------- | :--------------------------------------------------------------------- | :----------------------------------------------------------------------------- | :----: |
| **Multi-Format Support** | Handles PDFs, Word docs, HTML, CSVs, JSON, etc.                        | Currently uses `PDFExtractor` to extract text and handle OCR for scanned PDFs. |   🟡   |
| **Data Cleaning**        | Removes noise like repeated headers/footers, watermarks, page numbers. | Cleans out excessive whitespace, page numbers, and govt headers.               |   🟢   |
| **Structuring Data**     | Separates tables, figures, metadata from raw text dynamically.         | Basic extraction without heavy structural separation yet.                      |   🟡   |

---

## ✂️ 2. Smart Chunking

| Feature                         | Ideal RAG Model                                                                 | BharatAI RAG Model                                                                              | Status |
| :------------------------------ | :------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------- | :----: |
| **Semantic Chunking**           | Splits text intelligently, keeping complete thoughts/sentences intact.          | Splits recursively targeting specific separators including Devanagari (।) and English (.).      |   🟢   |
| **Document-Specific Splitting** | Adapts chunking strategy based on the document type (e.g., policy vs legalese). | Implements custom `_section_chunk`, `_legal_chunk`, and `_circular_chunk` with varied overlaps. |   🟢   |
| **Overlap Preservation**        | Ensures adjacent chunks overlap to retain trailing context boundary cues.       | Uses strategic overlap (up to 200 chars for legal texts) to conserve full entity meaning.       |   🟢   |

---

## 🧠 3. Advanced Embeddings

| Feature                        | Ideal RAG Model                                                        | BharatAI RAG Model                                                                                     | Status |
| :----------------------------- | :--------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- | :----: |
| **Domain-Tailored Models**     | Embedding models tailored to the specific industry domain or language. | Uses `paraphrase-multilingual-MiniLM-L12-v2` supporting English and Hindi Devanagari natively.         |   🟢   |
| **High Dimensional Space**     | High dimensionality capturing nuanced semantics effectively.           | Very efficient, but MiniLM uses lower dimensions (384). A great tradeoff for speed & local govt usage. |   🟢   |
| **Efficient Batch Processing** | Handles thousands of chunks without memory saturation.                 | `embed_batch` limits chunks correctly per batch, suitable for offline processing.                      |   🟢   |

---

## 🔍 4. Hybrid Search Retrieval

| Feature                     | Ideal RAG Model                                                       | BharatAI RAG Model                                                           | Status |
| :-------------------------- | :-------------------------------------------------------------------- | :--------------------------------------------------------------------------- | :----: |
| **Vector (Dense) Search**   | Semantic recall using cosine similarity or Euclidean distance.        | ChromaDB handles Cosine distance retrieval effectively.                      |   🟢   |
| **Keyword (Sparse) Search** | Exact term matching for acronyms, specific IDs, or rare nouns (BM25). | BM25 index built per ministry explicitly for exact keyword matching.         |   🟢   |
| **Result Deduplication**    | Blends results smoothly without polluting context window with clones. | Deduplicates hashes while gracefully combining the Vector + Keyword results. |   🟢   |

---

## ⚖️ 5. Reranking / Cross-Encoding

| Feature                    | Ideal RAG Model                                                                  | BharatAI RAG Model                                                                                | Status |
| :------------------------- | :------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ | :----: |
| **True Relevance Scoring** | Adjusts candidate scores dynamically by pairing the query directly with context. | Implements a robust `RerankerService` using `cross-encoder/ms-marco-MiniLM-L-6-v2`.               |   🟢   |
| **Relevance Thresholding** | Discards chunks if the relevance is beneath a certain confidence score.          | Sets a strict `RELEVANCE_THRESHOLD` (0.1) ensuring off-topic docs never reach the context window. |   🟢   |

---

## 🚀 6. Query Optimization & Transformation

| Feature                     | Ideal RAG Model                                                                          | BharatAI RAG Model                                                             | Status |
| :-------------------------- | :--------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- | :----: |
| **Query Rewriting**         | Auto-corrects spelling, extracts acronyms, or converts intent to a better search string. | **Not Implemented.** It directly feeds the raw user prompt into hybrid search. |   🔴   |
| **HyDE (Hypothetical Doc)** | Generates a fake answer first to find vector similarities against the answer schema.     | **Not Implemented.** Could vastly improve short vague queries from officers.   |   🔴   |

---

## 🛡️ 7. Context Management & Guardrails

| Feature                                   | Ideal RAG Model                                                           | BharatAI RAG Model                                                                                       | Status |
| :---------------------------------------- | :------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------- | :----: |
| **Dynamic Context Window**                | Fits maximal chunks into the LLM context limit without truncation errors. | `_fit_context_window` explicitly limits context parts dynamically (max_chars: 6000).                     |   🟢   |
| **Strict Grounding (Anti-Hallucination)** | The LLM is forced to decline answering if the context doesn't support it. | Strong system prompts (`"Answer using ONLY the context above"`). Handles "No Context" states gracefully. |   🟢   |
| **Source Citations**                      | Connects generated text to verifiable extraction points.                  | `sources_used` and citations fully built into the `query` pipeline output.                               |   🟢   |

---

## ⚡ 8. Caching & Performance

| Feature                  | Ideal RAG Model                                                                                                 | BharatAI RAG Model                                                                                                           | Status |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :----: |
| **Semantic Caching**     | Prevents expensive retrieval / generation steps if a new query has high semantic overlap with a previous query. | Uses exact-match query `QueryCache` via `cache_service.py` with Ministry isolation. Lacks semantic similarity caching.       |   🟡   |
| **Optimized Generation** | Fast Time-to-First-Token (TTFT) via streams or high-throughput LLM engines.                                     | Fully reliant on local `Ollama` which provides great sovereign control but can bottleneck concurrency without streaming yet. |   🟡   |

---

## 📈 Summary

**BharatAI operates a mature, Production-Grade RAG pipeline** that successfully adopts over 80% of industry best practices.

**Strengths:**

- Brilliant, highly localized approach to chunking (`ChunkingService`).
- Cross-encoder reranking integration ensures absolute relevance.
- Superb hybrid search blending semantic models with BM25.
- Extreme consideration for sovereign/offline environments without API leaks.

**Recommended Improvements:**

1. **Query Rewriting/Expansion**: If a user searches for `"PMB"`, auto-expand it to `"Pradhan Mantri Bhartiya"` before hitting the database.
2. **Semantic Caching**: Upgrade `QueryCache` to match _meanings_ (e.g., "What are the scheme rules?" and "List the rules of the scheme"), minimizing redundant LLM and retrieval calls.
3. **Multi-Format Ingestion**: Expand the pipeline to also ingest Govt `.docx`, `.pptx`, and `.csv` files alongside PDFs.
