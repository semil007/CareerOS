# Setup Guide

## Prerequisites

- An AI coding CLI — [Claude Code](https://claude.ai/code), Gemini CLI, Codex, Qwen Code, OpenCode, GitHub Copilot CLI, Antigravity CLI, or Grok Build CLI (see [Supported CLIs](SUPPORTED_CLIS.md))
- [Node.js](https://nodejs.org) 18+ and `git`
- (Optional) Go 1.21+ (for the dashboard TUI)

## Quick Start

### Manual Clone

```bash
git clone https://github.com/YOUR_ORG/YOUR_REPO.git
cd YOUR_REPO
npm install
```

### PDF rendering (one-time)

PDFs are rendered with a headless Chromium. Install it once per machine:

```bash
npx playwright install chromium
```

## Codex Invocation

Codex can run the interactive session:

```bash
cd career-ops
codex
```

Slash commands are not guaranteed in Codex. If `/career-ops` is not registered, invoke the modes in plain language:
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

## Available Commands

| Action | How |
|--------|-----|
| Evaluate an offer | Paste a URL or JD text |
| Search for offers | `/career-ops scan` or ask the agent to run `scan` |
| Process pending URLs | `/career-ops pipeline` or ask the agent to run `pipeline` |
| Generate a PDF | `/career-ops pdf` or ask the agent to run `pdf` |
| Batch evaluate | `/career-ops batch` or use a CLI prompt |
| Check tracker status | `/career-ops tracker` or ask the agent to run `tracker` |
| Fill application form | `/career-ops apply` or ask the agent to run `apply` |

## Verify Setup

```bash
node cv-sync-check.mjs      # Check configuration
node verify-pipeline.mjs     # Check pipeline integrity
```

## Build Dashboard (Optional)

```bash
npm run serve:dashboard     # Opens TUI pipeline viewer
npm run build:dashboard     # Optional: build the standalone binary
```
