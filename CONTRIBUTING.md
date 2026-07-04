# Contributing

Thanks for your interest in contributing!

## Before Submitting a PR

**For a new feature, new mode or command, or architecture change, please open an issue first.** It saves you from investing time in something we'd have to redirect.

**Going straight to a PR is welcome — no issue needed — for:** bug fixes, new zero-auth scanner providers, docs, and translations.

### What makes a good PR
- Fixes a bug listed in Issues
- Addresses a feature request that was discussed and approved
- Includes a clear description of what changed and why
- Follows the existing code style and project philosophy (simple, minimal, quality over quantity)

## Quick Start

1. Open an issue to discuss your idea
2. Fork the repo
3. Create a branch (`git checkout -b feature/my-feature`)
4. Make your changes
5. Test with a fresh clone (see [docs/SETUP.md](docs/SETUP.md))
6. Commit and push
7. Open a Pull Request referencing the issue

## What to Contribute

**Good first contributions:**
- Add companies to `templates/portals.example.yml`
- Translate modes to other languages
- Improve documentation
- Add example CVs for different roles (in `examples/`)
- Report bugs via Issues

**Bigger contributions:**
- New evaluation dimensions or scoring logic
- Dashboard TUI features (in `dashboard/`)
- New skill modes (in `modes/`)
- Script improvements (`.mjs` utilities)

## Scope: the core vs. the shared layer

This system is **local-first and human-in-the-loop** by design. Centralized infrastructure — hosted job aggregation, a shared matching service — is **not part of the core**.

Rule of thumb: **provider modules, languages, CLI support, modes, dashboard, docs and fixes → the core.** Bigger centralized ideas → **open a discussion first**.

## Guidelines

- Keep modes language-agnostic when possible
- Scripts should handle missing files gracefully (check `existsSync` before `readFileSync`)
- Dashboard changes require a build (`npm run build:dashboard`) — test with real data before submitting
- Don't commit personal data (cv.md, profile.yml, applications.md, reports/)

## What we do NOT accept

- **PRs that scrape platforms prohibiting automated access** (LinkedIn, etc.)
- **PRs that enable auto-submitting applications** without human review
- **PRs that add external API dependencies** without prior discussion
- **PRs containing personal data** (real CVs, emails, real names, scan results)

## Development

```bash
# Scripts
npm run doctor                # Setup validation
node verify-pipeline.mjs     # Health check
node cv-sync-check.mjs        # Config check

# Dashboard
npm run build:dashboard       # go build
npm run serve:dashboard       # launch TUI against the repo root
```

## Need Help?

- Open a [GitHub Discussion](../../discussions)
- Open an [issue](../../issues)
- Read the [architecture docs](docs/ARCHITECTURE.md)
