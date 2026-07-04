#!/usr/bin/env node
/**
 * generate-cv-batch.mjs — Generate tailored CVs for ALL jobs that need one
 *
 * Reads tracker (data/applications.md) to find jobs that are:
 *   - Status: Evaluated (not Applied, not SKIP)
 *   - Score: >= min-score (default 4.0)
 *   - PDF: ❌ (no CV yet)
 *   - Has a URL in pipeline.md processed section
 *
 * Then calls generate-cv.mjs for each one using your .env model (Qubrid/Qwen).
 * Zero manual steps — one command generates all missing CVs.
 *
 * Usage:
 *   node generate-cv-batch.mjs                  # all Evaluated 4.0+ without PDF
 *   node generate-cv-batch.mjs --min-score 3.5  # lower threshold
 *   node generate-cv-batch.mjs --dry-run        # show what would run, no API calls
 *   node generate-cv-batch.mjs --limit 3        # process max 3 at a time
 */

import { readFileSync, existsSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const ROOT     = dirname(fileURLToPath(import.meta.url));
const TRACKER  = join(ROOT, 'data', 'applications.md');
const PIPELINE = join(ROOT, 'data', 'pipeline.md');
const OUTPUT   = join(ROOT, 'output');

// ── CLI args ──────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const DRY_RUN   = args.includes('--dry-run');
const MIN_SCORE = (() => {
  const i = args.indexOf('--min-score');
  return i !== -1 ? parseFloat(args[i + 1]) : 4.0;
})();
const LIMIT = (() => {
  const i = args.indexOf('--limit');
  return i !== -1 ? parseInt(args[i + 1], 10) : 0;
})();

// ── parse tracker ─────────────────────────────────────────────────
function parseTracker() {
  if (!existsSync(TRACKER)) return [];
  const lines = readFileSync(TRACKER, 'utf-8').split('\n');
  const rows = [];
  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---') || line.includes('# |')) continue;
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length < 8) continue;
    const [num, date, company, role, score, status, pdf] = cols;
    if (num === '#' || !date.match(/\d{4}-\d{2}-\d{2}/)) continue;
    rows.push({
      num,
      company,
      role,
      score: parseFloat(score) || 0,
      status,
      hasPdf: pdf === '✅',
    });
  }
  return rows;
}

// ── parse pipeline processed URLs ────────────────────────────────
// Returns Map<companyRoleKey, url>
function parsePipelineUrls() {
  if (!existsSync(PIPELINE)) return new Map();
  const text  = readFileSync(PIPELINE, 'utf-8');
  const urlMap = new Map();

  for (const line of text.split('\n')) {
    // Match: - [x] https://... | Company | Role | ...
    const m = line.match(/^- \[x\] (https?:\/\/\S+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)/);
    if (!m) continue;
    const url     = m[1].trim();
    const company = m[2].trim().toLowerCase();
    const role    = m[3].trim().toLowerCase();
    // Store by company+role key (first 3 words of role)
    const roleKey = role.split(/\s+/).slice(0, 4).join(' ');
    urlMap.set(`${company}::${roleKey}`, url);
    // Also store by full role
    urlMap.set(`${company}::${role}`, url);
  }
  return urlMap;
}

// ── find URL for a tracker row ────────────────────────────────────
function findUrl(row, urlMap) {
  const company  = row.company.toLowerCase();
  const roleLower = row.role.toLowerCase();

  // Try progressively shorter role keys
  const words = roleLower.split(/\s+/);
  for (let len = words.length; len >= 2; len--) {
    const key = `${company}::${words.slice(0, len).join(' ')}`;
    if (urlMap.has(key)) return urlMap.get(key);
  }

  // Fuzzy: find any entry where company matches and role shares 2+ words
  const roleWords = new Set(words.filter(w => w.length > 3));
  for (const [key, url] of urlMap) {
    if (!key.startsWith(company + '::')) continue;
    const keyRole = key.split('::')[1] || '';
    const keyWords = keyRole.split(/\s+/).filter(w => w.length > 3);
    const shared = keyWords.filter(w => roleWords.has(w));
    if (shared.length >= 2) return url;
  }

  return null;
}

// ── slugify ───────────────────────────────────────────────────────
function slugify(company, role) {
  const c = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const r = role.toLowerCase()
    .replace(/[^a-z0-9\s]+/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join('-');
  return `${c}-${r}`;
}

// ── check if PDF already exists ───────────────────────────────────
import { readdirSync } from 'fs';
function pdfExists(company, role) {
  if (!existsSync(OUTPUT)) return false;
  const files = readdirSync(OUTPUT).filter(f => f.endsWith('.pdf'));
  const c = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  const rWords = role.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 3);
  return files.some(f => {
    const fl = f.toLowerCase();
    const matchC = fl.includes(c) || (c.includes('sarvam') && fl.includes('sarvam')) || (c.includes('lemon') && fl.includes('lemon'));
    const matchR = rWords.some(w => fl.includes(w));
    return matchC && matchR;
  });
}

