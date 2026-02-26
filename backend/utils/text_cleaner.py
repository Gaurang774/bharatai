import re


class TextCleaner:
    """
    Static text cleaning utilities shared across the RAG pipeline.
    Used by QueryRewriter and ChunkingService.
    """

    @staticmethod
    def normalize_whitespace(text: str) -> str:
        """Collapse excessive newlines and spaces"""
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        return text.strip()

    @staticmethod
    def remove_page_numbers(text: str) -> str:
        """Strip common PDF page number patterns"""
        return re.sub(r'\n\s*\d+\s*\n', '\n', text)

    @staticmethod
    def remove_govt_headers(text: str) -> str:
        """
        Remove repeated Government of India headers, ministry lines,
        and file number references common in GoI PDFs.
        """
        patterns = [
            r'Government of India.{0,50}\n',
            r'भारत सरकार.{0,50}\n',
            r'Ministry of.{0,80}\n',
            r'No\.\s*[A-Z0-9\/\-]+\s*\n',   # File numbers e.g. "No. 12/23/2021-ES"
            r'F\.No\..{0,50}\n',              # F.No. style references
            r'D\.O\.No\..{0,50}\n',           # D.O.No. references
        ]
        for pattern in patterns:
            text = re.sub(pattern, '', text)
        return text

    @staticmethod
    def normalize_hindi_text(text: str) -> str:
        """Normalize Devanagari punctuation variants"""
        text = text.replace('।।', '।')
        text = text.replace('॥', '।')
        return text

    @staticmethod
    def clean_all(text: str) -> str:
        """Run the full cleaning pipeline"""
        text = TextCleaner.normalize_whitespace(text)
        text = TextCleaner.remove_page_numbers(text)
        text = TextCleaner.remove_govt_headers(text)
        text = TextCleaner.normalize_hindi_text(text)
        return text
