# Simple RubriQ Demo & User Manual

## 1. Purpose & Positioning
Simple RubriQ is a GCSE-focused AI marking and moderation platform. It accelerates teacher workflows while preserving pedagogical transparency and quality. This guide helps you run a polished demo and train new users quickly.

## 2. Core Value Hooks (Use Early in Demo)
- Curriculum alignment: AO1–AO4 embedded across feedback, rubrics, band analysis.
- Speed: Keyboard shortcuts + comment bank + batch AI pre‑mark reduce minutes per script.
- Governance: Rubric versioning & lineage ensure controlled evolution and auditability.
- Moderation: Calibration sessions measure marker agreement (avg & SD per AO). 
- Cost control: Toggle AI pre‑marking on batch ingestion to manage token spend.

## 3. Prerequisites
- Supabase project with migrations applied (rubric metadata + calibration tables).
- Environment variables (if needed for OpenAI) already configured in `supabaseClient` / edge function.
- Teacher account created (see `TEST_ACCOUNT.md`).
- At least 2–3 sample essays loaded (`test-data/` folder helpful).
- One or more rubrics created (using templates or manual import).

## 4. First-Time Setup (Internal)
1. Clone repo & install deps:
   ```powershell
   npm install
   npm run dev
   ```
2. Apply migrations (if not already): rubric metadata + calibration tables.
3. Log in with teacher account.
4. (Optional) Seed essays & feedback for richer demo context.

## 5. High-Level Navigation Map
- Dashboard: Overview (future analytics hub)
- Rubrics: Create, clone, version lineage
- Essay Feedback: Single essay AI marking, AO legend, comment bank
- Batch: Bulk upload & optional AI pre‑mark
- Calibration: Moderation sessions & agreement stats
- Analytics (placeholder): Future heatmaps
- Students: Roster management
- Admin (if enabled): Administrative controls

## 6. Creating a Rubric
### Option A: Template-Based
1. Navigate to `Rubrics`.
2. Choose Exam Board (AQA, Edexcel, OCR, WJEC).
3. Select a template – criteria auto-populate.
4. Adjust criteria if needed; save.

### Option B: File Import
1. Click "Choose File" and upload `.txt` / `.docx` rubric.
2. Parsed criteria appear; edit & save.

### Cloning & Versioning
- Click `Clone` → auto creates `(v2)`, `(v3)`, etc.
- Click `Lineage` to view chronological version table (versions, exam board, criteria count).

## 7. Essay Feedback Workflow (Single Essay)
1. Open `Essay Feedback`.
2. Paste or load essay content (future: link student/essay).
3. Toggle AO Legend (optional) to show AO1–AO4 definitions.
4. Use keyboard shortcuts:
   - `Ctrl + Enter`: Generate AI feedback
   - `Ctrl + Shift + P`: Export PDF
   - `Ctrl + Shift + D`: Export DOCX
   - `Ctrl + ↑ / ↓`: Adjust overall score
   - `Shift + ?`: Shortcut help panel
5. Expand Comment Bank:
   - Filter by AO or category; search.
   - Insert snippet into strengths / improvements / grammar.
6. Export with AO legend included (if toggled on).

## 8. Comment Bank Details
- Snippets organized by AO1–AO4 + category (strength/improvement/spag).
- Insert appends to selected feedback bucket.
- Copy button for ad‑hoc usage outside structured fields.
- Purpose: enforce consistency & reduce repetitive typing.

## 9. Batch Processing
1. Go to `Batch`.
2. Upload multiple essays (CSV or text sources depending on implementation).
3. Toggle `AI pre‑mark on upload`:
   - On: AI feedback generated immediately.
   - Off: Stores raw essays for later manual or selective marking (saves costs).
4. Monitor progress indicators (future extension: queue status, retry logic).

