# Daily Job Search Guide — Semil Periyasamy

Everything you need to run your job search daily.
No AI needed for most of this — just the commands below.

---

## YOUR FULL PIPELINE AT A GLANCE

```
SCAN → EVALUATE → GENERATE CV → APPLY → TRACK → FOLLOW UP
```

| Step | What happens | How | Command |
|------|-------------|-----|---------|
| Scan | Finds new ML/AI jobs from 91 companies | Command (zero AI) | `node scan.mjs` |
| Evaluate | Scores each job 1-5, writes report | **Option A:** AI chat (me) | Paste JD → I evaluate |
| Evaluate | Scores each job 1-5, writes report | **Option B:** openai-eval (your Qubrid/Qwen model) | `node openai-eval.mjs --file jds/job.txt` |
| Generate CV | Tailored PDF — fetch JD + tailor + PDF | Command | `node generate-cv.mjs --url <url>` |
| Apply | Fills form + submits | Command | `node output/_apply_today.mjs --submit` |
| Track | Updates applications.md | Auto (after submit) | Auto — or edit manually |
| Follow up | Tells you when to follow up | Command | `node followup-cadence.mjs` |

---

## TWO WAYS TO EVALUATE A JOB

### Option A — With AI chat (me, in Kiro)
Just paste the job URL or JD text in this chat and I evaluate it.
No command needed. I write the full report + score + PDF.

### Option B — With your configured Qwen/OpenAI-compatible model
Your `.env` already has `OPENAI_BASE_URL`, `OPENAI_MODEL`, `OPENAI_API_KEY` set.

```bash
# Save the JD text to a file first
# Then evaluate it:
node openai-eval.mjs --file jds/job-name.txt

# Or paste JD inline:
node openai-eval.mjs "Full job description text here..."
```

This uses your Qubrid endpoint (the model configured in `.env`).
It reads `modes/oferta.md` + `cv.md` and produces a full A-G evaluation report
saved to `reports/`.

**Note:** This is evaluation only — it does not generate the tailored CV PDF.
For the CV you still need AI chat, or manually edit `cv.md` and run `generate-pdf.mjs`.

---

## HOW TO GENERATE A PDF CV

### Step 1 — Edit cv.md for the specific job (with AI)
In chat: *"Tailor my CV for [Company] [Role] — here's the JD: [paste JD]"*
I rewrite `cv.md` with keywords from the JD.

### Step 2 — Generate the HTML (with AI or manually)
In chat: *"Generate CV HTML for [Company] [Role]"*
This creates `output/[slug]-cv.html`

### Step 3 — Convert HTML to PDF (command, no AI needed)
```bash
node generate-pdf.mjs output/[slug]-cv.html output/[slug]-cv.pdf --format=a4
```

Example:
```bash
node generate-pdf.mjs output/sarvam-vision-cv.html output/sarvam-vision-cv.pdf --format=a4
```

---

## DAILY COMMANDS — IN ORDER

### Every morning — check your status first

```bash
cd /Users/akconsultants/Downloads/career-ops
node daily-status.mjs
```

This shows:
- How many applied, responded, interviews, offers
- Which jobs are READY TO APPLY right now (CV done)
- Which jobs still need a CV generated
- How many unread jobs are in the pipeline inbox
- Today's priority list

---

### Every 2-3 days — scan for new jobs

```bash
cd /Users/akconsultants/Downloads/career-ops
node scan.mjs
```

- Hits all 91 companies (Sarvam, Ema, Swiggy, Meesho, Freshworks, etc.)
- Filters India locations only (Bangalore, Chennai, Hyderabad, Mumbai)
- Filters ML/AI titles only
- Skips anything already seen
- New jobs appear in `data/pipeline.md` under `## Pending`

With liveness check (slower, ~10 min — confirms job is still open):
```bash
node scan.mjs --verify --throttle
```

Scan a single company only:
```bash
node scan.mjs --company "Sarvam AI"
```

---

### After scan — evaluate new jobs

**One command — uses your Qubrid/Qwen model from `.env`:**

```bash
node pipeline-eval.mjs
```

This:
1. Reads every `- [ ]` URL from `data/pipeline.md`
2. Fetches each JD via Playwright (handles Ashby, Greenhouse, Lever SPAs)
3. Evaluates each one using your configured Qwen model (`OPENAI_MODEL` in `.env`)
4. Saves report to `reports/`
5. Marks each URL as `- [x]` in `pipeline.md`
6. Merges tracker additions automatically

Dry run first to see what will be evaluated:
```bash
node pipeline-eval.mjs --dry-run
```

