# Eraser.io Workflow Prompt — BharatAI

> Copy and paste the following prompt directly into **Eraser.io** to generate a clean, single-slide workflow diagram for your presentation.

---

## 🎯 PROMPT FOR ERASER.IO

```text
Create a clean, visual architecture and workflow diagram for "BharatAI", a sovereign AI platform for government employees. The diagram MUST be compact, horizontal, and fit perfectly on a single PowerPoint slide. Use a dark theme with blue and orange accents.

Here is the exact workflow and structure to map:

1. **User Request (Left side):**
   - Government Officer types a prompt (e.g., "Analyze tax policy")

2. **Security Gateway (Middle-Left):**
   - The prompt goes to the "Prompt Firewall"
   - Under this, list 3 simple actions: [Detect Keywords] -> [Redact PII] -> [Audit Logging]

3. **Knowledge Retrieval / RAG (Middle):**
   - If safe, the prompt connects to "Sovereign Knowledge Base (ChromaDB)"
   - Show an icon representing "Isolated Ministry Documents" feeding into it.

4. **AI Generation (Middle-Right):**
   - The augmented prompt connects to "Local LLM (Llama 3)"
   - Ensure you label it as "Air-Gapped / No Cloud"

5. **Final Output (Right Side):**
   - The LLM connects to "Secure Response"
   - Points back to the Government Officer.

**Style Instructions for Eraser.io:**
- Make it a flowchart (left-to-right).
- Group the "Prompt Firewall", "ChromaDB", and "Local LLM" inside a large box labeled "BharatAI Sovereign Infrastructure (NIC Data Center)".
- Ensure the layout is horizontally constrained so I can export it as a wide image for a 16:9 presentation slide without text being too small to read.
- Use lock/shield icons for the firewall, database icons for ChromaDB, and a brain/chip icon for the LLM.
```