## 10. Calibration / Moderation Sessions
1. Open `Calibration`.
2. Set Session Name (e.g., "November Mock Scripts").
3. Select a rubric.
4. Choose up to 10 essays for sampling.
5. Create session → opens marking interface.
6. Select essay pill → view content.
7. Enter AO1–AO4 scores; submit.
8. Review table of marks (marker anonymized by ID prefix).
9. Agreement Stats show per-AO average & standard deviation:
   - Low SD → strong consistency.
   - High SD → potential criteria ambiguity → refine rubric & version up.

## 11. Rubric Lineage Modal
- Shows all versions sharing a base name (strips `(vN)` suffix).
- Columns: Version, Name, Exam Board, Criteria Count, Created Date.
- Demo Narrative: "We iterate after moderation to tighten descriptors—auditable and transparent."

## 12. GCSE Band Analysis (AI Feedback)
- Generated feedback includes AO scoring + band contextual justification.
- Use for explaining reliable grade boundaries.
- Potential extension: highlight target next band improvement suggestions.

## 13. Keyboard Shortcuts Reference
| Action | Shortcut |
|--------|----------|
| Generate Feedback | Ctrl+Enter |
| Export PDF | Ctrl+Shift+P |
| Export DOCX | Ctrl+Shift+D |
| Adjust Score Up/Down | Ctrl+↑ / Ctrl+↓ |
| Toggle Help Panel | Shift+? |

## 14. Suggested Demo Script (10–12 Minutes)
1. Intro (Value positioning) – 1 min.
2. Rubric creation using template – 1 min.
3. Clone rubric & show lineage – 1 min.
4. Paste essay → generate AI feedback – 2 min.
5. Insert snippets from Comment Bank – 1 min.
6. Toggle AO legend & export PDF – 1 min.
7. Batch ingestion with AI pre‑mark explanation – 1 min.
8. Calibration session creation & marking one essay – 2 min.
9. Show agreement stats + lineage tie‑in – 1 min.
10. Close with differentiators & roadmap (streaming AI, student portal) – 1 min.

## 15. Differentiators (Slide / Verbal Wrap)
- Standards fidelity (AO everywhere)
- Workflow speed (shortcuts + snippets + batch options)
- Pedagogical governance (version lineage + moderation stats)
- Cost control (selective AI usage)
- Extensible roadmap (student portal, analytics heatmaps, streaming feedback)

## 16. Troubleshooting Cheat Sheet
| Issue | Cause | Fix |
|-------|-------|-----|
| Rubric save error (missing column) | Migration not applied | Re-run metadata migration SQL |
| Clone throws version error | Missing `version` column | Apply migrations; ensure default 1 |
| Calibration tables missing | New migration not applied | Run calibration migration file |
| Empty AI feedback | API key misconfig / rate limit | Check OpenAI env & logs |
| High SD in calibration | Rubric criteria unclear | Refine wording & clone new version |

## 17. Roadmap (Mention if Asked)
- Criteria diff visualization between versions.
- Student portal (feedback + next steps tasks).
- Streaming token-by-token AI generation.
- AO performance heatmaps & drift alerts.
- Department-level rubric sharing & pinning.

## 18. Quick Glossary
- **AO (Assessment Objective):** Standards-aligned dimension of performance.
- **Calibration Session:** Controlled marking of sample essays to assess consistency.
- **Lineage:** Historical chain of rubric versions for audit & refinement.
- **Pre‑Mark:** Automated initial feedback generation during bulk ingestion.

## 19. Demo Prep Checklist
- [ ] Migrations applied
- [ ] Teacher account ready
- [ ] At least 3 sample essays present
- [ ] 1 template rubric + 1 cloned version (v2) created
- [ ] Comment bank visible & functional
- [ ] Calibration session ready or quickly creatable
- [ ] PDF export tested
- [ ] AI key valid

## 20. Closing Guidance
Always narrate WHY each feature matters in teacher terms (time saved, reliability, consistency, trust). Connect rubric lineage + calibration results to a culture of continuous improvement.

---
Prepared for internal demos and early user onboarding.
