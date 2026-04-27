from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
import re


class ChunkingService:
    """
    Smart chunking that preserves context and supports
    Indian language documents (Hindi, Marathi, etc.)
    """

    SEPARATORS = [
        "\n\n",      # Paragraphs (strongest break)
        "\n",        # Line breaks
        "।",         # Hindi/Devanagari full stop
        ". ",        # English sentence
        ", ",        # Clause break
        " ",         # Word break (last resort)
    ]

    def chunk_document(
        self,
        text: str,
        doc_type: str = "general",
        source_name: str = ""
    ) -> List[dict]:
        """
        Returns list of chunks with metadata:
        [{ "text": str, "chunk_index": int, "source": str, "char_start": int }]
        """
        # Clean text first
        text = self._clean_text(text)

        # Choose strategy based on doc type
        if doc_type == "policy":
            chunks = self._section_chunk(text)
        elif doc_type == "legal":
            chunks = self._legal_chunk(text)
        elif doc_type == "circular":
            chunks = self._circular_chunk(text)
        else:
            chunks = self._recursive_chunk(text)

        # Add metadata to each chunk
        return [
            {
                "text": chunk,
                "chunk_index": i,
                "source": source_name,
                "char_count": len(chunk),
                "word_count": len(chunk.split())
            }
            for i, chunk in enumerate(chunks)
            if len(chunk.strip()) > 50  # Skip tiny chunks
        ]

    def _recursive_chunk(self, text: str) -> List[str]:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150,  # Overlap prevents losing context at boundaries
            separators=self.SEPARATORS,
            length_function=len,
        )
        return splitter.split_text(text)

    def _section_chunk(self, text: str) -> List[str]:
        """Split by section headers for policy documents"""
        # Detect section headers (numbered, roman numerals, capitalized)
        section_pattern = r'\n(?=\d+\.|[IVX]+\.|[A-Z]{2,})'
        sections = re.split(section_pattern, text)

        result = []
        for section in sections:
            if len(section) > 800:
                # Section too long, recursively chunk it
                result.extend(self._recursive_chunk(section))
            else:
                result.append(section)
        return result

    def _legal_chunk(self, text: str) -> List[str]:
        """Split by legal paragraph markers"""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,  # Higher overlap for legal (context critical)
            separators=["\n\n", "\n", "।", ". "],
        )
        return splitter.split_text(text)

    def _circular_chunk(self, text: str) -> List[str]:
        """Split government circulars by numbered points"""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=600,
            chunk_overlap=100,
            separators=["\n\n", r"\n\d+\.", "\n", "।", ". "],
        )
        return splitter.split_text(text)

    def _clean_text(self, text: str) -> str:
        """Remove noise from extracted PDF text"""
        # Remove excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        # Remove page numbers (common in govt PDFs)
        text = re.sub(r'\n\s*\d+\s*\n', '\n', text)
        # Remove header/footer repetitions
        text = re.sub(r'Government of India.{0,50}\n', '', text)
        return text.strip()
