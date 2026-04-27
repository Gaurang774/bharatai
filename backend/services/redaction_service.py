import re
from typing import Tuple

# PII Patterns for Indian Government Documents
AADHAAR_PATTERN = re.compile(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b')
PAN_PATTERN = re.compile(r'\b[A-Z]{5}\d{4}[A-Z]\b')
PHONE_PATTERN = re.compile(r'\b[6-9]\d{9}\b')
EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')

PATTERNS = [
    (AADHAAR_PATTERN, "[AADHAAR REDACTED]"),
    (PAN_PATTERN, "[PAN REDACTED]"),
    (PHONE_PATTERN, "[PHONE REDACTED]"),
    (EMAIL_PATTERN, "[EMAIL REDACTED]"),
]

class RedactionService:
    @staticmethod
    def redact_text(text: str) -> Tuple[str, int]:
        """
        Scans text for PII (Aadhaar, PAN, Phone, Email) and replaces with [REDACTED] tags.
        Returns (redacted_text, total_redaction_count).
        """
        total_redactions = 0
        redacted = text

        for pattern, replacement in PATTERNS:
            matches = pattern.findall(redacted)
            total_redactions += len(matches)
            redacted = pattern.sub(replacement, redacted)

        return redacted, total_redactions
