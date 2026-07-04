eaaatassdsfstrstok okw

---
name: sync-data
description: Sync personal career-ops data (cv, tracker, reports, portals, profile) to/from the personal branch on GitHub so nothing is lost when switching computers.
arguments: direction
user_invocable: true
user-invocable: true
argument-hint: "[push | pull | status]"
license: MIT
---
# sync-data — Personal Data Sync

Keeps your personal career-ops data (CV, tracker, reports, portals, profile) in sync
across computers via the `personal` branch of your private GitHub repo.

`.env` is NEVER synced — you set that manually on each computer.

---

## Invocation

| You say                                                          | What happens                           |
| ---------------------------------------------------------------- | -------------------------------------- |
| `sync` or `sync push` or "sync my data" or "end of day sync" | Push all personal files to GitHub      |
| `sync pull` or "restore my data" or "I'm on a new computer"    | Pull latest personal files from GitHub |
| `sync status` or "what's changed"                              | Show what has changed since last sync  |

---

## Files that sync (personal branch)

| File                         | Purpose                                 |
| ---------------------------- | --------------------------------------- |
| `cv.md`                    | Your CV — source of truth              |
| `config/profile.yml`       | Your profile, salary targets, location  |
| `modes/_profile.md`        | Your archetypes, negotiation scripts    |
| `modes/_custom.md`         | Your custom mode overrides              |
| `portals.yml`              | Your 91 tracked companies config        |
| `data/applications.md`     | Your full job tracker                   |
| `data/pipeline.md`         | Pending jobs to evaluate                |
| `data/scan-history.tsv`    | Scanner dedup history                   |
| `data/pdf-index.tsv`       | PDF manifest                            |
| `reports/*.md`             | All evaluation reports                  |
| `batch/tracker-additions/` | Tracker merge queue                     |
| `interview-prep/`          | STAR stories + interview notes          |
| `jds/`                     | Saved job descriptions                  |
| `.gitignore`               | Has personal data entries commented out |

**Never synced (always local only):**

- `.env` — your API key, set manually per computer

---

## Mode: push

Run these exact shell commands in order:

```bash
cd /Users/akconsultants/Downloads/career-ops

# Make sure we're on the personal branch
git checkout personal

# Stage all personal data files
git add .gitignore
git add cv.md
git add config/profile.yml
git add modes/_profile.md modes/_custom.md
git add portals.yml
git add data/applications.md data/pipeline.md data/scan-history.tsv data/pdf-index.tsv
git add reports/
git add batch/tracker-additions/
git add interview-prep/
git add jds/

# Commit with today's date
git commit -m "sync $(date +%Y-%m-%d)" --allow-empty

# Push to GitHub
git push origin personal
```

After running, confirm to the user:

> "Synced. Your CV, tracker, reports, and profile are backed up to the `personal` branch on GitHub."

If there's nothing to commit (working tree clean), tell the user:

> "Already up to date — nothing changed since last sync."

---

## Mode: pull

Run on a new/other computer to restore everything:

```bash
cd /Users/akconsultants/Downloads/career-ops

# Switch to personal branch
git checkout personal

# Pull latest from GitHub
git pull origin personal
```

After running, confirm:

> "Restored. Your CV, tracker, reports, profile, and portals are back. One thing to do manually: open .env and add your API key (copy from your other computer or password manager)."

If the user is setting up a brand new computer (repo not cloned yet), give them:

```bash
git clone https://github.com/semil007/CareerOS.git
cd CareerOS
git checkout personal
npm install
cp .env.example .env
# then open .env and add your OPENAI_API_KEY
```

---

## Mode: status

Show what has changed locally since the last sync:

```bash
cd /Users/akconsultants/Downloads/career-ops
git checkout personal
git status --short
git log origin/personal..HEAD --oneline
```

Interpret the output for the user:

- `M filename` = modified since last sync
- `A filename` = new file not yet synced
- `?? filename` = untracked file (new, not staged yet)
- Empty output = everything is synced, nothing to push

---

## Going public later (when repo becomes open source)

The `.gitignore` has all personal file entries **commented out** — not deleted.
To re-enable them before making the repo public:

1. Open `.gitignore`
2. Find the block marked `PERSONAL BRANCH SYNC`
3. Uncomment every line in that block (remove the `#` prefix)
4. Commit to `main`
5. Delete the `personal` branch from GitHub: `git push origin --delete personal`

`main` never had personal data — it's already clean for open source.

---

## Branch structure

| Branch       | Contains                                    | Visibility          |
| ------------ | ------------------------------------------- | ------------------- |
| `main`     | System code only, zero personal data        | Safe to make public |
| `personal` | Your CV, tracker, reports, profile, portals | Private repo only   |

---

## Troubleshooting

**"Not on personal branch"**

```bash
git checkout personal
```

**"Merge conflict"**

```bash
git pull origin personal --rebase
# resolve conflicts, then:
git push origin personal
```

**"Permission denied / auth error"**

```bash
gh auth login
# or re-enter credentials
git remote set-url origin https://github.com/semil007/CareerOS.git
```

**"Nothing is syncing / files still gitignored"**
The `.gitignore` comments may have been reverted. Check:

```bash
grep "^cv.md" .gitignore
```

If it returns a result (not commented), the entry is active and blocking sync.
Open `.gitignore` and comment out the line: `#cv.md`
