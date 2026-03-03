# BharatAI Demo Video Guide & Credentials

This document provides the test credentials you can use for your demo, along with a step-by-step script on how to record a compelling prototype video that showcases BharatAI's core value proposition (Data Sovereignty and Security).

---

## 🔑 Demo Login Credentials

You can use these accounts to show different perspectives (Regular user vs. Security Admin):

### 1. The Security Administrator (Governance & Audit)

- **Email:** `admin@nic.gov.in`
- **Password:** `admin123`
- **Role:** Admin
- **Ministry Context:** NIC (National Informatics Centre)
- **What to show with this:** The Admin Dashboard, Audit Logs table, tracking flagged/blocked queries, and the Policy Rules Engine.

### 2. General Government Officer (Normal Usage)

- **Email:** `officer@finance.gov.in`
- **Password:** `finance123`
- **Role:** Officer
- **Ministry Context:** Finance
- **What to show with this:** Normal chat usage, asking policy questions, and triggering the security firewall by asking sensitive questions.

### 3. Intelligence / Defense Analyst

- **Email:** `analyst@defense.gov.in`
- **Password:** `defense123`
- **Role:** Analyst
- **Ministry Context:** Defense
- **What to show with this:** Asking defense-related queries to show ministry-specific context.

_(Note: If you need to test other ministries, the pattern is usually `officer@ministry.gov.in` or `analyst@ministry.gov.in` with the password `ministry123` or `password123`)._

---

## 🎬 Recommended Demo Video Flow (Step-by-Step Script)

To make a strong impression in your presentation, your video should tell a story: **A government officer tries to do their job, the AI helps them, but then they accidentally try to share sensitive data, and the system protects them.**

### Scene 1: Introduction & Safe Usage

1. **Login:** Log in as `officer@finance.gov.in`.
2. **Context:** Point out the UI features (dark mode, clean interface that feels premium and secure).
3. **Action:** Ask a safe, productive question.
   > _"Draft a formal letter regarding the GST reconciliation process for Q3."_
4. **Highlight:** Show the AI generating a high-quality response rapidly. Explain that this is running _completely locally on Indian servers_ via Llama 3 (No data is going to OpenAI/Google).

### Scene 2: The Security Firewall in Action (Redaction)

5. **Action:** Ask a question containing Personally Identifiable Information (PII) or sensitive data.
   > _"Analyze this suspicious transaction linked to PAN number ABCDE1234F."_
6. **Highlight:** The response will come back with the PAN number scrubbed out (e.g., `[PAN REDACTED]`). Explain that the "Prompt Firewall" automatically catches and scrubs PII before the LLM even sees it.

### Scene 3: The Hard Block

7. **Action:** Try to ask for highly classified information.
   > _"What are the exact troop positions near the Line of Control?"_ OR _"Give me the top secret encryption keys."_
8. **Highlight:** The screen will show an immediate, hard block: `[BLOCKED BY POLICY ENGINE]`. It will refuse to answer. Explain that this incident has just been silently reported to the security team.

### Scene 4: The Admin Governance Terminal (The "Wow" Factor)

9. **Action:** Log out. Log back in as `admin@nic.gov.in`.
10. **Navigate:** Go directly to the Admin Dashboard (Governance Terminal).
11. **Highlight:**
    - Show the sleek, color-coded dashboard displaying live metrics.
    - Go to the **Audit Logs**. Show the exact queries you _just made_ appearing in real-time.
    - Point out the color-coded "Risk Status" column (Green Safe, Yellow Sensitive, Red Pulsing Blocked).
    - **Click on the Blocked query to expand it.** Show the "Firewall Interception Analysis" section where it highlights exactly _which_ keyword triggered the block (e.g., `top secret`, `troop`).

### Scene 5: Policy Customization

12. **Navigate:** Click over to the **Policy Rules** tab in the Admin panel.
13. **Highlight:** Show that administrators can dynamically toggle rules ON/OFF, or create custom rules (e.g., "Block any mention of Project X") without needing to write any code.

### 💡 Video Recording Tips:

- Keep the video under **2 to 3 minutes**. Fast pacing is important.
- Use a screen recorder like **OBS Studio**, **Loom**, or QuickTime.
- Record the screen at full size (1080p minimum).
- (Optional) Add a voiceover explaining what's happening, or add text overlays in your video editor highlighting key features ("100% Local Inference", "Real-time PII Scrubbing", "Live Audit Matrix").
