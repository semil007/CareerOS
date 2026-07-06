# Daily Job Search Guide — Semil Periyasamy

Everything you need to run your job search daily.
All steps use your Qubrid/Qwen model from `.env` — zero AI chat credits.

---

## FULL PIPELINE — ONE LINE

```
SCAN → EVALUATE → GENERATE CVs → APPLY → TRACK → FOLLOW UP
```

| Step | Command | What it does |
|------|---------|-------------|
| Scan | `node scan.mjs` | Hits 91 companies, finds new India ML jobs |
| Evaluate ALL | `node pipeline-eval.mjs` | Scores every pending job with Qwen, writes reports |
| Generate ALL CVs | `node generate-cv-batch.mjs` | Makes tailored PDF for every 4.0+ job |
| Dry run | `node output/_apply_today.mjs` | Fills forms, screenshots — no submit |
| Submit | `node output/_apply_today.mjs --submit` | Submits + auto-updates tracker |
| Follow up | `node followup-cadence.mjs` | Shows who to follow up with |
| Status | `node daily-status.mjs` | Dashboard — run every morning |

---

## COMPLETE DAILY WORKFLOW

```bash
cd /Users/akconsultants/Downloads/career-ops

# ── MORNING — always start here ───────────────────────────────
node daily-status.mjs
# Shows: applied count, ready-to-apply, needs-CV, pipeline inbox

# ── EVERY 2-3 DAYS — find new jobs ────────────────────────────
node scan.mjs
# Scans 91 companies, India only (Bangalore/Chennai/Hyderabad/Mumbai)
# New jobs land in data/pipeline.md as - [ ] entries

# ── AFTER SCAN — evaluate everything ──────────────────────────
node pipeline-eval.mjs
# Uses Qwen3-Plus from .env — no chat needed
# Fetches each JD via Playwright → scores → saves report → marks [x]

# ── AFTER EVALUATE — generate all missing CVs ─────────────────
node generate-cv-batch.mjs
# Finds all Evaluated rows with score 4.0+ and no PDF
# Calls Qwen to tailor each CV → generates HTML + PDF automatically
# To preview without API calls: node generate-cv-batch.mjs --dry-run

# ── APPLY — dry run first, always ─────────────────────────────
node output/_apply_today.mjs
# Opens browser, fills every form with human-like typing
# Takes screenshots → output/[job]-filled.png
# Does NOT submit — check screenshots before proceeding

open output/  # verify filled screenshots look correct

node output/_apply_today.mjs --submit
# Submits all forms + auto-updates tracker to Applied

# ── VERIFY ────────────────────────────────────────────────────
node daily-status.mjs
# Applied count should go up

# ── FOLLOW-UP ─────────────────────────────────────────────────
node followup-cadence.mjs
# Shows any Applied jobs silent for 7+ days

# ── END OF DAY — sync everything ──────────────────────────────
git add cv.md config/profile.yml modes/_profile.md portals.yml \
        data/ reports/ output/ interview-prep/ jds/ batch/tracker-additions/
git commit -m "sync $(date +%Y-%m-%d)"
git push
```

---

## COMMANDS REFERENCE

### Daily

| Command | When | What |
|---------|------|------|
| `node daily-status.mjs` | Every morning | Dashboard — applied, ready, needs CV, pipeline |
| `node scan.mjs` | Every 2-3 days | Find new jobs from 91 companies |
| `node pipeline-eval.mjs` | After scan | Evaluate all pending with Qwen |
| `node generate-cv-batch.mjs` | After evaluate | Generate all missing CVs with Qwen |
| `node output/_apply_today.mjs` | Before submit | Dry run — fill forms + screenshot |
| `node output/_apply_today.mjs --submit` | After dry run check | Submit all + update tracker |
| `node followup-cadence.mjs` | Every 2-3 days | Follow-up reminders |

### Weekly

| Command | What |
|---------|------|
| `node analyze-patterns.mjs` | Which companies/roles score best for you |
| `node detect-reposts.mjs --summary` | Flag ghost listings reposted 2+ times |
| `node verify-pipeline.mjs` | Health check — statuses, links, dupes |
| `node normalize-statuses.mjs` | Fix typos in Status column |
| `node dedup-tracker.mjs` | Remove duplicate tracker rows |

