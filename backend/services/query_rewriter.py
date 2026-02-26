import os
import re
import logging
import requests
from typing import Optional

logger = logging.getLogger("bharatai")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")


class QueryRewriter:
    """
    Transforms raw officer queries into optimized search strings
    before they hit the RAG retrieval pipeline.

    Steps applied in order:
      1. Acronym expansion   (always)
      2. Spell correction    (always)
      3. LLM expansion       (optional, short queries only)
      4. Ministry context    (always)
    """

    # ------------------------------------------------------------------
    # Government acronym dictionary
    # ------------------------------------------------------------------
    ACRONYMS: dict[str, str] = {
        "PMB":        "Pradhan Mantri Bhartiya",
        "PMJAY":      "Pradhan Mantri Jan Arogya Yojana",
        "PMGSY":      "Pradhan Mantri Gram Sadak Yojana",
        "NEP":        "National Education Policy",
        "RTI":        "Right to Information",
        "DRDO":       "Defence Research and Development Organisation",
        "ICMR":       "Indian Council of Medical Research",
        "NIC":        "National Informatics Centre",
        "GST":        "Goods and Services Tax",
        "RBI":        "Reserve Bank of India",
        "NITI":       "National Institution for Transforming India",
        "UMANG":      "Unified Mobile Application for New-age Governance",
        "DigiLocker": "Digital Document Locker",
        "JAM":        "Jan Dhan Aadhaar Mobile",
        "DBT":        "Direct Benefit Transfer",
        "MoU":        "Memorandum of Understanding",
        "SOP":        "Standard Operating Procedure",
        "BPL":        "Below Poverty Line",
        "APL":        "Above Poverty Line",
        "FIR":        "First Information Report",
        "PIL":        "Public Interest Litigation",
        "MGNREGA":    "Mahatma Gandhi National Rural Employment Guarantee Act",
        "MUDRA":      "Micro Units Development and Refinance Agency",
        "NABARD":     "National Bank for Agriculture and Rural Development",
        "SEBI":       "Securities and Exchange Board of India",
        "IRDAI":      "Insurance Regulatory and Development Authority of India",
        "NPS":        "National Pension System",
        "EPF":        "Employees Provident Fund",
        "ESIC":       "Employees State Insurance Corporation",
        "CGHS":       "Central Government Health Scheme",
        "AIIMS":      "All India Institute of Medical Sciences",
        "IAS":        "Indian Administrative Service",
        "IPS":        "Indian Police Service",
        "UPSC":       "Union Public Service Commission",
        "SSC":        "Staff Selection Commission",
        "CVC":        "Central Vigilance Commission",
        "CAG":        "Comptroller and Auditor General",
    }

    # ------------------------------------------------------------------
    # Spell-correction dictionary — top 50+ misspelled GoI terms
    # ------------------------------------------------------------------
    CORRECTIONS: dict[str, str] = {
        # Schemes
        "ayushman":          "ayushmann",
        "swacch":            "swachh",
        "swach":             "swachh",
        "yojna":             "yojana",
        "yojnaa":            "yojana",
        "ujwala":            "ujjwala",
        "pradhanmantri":     "pradhan mantri",
        "jan-dhan":          "jan dhan",
        "kisaan":            "kisan",
        "kissan":            "kisan",
        "krissan":           "kisan",
        "surakshaa":         "suraksha",
        "surakhsha":         "suraksha",
        "dhan":              "dhan",
        "mudara":            "mudra",
        "mgnregs":           "mgnrega",
        "manrega":           "mgnrega",
        "nrega":             "mgnrega",
        # Ministries / depts
        "minitery":          "ministry",
        "minsitry":          "ministry",
        "minisry":           "ministry",
        "deparment":         "department",
        "deparmtent":        "department",
        "govenment":         "government",
        "goverment":         "government",
        "govenrment":        "government",
        "sarkaar":           "sarkar",
        "sarkari":           "sarkari",
        # Documents
        "circualar":         "circular",
        "notifcation":       "notification",
        "notifiction":       "notification",
        "gudielines":        "guidelines",
        "guidlines":         "guidelines",
        "regulaton":         "regulation",
        "regulaion":         "regulation",
        "legalisation":      "legislation",
        "amendement":        "amendment",
        "ammendment":        "amendment",
        # Common mistyped words
        "benificial":        "beneficial",
        "benifit":           "benefit",
        "benificiary":       "beneficiary",
        "eligibity":         "eligibility",
        "empaneled":         "empanelled",
        "empanelment":       "empanelment",
        "allotement":        "allotment",
        "disbuursement":     "disbursement",
        "disbursment":       "disbursement",
        "reimburesment":     "reimbursement",
        "reimburstment":     "reimbursement",
        "penalti":           "penalty",
        "complience":        "compliance",
        "compliace":         "compliance",
        "grievence":         "grievance",
        "greviance":         "grievance",
        "proceedure":        "procedure",
        "procuderment":      "procurement",
        "procuremnt":        "procurement",
    }

    # ------------------------------------------------------------------
    # Ministry context boosts
    # ------------------------------------------------------------------
    MINISTRY_CONTEXT: dict[str, str] = {
        "Finance":    "ministry finance India government fiscal budget",
        "Defense":    "ministry defence India armed forces security national",
        "Health":     "ministry health India medical scheme hospital ayushmann",
        "Law":        "ministry law India legal act legislation court justice",
        "Education":  "ministry education India school college NEP university",
        "Agriculture": "ministry agriculture India kisan farming rural crop",
        "Railways":   "ministry railways India train transport infrastructure",
        "IT":         "ministry information technology India digital NIC UMANG",
    }

    def rewrite(
        self,
        query: str,
        ministry: str,
        use_llm: bool = True
    ) -> dict:
        """
        Transforms a raw query into an optimized search string.

        Returns:
            {
                "original":          str,   # Untouched user query
                "rewritten":         str,   # Fully expanded search string
                "expansions_applied": list, # What transformations were applied
                "acronyms_found":    list,  # Acronyms detected and expanded
            }
        """
        expansions_applied: list[str] = []
        acronyms_found: list[str] = []

        working_query = query.strip()

        # Step 1: Acronym expansion
        working_query, acronyms_found = self._expand_acronyms(working_query)
        if acronyms_found:
            expansions_applied.append(f"acronym_expansion:{','.join(acronyms_found)}")

        # Step 2: Spell correction
        corrected = self._correct_spelling(working_query)
        if corrected != working_query:
            expansions_applied.append("spell_correction")
        working_query = corrected

        # Step 3: LLM expansion (only for short queries)
        word_count = len(working_query.split())
        if use_llm and word_count < 8:
            llm_expanded = self._llm_expand(working_query)
            if llm_expanded and llm_expanded.strip() != working_query.strip():
                working_query = llm_expanded
                expansions_applied.append("llm_expansion")

        # Step 4: Ministry context boost
        working_query = self._add_ministry_context(working_query, ministry)
        expansions_applied.append(f"ministry_context:{ministry}")

        logger.info(
            f"QueryRewriter: '{query}' → '{working_query[:80]}...' "
            f"| expansions: {expansions_applied}"
        )

        return {
            "original":           query,
            "rewritten":          working_query,
            "expansions_applied": expansions_applied,
            "acronyms_found":     acronyms_found,
        }

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _expand_acronyms(self, query: str) -> tuple[str, list[str]]:
        """
        Scan query tokens for known acronyms.
        Append their full form after the acronym (keeps the original token).
        e.g. "PMJAY limit" → "PMJAY Pradhan Mantri Jan Arogya Yojana limit"
        """
        found: list[str] = []
        tokens = query.split()
        result_tokens: list[str] = []

        for token in tokens:
            clean_token = re.sub(r'[^A-Za-z]', '', token)   # strip punctuation
            expansion = self.ACRONYMS.get(clean_token) or self.ACRONYMS.get(clean_token.upper())
            if expansion:
                found.append(clean_token.upper())
                result_tokens.append(token)
                result_tokens.append(expansion)
            else:
                result_tokens.append(token)

        expanded = " ".join(result_tokens)
        return expanded, found

    def _correct_spelling(self, query: str) -> str:
        """
        Normalizes commonly misspelled GoI scheme/policy terms.
        Works at the word level (case-insensitive match, case-preserving output).
        """
        words = query.split()
        corrected: list[str] = []
        for word in words:
            lower = word.lower()
            if lower in self.CORRECTIONS:
                # Preserve original capitalisation style if possible
                replacement = self.CORRECTIONS[lower]
                if word[0].isupper():
                    replacement = replacement.capitalize()
                corrected.append(replacement)
            else:
                corrected.append(word)
        return " ".join(corrected)

    def _llm_expand(self, query: str) -> Optional[str]:
        """
        Ask local Ollama to expand a short query into a richer search string.
        Returns the expanded query, or None if Ollama is unavailable.
        """
        system_prompt = (
            "You are a government document search optimizer. "
            "Expand the query into a fuller search string. "
            "Return ONLY the expanded query, nothing else. "
            "Keep it under 20 words. Do not answer the question."
        )
        user_prompt = (
            f"Expand this search query for a government document retrieval system: '{query}'"
        )
        try:
            response = requests.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": os.getenv("OLLAMA_MODEL", "llama3"),
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user",   "content": user_prompt},
                    ],
                    "stream": False,
                    "options": {"temperature": 0.0, "num_ctx": 512},
                },
                timeout=15,
            )
            response.raise_for_status()
            expanded = response.json()["message"]["content"].strip()
            # Sanity guard: reject if expanded is suspiciously long or clearly an answer
            if len(expanded.split()) > 30:
                return None
            return expanded
        except Exception as e:
            logger.warning(f"QueryRewriter LLM expansion failed (non-fatal): {e}")
            return None

    def _add_ministry_context(self, query: str, ministry: str) -> str:
        """
        Appends ministry-specific keyword boost to the query.
        Iterates keys as prefix so partial names resolve (e.g. "Health" matches "Health").
        """
        context = None
        for key, terms in self.MINISTRY_CONTEXT.items():
            if key.lower() in ministry.lower():
                context = terms
                break
        if context:
            return f"{query} {context}"
        return query
