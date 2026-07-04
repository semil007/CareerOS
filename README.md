# CareerOS

An AI-powered, CLI-agnostic job search automation system: pipeline tracking, offer evaluation, CV generation, portal scanning, and batch processing. Runs on any AI coding CLI that follows the open agent skill standard (Claude Code, Codex, OpenCode, Qwen, Antigravity CLI, Grok Build CLI).

> Inspired by [career-ops](https://github.com/santifer/career-ops.git) — loved the core idea, built my own direction on top of it.

---

## Features

| Feature | Description |
| ---- | ---- |
| **Auto-Pipeline** | Paste a URL, get a full evaluation + PDF + tracker entry |
| **6-Block Evaluation** | Role summary, CV match, level strategy, comp research, personalization, interview prep (STAR+R) — plus a Block G posting-legitimacy check that flags scams and ghost jobs |
| **Interview Story Bank** | Accumulates STAR+Reflection stories across evaluations |
| **Negotiation Scripts** | Salary negotiation frameworks, geographic discount pushback, competing offer leverage |
| **ATS PDF Generation** | Keyword-injected CVs |
| **Cover Letter Generator** | Research-backed cover letters with keyword mirroring and A4 PDF output |
| **Portal Scanner** | 45+ companies pre-configured + custom queries across Ashby, Greenhouse, Lever, Wellfound |
| **Batch Processing** | Parallel evaluation with headless CLI workers |
| **Dashboard TUI** | Terminal UI to browse, filter, and sort your pipeline |
| **Human-in-the-Loop** | AI evaluates and recommends, you decide and act. The system never submits an application — you always have the final call |
| **Pipeline Integrity** | Automated merge, dedup, status normalization, health checks |

## Quick Start

```bash
git clone https://github.com/semil007/CareerOS.git
cd CareerOS && npm install
npx playwright install chromium   # only needed for PDF generation

# Check setup
npm run doctor

# Configure
cp config/profile.example.yml config/profile.yml  # Edit with your details
cp templates/portals.example.yml portals.yml       # Customize companies

# Add your CV
# Create cv.md in the project root with your CV in markdown

# Open your AI CLI in this directory
claude   # or gemini / codex / qwen / opencode / agy / grok
```

On first launch, the system walks you through setup — your CV, profile and target roles — just by chatting. Nothing to edit by hand.

See [docs/SETUP.md](docs/SETUP.md) for the full setup guide, [docs/RUNNING_ON_A_BUDGET.md](docs/RUNNING_ON_A_BUDGET.md) for running on cheaper or local models, and [docs/FAQ.md](docs/FAQ.md) for common setup questions.

## Codex Integration (CODEX.md)

This system supports Codex through the same shared router, but the invocation model is different from CLIs that auto-register slash commands. For the full guide, see [docs/CODEX.md](docs/CODEX.md).

### Interactive Codex

```bash
cd CareerOS
codex
```

Slash commands are not guaranteed in Codex. If `/career-ops` is unavailable, ask Codex to run the mode directly in plain language:

```text
Evaluate this JD with career-ops auto-pipeline: https://company.com/jobs/123
Run the career-ops scan mode and summarize new matches.
Run the career-ops pipeline mode for data/pipeline.md.
Run the career-ops pdf mode for the latest evaluated role.
Run the career-ops tracker mode and summarize the current statuses.
```

For one-shot execution or headless mode, use `codex exec` followed by the prompt:
```bash
codex exec "Evaluate this JD with career-ops auto-pipeline: https://company.com/jobs/123"
```

## Usage

```
/career-ops                → Show all available commands
/career-ops {paste a JD}   → Full auto-pipeline (evaluate + PDF + tracker)
/career-ops scan           → Scan portals for new offers
/career-ops pdf            → Generate ATS-optimized CV
/career-ops cover          → Cover letter generator
/career-ops batch          → Batch evaluate multiple offers
/career-ops tracker        → View application status
/career-ops apply          → Fill application forms with AI
/career-ops pipeline       → Process pending URLs
/career-ops contacto       → LinkedIn outreach message
/career-ops deep           → Deep company research
/career-ops training       → Evaluate a course/cert
/career-ops project        → Evaluate a portfolio project
```

Or just paste a job URL or description directly — the system auto-detects it and runs the full pipeline.

## Project Structure

```
.
├── AGENTS.md                    # Canonical agent instructions (all CLIs)
├── CLAUDE.md                    # Claude Code wrapper
├── CODEX.md                     # Codex wrapper
├── OPENCODE.md                  # OpenCode wrapper
├── GEMINI.md                    # Legacy no-op guard
├── cv.md                        # Your CV (create this)
├── article-digest.md            # Your proof points (optional)
├── config/
│   └── profile.example.yml      # Template for your profile
├── modes/                       # Skill modes
│   ├── _shared.md               # Shared context
│   ├── oferta.md                # Single evaluation
│   ├── pdf.md                   # PDF generation
│   ├── cover.md                 # Cover letter generation
│   ├── scan.md                  # Portal scanner
│   └── batch.md                 # Batch processing
├── templates/
│   ├── cv-template.html         # ATS-optimized CV template
│   └── portals.example.yml      # Scanner config template
├── batch/                       # Batch processing scripts
├── dashboard/                   # Go TUI pipeline viewer
├── data/                        # Your tracking data (gitignored)
├── reports/                     # Evaluation reports (gitignored)
├── output/                      # Generated PDFs (gitignored)
├── fonts/                       # Fonts for PDF generation
├── docs/                        # Setup, customization, budget guide
└── examples/                    # Sample CV, report, proof points
```

## Tech Stack

- **Agent**: AI coding CLI with shared skills and modes (`AGENTS.md` + CLI wrapper)
- **PDF**: Playwright/Puppeteer + HTML template
- **Cover letters**: HTML template + Playwright (A4 PDF)
- **Scanner**: Playwright + Greenhouse API + WebSearch
- **Dashboard**: Go + Bubble Tea + Lipgloss
- **Data**: Markdown tables + YAML config + TSV batch files

## Disclaimer

**This is a local, open-source tool, NOT a hosted service.** By using this software, you acknowledge:

1. **You control your data.** Your CV, contact info, and personal data stay on your machine and are sent directly to the AI provider you choose. We do not collect, store, or have access to any of your data.
2. **You control the AI.** The default prompts instruct the AI not to auto-submit applications, but AI models can behave unpredictably. Always review AI-generated content for accuracy before submitting.
3. **You comply with third-party ToS.** You must use this tool in accordance with the Terms of Service of the career portals you interact with. Do not use this tool to spam employers.
4. **No guarantees.** Evaluations are recommendations, not truth. AI models may hallucinate. The authors are not liable for any consequences.

See [LEGAL_DISCLAIMER.md](LEGAL_DISCLAIMER.md) for full details. This software is provided under the [MIT License](LICENSE) "as is", without warranty of any kind.

## License

The code is licensed under [MIT](LICENSE).

## Inspiration

This project was inspired by [career-ops](https://github.com/santifer/career-ops.git) — I discovered it, loved the core idea, and used it as a foundation to build **CareerOS** with my own features and direction.