### Single job CV (when you find a job outside scan)

```bash
# From URL — fetches JD + tailors + PDF in one go:
node generate-cv.mjs --url https://jobs.ashbyhq.com/company/job-id

# From saved JD file:
node generate-cv.mjs --file jds/role.txt --slug company-role
```

### Scan options

```bash
node scan.mjs                          # standard scan
node scan.mjs --verify --throttle      # also checks if jobs are still live (~10 min)
node scan.mjs --company "Sarvam AI"    # single company only
```

### Pipeline eval options

```bash
node pipeline-eval.mjs                 # evaluate all pending
node pipeline-eval.mjs --dry-run       # preview only, no API calls
node pipeline-eval.mjs --limit 5       # process first 5 only
```

### Batch CV options

```bash
node generate-cv-batch.mjs             # all Evaluated 4.0+ without PDF
node generate-cv-batch.mjs --dry-run   # preview only
node generate-cv-batch.mjs --min-score 3.5   # lower threshold
node generate-cv-batch.mjs --limit 3   # max 3 at a time
```

---

## HOW TO UPDATE STATUS MANUALLY

When a company emails you — open `data/applications.md`, find their row, change Status:

```
Evaluated → Applied → Responded → Interview → Offer
                                           → Rejected
```

| Status | When |
|--------|------|
| `Evaluated` | Report done, not yet applied |
| `Applied` | Form submitted |
| `Responded` | Company replied |
| `Interview` | Interview scheduled |
| `Offer` | Got an offer |
| `Rejected` | Rejected |
| `Discarded` | You withdrew / job closed |
| `SKIP` | Not a fit, never applying |

Then run `node daily-status.mjs` to see it reflected.

---

## MANUAL APPLY — NON-ASHBY PLATFORMS

`_apply_today.mjs` handles Ashby forms only. These need manual browser apply:

| Company | Platform | CV to attach |
|---------|----------|-------------|
| Lemon.io | RemoteOK | `output/lemon-io-ai-architect-cv.pdf` |
| Nvidia India | Workday | `output/nvidia-sa-genai-cv.pdf` |

Run `node output/_apply_today.mjs` — it prints the URLs and CVs for these at the end.

---

## SARVAM 60-DAY COOLDOWN

Sarvam limits to one application per 60 days. The apply script checks automatically:
- If any Sarvam row is `Applied` within 60 days → all Sarvam jobs are skipped
- Shows: `🕐 SKIPPED — applied X days ago. Cooldown: Y days remaining`

Non-Sarvam jobs in the same run are unaffected.

---

## KEY FILES

| File | What it is |
|------|-----------|
| `data/applications.md` | Master tracker — every job |
| `data/pipeline.md` | Inbox — pending URLs to evaluate |
| `data/scan-history.tsv` | Dedup log — prevents re-scanning same jobs |
| `output/[job]-cv.pdf` | Tailored CVs |
| `output/[job]-filled.png` | Dry-run screenshots |
| `output/[job]-submitted.png` | Post-submit confirmation screenshots |
| `reports/[num]-[company]-[date].md` | Evaluation reports |
| `cv.md` | Master CV — source of truth |
| `config/profile.yml` | Profile, targets, salary range |
| `modes/_profile.md` | Scoring preferences |
| `portals.yml` | 91 companies the scanner watches |

---

## WHAT NEEDS AI CHAT vs WHAT RUNS LOCALLY

**Fully local — zero chat credits:**
- `node scan.mjs` — zero tokens, direct API calls
- `node pipeline-eval.mjs` — Qwen via Qubrid
- `node generate-cv-batch.mjs` — Qwen via Qubrid
- `node generate-cv.mjs` — Qwen via Qubrid
- `node output/_apply_today.mjs --submit` — Playwright only
- All tracking, follow-up, analysis commands

**Still needs AI chat (Kiro):**
- Unusual form fields on a new platform
- "Why [Company]?" answers for non-Sarvam companies
- Interview prep
- Debugging a broken script

---

*Last updated: 2026-07-04*
