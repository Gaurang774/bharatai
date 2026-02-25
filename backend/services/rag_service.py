import os
from typing import List, Tuple
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from dotenv import load_dotenv
from services.redaction_service import RedactionService
from langchain_ollama import OllamaEmbeddings

load_dotenv()

CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", "./chromadb")
EMBEDDING_MODEL = "nomic-embed-text"
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

class RAGService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            print(">>> Initializing Sovereign Knowledge Model (SentenceTransformer)...")
            cls._instance = super(RAGService, cls).__new__(cls)
            cls._instance.embeddings = OllamaEmbeddings(
                model=EMBEDDING_MODEL,
                base_url=OLLAMA_URL
            )
            cls._instance.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            cls._instance.redactor = RedactionService()
            print("--- RAG Engine Ready.")
        return cls._instance

    def __init__(self):
        # Already handled in __new__ for singleton
        pass

    def process_and_store_document(self, file_path: str, ministry: str) -> Tuple[int, int]:
        """
        Loads, splits, redacts PII, and stores a document in ChromaDB.
        Returns (chunk_count, total_redactions).
        """
        if file_path.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
        else:
            loader = TextLoader(file_path)
            
        documents = loader.load()
        chunks = self.text_splitter.split_documents(documents)
        
        # Redact PII and add metadata
        total_redactions = 0
        for chunk in chunks:
            chunk.metadata["ministry"] = ministry
            redacted_content, count = self.redactor.redact_text(chunk.page_content)
            chunk.page_content = redacted_content
            total_redactions += count
            
        vectorstore = Chroma.from_documents(
            documents=chunks,
            embedding=self.embeddings,
            persist_directory=os.path.join(CHROMA_DB_DIR, ministry)
        )
        return len(chunks), total_redactions

    def retrieve_context(self, query: str, ministry: str, k: int = 3) -> Tuple[str, int, float]:
        """
        Retrieves relevant context with confidence scoring.
        Returns (context_text, num_docs_found, avg_confidence_pct).
        """
        db_path = os.path.join(CHROMA_DB_DIR, ministry)
        if not os.path.exists(db_path):
            return "", 0, 0.0

        vectorstore = Chroma(
            persist_directory=db_path,
            embedding_function=self.embeddings
        )
        
        try:
            results = vectorstore.similarity_search_with_relevance_scores(query, k=k)
            if not results:
                return "", 0, 0.0
            
            docs_text = "\n\n".join([doc.page_content for doc, score in results])
            avg_score = sum(score for _, score in results) / len(results)
            confidence_pct = round(min(max(avg_score * 100, 0), 100), 1)
            return docs_text, len(results), confidence_pct
        except Exception:
            # Fallback to basic similarity search
            docs = vectorstore.similarity_search(query, k=k)
            return "\n\n".join([doc.page_content for doc in docs]), len(docs), 0.0