// ── run generate-cv.mjs ───────────────────────────────────────────
function runGenerateCv(url, slug) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [join(ROOT, 'generate-cv.mjs'), '--url', url, '--slug', slug],
      { cwd: ROOT, stdio: 'inherit' }
    );
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`generate-cv.mjs exited ${code}`));
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

const tracker = parseTracker();
const urlMap  = parsePipelineUrls();

// Find jobs that need a CV
const needCv = tracker.filter(row =>
  row.status === 'Evaluated' &&
  row.score  >= MIN_SCORE    &&
  !row.hasPdf
);

console.log(`\n${'═'.repeat(60)}`);
console.log(`  generate-cv-batch — CV generator`);
console.log(`  Min score: ${MIN_SCORE} | Model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`);
if (DRY_RUN) console.log('  MODE: DRY RUN');
console.log(`${'═'.repeat(60)}\n`);

if (needCv.length === 0) {
  console.log('✅ All evaluated jobs already have CVs. Nothing to generate.');
  console.log('   Run: node daily-status.mjs\n');
  process.exit(0);
}

// Build work list with URLs
const workList = [];
for (const row of needCv) {
  const url  = findUrl(row, urlMap);
  const slug = slugify(row.company, row.role);
  workList.push({ ...row, url, slug });
}

const toProcess = LIMIT > 0 ? workList.slice(0, LIMIT) : workList;

console.log(`Found ${toProcess.length} job(s) needing a CV:\n`);
for (const job of toProcess) {
  const urlStatus = job.url ? `✓  ${job.url}` : '✗  URL not found in pipeline.md';
  console.log(`  [${job.score}/5] ${job.company} — ${job.role}`);
  console.log(`        slug: ${job.slug}`);
  console.log(`        ${urlStatus}`);
  console.log('');
}

if (DRY_RUN) {
  console.log('Dry run — no API calls made.');
  console.log('Run without --dry-run to generate.\n');
  process.exit(0);
}

// Check .env model is configured
if (!process.env.OPENAI_API_KEY && !process.env.OPENAI_BASE_URL) {
  console.error('❌  OPENAI_API_KEY / OPENAI_BASE_URL not set in .env');
  process.exit(1);
}

// Load dotenv
try { const { config } = await import('dotenv'); config(); } catch {}

let success = 0;
let failed  = 0;
const skipped = [];

for (const [i, job] of toProcess.entries()) {
  console.log(`\n[${i + 1}/${toProcess.length}] ${job.company} — ${job.role}  (${job.score}/5)`);

  if (!job.url) {
    console.log(`  ⚠  No URL found — add the job URL to pipeline.md processed section`);
    console.log(`     Or run: node generate-cv.mjs --file jds/file.txt --slug ${job.slug}`);
    skipped.push(job);
    continue;
  }

  console.log(`  URL:  ${job.url}`);
  console.log(`  Slug: ${job.slug}`);

  try {
    await runGenerateCv(job.url, job.slug);
    success++;

    // Update tracker PDF column ✅ for this row
    const trackerText = readFileSync(TRACKER, 'utf-8');
    const updated = trackerText.split('\n').map(line => {
      if (!line.startsWith('|')) return line;
      const cols = line.split('|').map(c => c.trim());
      if (cols.length < 8) return line;
      const rowCompany = cols[3].trim().toLowerCase();
      const rowRole    = cols[4].trim().toLowerCase();
      if (
        rowCompany.includes(job.company.toLowerCase().replace(/[^a-z]/g, '')) &&
        rowRole.includes(job.role.toLowerCase().split(/\s+/)[0])
      ) {
        cols[6] = ' ✅ ';
        return cols.join('|');
      }
      return line;
    }).join('\n');
    const { writeFileSync } = await import('fs');
    writeFileSync(TRACKER, updated, 'utf-8');
    console.log(`  ✅ PDF generated + tracker updated`);

  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
    failed++;
  }

  // Pause between API calls
  if (i < toProcess.length - 1) {
    console.log('  ⏳ Pausing 2s...');
    await new Promise(r => setTimeout(r, 2000));
  }
}

console.log(`\n${'═'.repeat(60)}`);
console.log(`  Done: ${success} generated, ${failed} failed, ${skipped.length} skipped (no URL)`);
if (skipped.length > 0) {
  console.log(`\n  Skipped (no URL found):`);
  for (const j of skipped) console.log(`    - ${j.company} — ${j.role}`);
  console.log(`\n  Fix: add the URL to pipeline.md processed section, then re-run`);
  console.log(`  Or:  node generate-cv.mjs --file jds/file.txt --slug <slug>`);
}
console.log(`\n  Run next: node output/_apply_today.mjs`);
console.log(`${'═'.repeat(60)}\n`);