Process only first 5 jobs:
```bash
node pipeline-eval.mjs --limit 5
```

---

### After evaluation — generate CVs for 4.0+ jobs

**One command — uses your Qubrid/Qwen model from `.env`:**

```bash
# From a job URL (fetches JD automatically via Playwright):
node generate-cv.mjs --url https://jobs.ashbyhq.com/company/job-id

# From a saved JD file:
node generate-cv.mjs --file jds/role.txt --slug company-role
```

This:
1. Fetches the JD via Playwright
2. Asks your Qwen model to tailor the CV (reorder bullets, inject keywords)
3. Generates HTML → `output/{slug}-cv.html`
4. Converts to PDF → `output/{slug}-cv.pdf`

Zero chat credits used.

---

### Before applying — dry run to check forms

```bash
cd /Users/akconsultants/Downloads/career-ops
node output/_apply_today.mjs
```

- Opens browser (visible so you can watch)
- Fills all 3 forms with human-like typing speed
- Saves screenshots: `output/[job]-filled.png`
- Does NOT submit

Open screenshots to verify:
```bash
open output/ema-swe-ml-filled.png
open output/sarvam-evaluations-filled.png
open output/sarvam-embedded-ds-filled.png
```

---

### Apply — actually submit

```bash
node output/_apply_today.mjs --submit
```

- Types with human speed + mouse movement (avoids bot detection)
- Waits for PDF to parse before submitting
- Takes confirmation screenshot after submit
- **Auto-updates `data/applications.md`** → status changes to `Applied`

After submit, verify:
```bash
node daily-status.mjs
```
Applied count should go up.

---

### Check who to follow up with

```bash
node followup-cadence.mjs
```

Shows which Applied companies you should follow up with and when.
Rule: follow up after 7 days of silence.

---

### Check for reposted / suspicious jobs

```bash
node detect-reposts.mjs --summary
```

