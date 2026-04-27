import pdfplumber
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger("bharatai")


class PDFExtractor:
    """
    Production PDF extractor that handles:
    - Normal text PDFs
    - Scanned/image PDFs (via OCR)
    - PDFs with tables
    - Hindi/regional language content
    """

    MINIMUM_TEXT_LENGTH = 100  # Below this, assume scanned PDF

    def extract(self, filepath: str) -> dict:
        """
        Returns:
        {
            "text": str,
            "tables": list[list],
            "page_count": int,
            "has_tables": bool,
            "is_scanned": bool,
            "language": str,
            "extraction_method": str
        }
        """
        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError(f"PDF not found: {filepath}")

        result = {
            "text": "",
            "tables": [],
            "page_count": 0,
            "has_tables": False,
            "is_scanned": False,
            "language": "auto",
            "extraction_method": "pdfplumber"
        }

        try:
            with pdfplumber.open(filepath) as pdf:
                result["page_count"] = len(pdf.pages)

                for page_num, page in enumerate(pdf.pages):
                    # Extract text
                    page_text = page.extract_text() or ""
                    result["text"] += f"\n{page_text}"

                    # Extract tables
                    tables = page.extract_tables()
                    if tables:
                        result["has_tables"] = True
                        for table in tables:
                            # Convert table to readable text format
                            table_text = self._table_to_text(table)
                            result["text"] += f"\n\n[TABLE]\n{table_text}\n[/TABLE]\n"
                            result["tables"].append(table)

        except Exception as e:
            logger.error(f"pdfplumber extraction failed: {e}")

        # If text is too short, it's probably a scanned PDF
        if len(result["text"].strip()) < self.MINIMUM_TEXT_LENGTH:
            logger.info(f"Scanned PDF detected, using OCR: {filepath}")
            result["is_scanned"] = True
            result["extraction_method"] = "tesseract_ocr"
            result["text"] = self._ocr_extract(filepath)

        # Detect if content is Hindi
        if self._is_hindi(result["text"]):
            result["language"] = "hi"

        return result

    def _ocr_extract(self, filepath: str) -> str:
        """OCR extraction for scanned PDFs"""
        try:
            import pdf2image
            import pytesseract
            images = pdf2image.convert_from_path(filepath, dpi=300)

            text_parts = []
            for image in images:
                # Try Hindi + English OCR
                text = pytesseract.image_to_string(
                    image,
                    lang="hin+eng",  # Hindi + English
                    config="--psm 6"  # Assume uniform block of text
                )
                text_parts.append(text)

            return "\n".join(text_parts)

        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return ""

    def _table_to_text(self, table: list) -> str:
        """Convert table array to readable text"""
        if not table:
            return ""
        rows = []
        for row in table:
            clean_row = [str(cell or "").strip() for cell in row]
            rows.append(" | ".join(clean_row))
        return "\n".join(rows)

    def _is_hindi(self, text: str) -> bool:
        """Detect if text contains significant Hindi content"""
        devanagari_chars = sum(1 for c in text if '\u0900' <= c <= '\u097F')
        return devanagari_chars > len(text) * 0.1  # 10%+ Devanagari = Hindi doc
