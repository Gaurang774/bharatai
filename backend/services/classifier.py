from typing import List, Tuple

SENSITIVE_KEYWORDS = [
    "aadhaar number", "pan number", "troop", "missile", "classified", 
    "nuclear", "defense budget", "tax evasion", "bank account", 
    "passport number", "confidential", "secret", "top secret",
    "internal memo", "cabinet decision"
]

class PromptClassifier:
    @staticmethod
    def scan_for_sensitive_data(text: str) -> Tuple[bool, List[str]]:
        """
        Scans text for sensitive keywords.
        Returns (is_sensitive, list_of_keywords_found)
        """
        found_keywords = []
        lower_text = text.lower()
        
        for keyword in SENSITIVE_KEYWORDS:
            if keyword in lower_text:
                found_keywords.append(keyword)
        
        return len(found_keywords) > 0, found_keywords

    @staticmethod
    def get_sensitivity_level(found_keywords: List[str]) -> str:
        if not found_keywords:
            return "low"
        if any(k in ["top secret", "nuclear", "missile", "troop"] for k in found_keywords):
            return "high"
        return "medium"