Flags any job that has been reposted 2+ times in 90 days
(sign of a role that's hard to fill or a ghost listing).

---

### Health check — verify tracker is clean

```bash
node verify-pipeline.mjs
```

Checks:
- All statuses are valid
- No duplicate entries
- All report links work
- All scores are formatted correctly

Run this weekly or after big batch applies.

---

### End of day — sync to git

```bash
cd /Users/akconsultants/Downloads/career-ops
git add cv.md config/profile.yml modes/_profile.md portals.yml \
        data/ reports/ output/ interview-prep/ jds/ batch/tracker-additions/
git commit -m "sync $(date +%Y-%m-%d)"
git push
```

This saves everything to your private `semil007/CareerOS` repo.
Pull on another computer with: `git pull`

---

## WEEKLY TASKS

### Analyse patterns (every week)

```bash
node analyze-patterns.mjs
```

Shows:
- Which companies advance your applications most
- Which titles score highest for you
- ATS channel analysis (Ashby vs Greenhouse vs Lever)
- Helps you focus on the right companies

### Normalize statuses (if you edited tracker manually)

```bash
node normalize-statuses.mjs
```

Fixes any status typos or non-canonical values.

### Dedup tracker (if entries look doubled)

```bash
node dedup-tracker.mjs
```

---

## UPDATING STATUS MANUALLY

When a company emails you — open `data/applications.md` and change the Status column:

```
Evaluated → Applied → Responded → Interview → Offer
                                           → Rejected
```

**Status values (exact spelling matters):**

| Status | When to use |
|--------|-------------|
| `Evaluated` | Report done, not yet applied |
| `Applied` | Form submitted |
| `Responded` | Company replied (any reply) |
| `Interview` | Interview scheduled |
| `Offer` | Got an offer |
| `Rejected` | Rejected by company |
| `Discarded` | You withdrew / job closed |
| `SKIP` | Not a fit, never applying |

After editing, run `node daily-status.mjs` to see updated dashboard.

---

## KEY FILES — WHERE EVERYTHING LIVES

| File | What it is |
|------|-----------|
| `data/applications.md` | Master tracker — every job you've touched |
| `data/pipeline.md` | Inbox — pending URLs to evaluate |
| `data/scan-history.tsv` | Dedup log — prevents re-scanning same jobs |
| `output/[job]-cv.pdf` | Your tailored CVs |
| `output/[job]-filled.png` | Dry-run form screenshots |
| `output/[job]-submitted.png` | Post-submit confirmation screenshots |
| `reports/[num]-[company]-[date].md` | Evaluation reports |
| `cv.md` | Your master CV (source of truth) |
| `config/profile.yml` | Your profile, targets, salary range |
| `modes/_profile.md` | AI scoring preferences |
| `portals.yml` | 91 companies the scanner watches |
| `DAILY_GUIDE.md` | This file |

---

## FEATURES SUMMARY

| Feature | Command | Needs AI? | Frequency |
|---------|---------|-----------|-----------|
| Daily dashboard | `node daily-status.mjs` | No | Every morning |
| Scan new jobs | `node scan.mjs` | No | Every 2-3 days |
| Evaluate all pipeline jobs | `node pipeline-eval.mjs` | Uses Qubrid/Qwen from `.env` | After scan |
| Generate CV from job URL | `node generate-cv.mjs --url <url>` | Uses Qubrid/Qwen from `.env` | After evaluation |
| Generate CV from JD file | `node generate-cv.mjs --file jds/x.txt --slug name` | Uses Qubrid/Qwen from `.env` | After evaluation |
| Dry-run apply | `node output/_apply_today.mjs` | No | Before every submit |
| Submit applications | `node output/_apply_today.mjs --submit` | No | After dry-run check |
| Follow-up reminders | `node followup-cadence.mjs` | No | Every 2-3 days |
| Repost detection | `node detect-reposts.mjs --summary` | No | Weekly |
| Pattern analysis | `node analyze-patterns.mjs` | No | Weekly |
| Pipeline health | `node verify-pipeline.mjs` | No | Weekly |
| Git sync | `git add ... && git commit && git push` | No | End of every day |

---

## SARVAM 60-DAY RULE

Sarvam AI has a 60-day application limit per candidate.

The apply script checks automatically:
- If you applied to ANY Sarvam role in the last 60 days → it skips all Sarvam jobs
- Shows: `🕐 SKIPPED — Sarvam AI — applied X days ago. Cooldown: Y days remaining.`

You can still apply to non-Sarvam jobs in the same run.

---

## COMPLETE DAILY WORKFLOW (COPY-PASTE READY)

```bash
# ── MORNING ──────────────────────────────────────────────────
cd /Users/akconsultants/Downloads/career-ops

# 1. Check what needs doing today
node daily-status.mjs

# 2. Scan for new jobs (every 2-3 days)
node scan.mjs

# ── EVALUATE NEW JOBS ─────────────────────────────────────────
# Uses your Qubrid/Qwen model from .env — no AI chat needed
node pipeline-eval.mjs

# ── GENERATE CV (after evaluate, before apply) ───────────────────
# Uses your Qubrid/Qwen model — zero chat credits
node generate-cv.mjs --url https://jobs.ashbyhq.com/company/job-id

# ── APPLYING ─────────────────────────────────────────────────
# 3. Dry run — check forms look right (opens browser)
node output/_apply_today.mjs

# 4. Open screenshots and verify everything is correct
open output/ema-swe-ml-filled.png
open output/sarvam-evaluations-filled.png

# 5. Submit (only after dry run looks good)
node output/_apply_today.mjs --submit

# 6. Verify tracker updated
node daily-status.mjs

# ── FOLLOW-UP ────────────────────────────────────────────────
# 7. Check who to follow up with
node followup-cadence.mjs

# ── END OF DAY ───────────────────────────────────────────────
# 8. Sync to git
git add cv.md config/profile.yml modes/_profile.md portals.yml \
        data/ reports/ output/ interview-prep/ jds/
git commit -m "sync $(date +%Y-%m-%d)"
git push
```

---

## WHAT YOU CAN DO WITHOUT AI vs WHAT NEEDS AI

**Fully automated — no AI needed:**
- `node scan.mjs` — finds jobs (zero tokens)
- `node daily-status.mjs` — dashboard
- `node openai-eval.mjs --file jds/job.txt` — evaluate using your Qubrid/Qwen model in `.env`
- `node generate-pdf.mjs in.html out.pdf` — HTML to PDF (once HTML exists)
- `node output/_apply_today.mjs --submit` — applies
- `node followup-cadence.mjs` — follow-up reminders
- `node analyze-patterns.mjs` — pattern analysis
- Edit `data/applications.md` — update status when companies reply
- `git push` — sync

**Needs AI (me in chat):**
- Tailor `cv.md` specifically for a job (keyword injection, reordering bullets)
- Generate the CV HTML (`output/[slug]-cv.html`) — the source for PDF
- Write "Why [Company]?" answers
- Full pipeline evaluation with Playwright (JD extraction + scoring + report + PDF in one go)
- Interview prep

**The Qwen/Qubrid model in `.env` handles:**
- `node openai-eval.mjs` — evaluation only (reads JD file, writes report)
- Does NOT do Playwright browser control, CV tailoring, or form filling

---

*Last updated: 2026-07-04*
