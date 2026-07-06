#!/usr/bin/env node
/**
 * generate-cv-batch.mjs — Generate tailored CVs for ALL jobs that need one
 *
 * Reads tracker (data/applications.md) to find jobs that are:
 *   - Status: Evaluated
 *   - Score: >= min-score (default 4.0)
 *   - PDF: ❌ (no CV yet)
 *   - Has a URL in pipeline.md processed section
 *
 * Then runs generate-cv.mjs for each one using your .env model (Qubrid/Qwen).
 * One command — generates all missing CVs automatically.
 *
 * Usage:
 *   node generate-cv-batch.mjs                  # all Evaluated 4.0+ without PDF
 *   node generate-cv-batch.mjs --min-score 3.5  # lower threshold
 *   node generate-cv-batch.mjs --dry-run        # show what would run, no API calls
 *   node generate-cv-batch.mjs --limit 3        # process max 3 at a time
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

try { const { config } = await import('dotenv'); config(); } catch {}

const ROOT     = dirname(fileURLToPath(import.meta.url));
const TRACKER  = join(ROOT, 'data', 'applications.md');
const PIPELINE = join(ROOT, 'data', 'pipeline.md');
const OUTPUT   = join(ROOT, 'output');

// ── CLI args ──────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const DRY_RUN   = args.includes('--dry-run');
const MIN_SCORE = (() => { const i = args.indexOf('--min-score'); return i !== -1 ? parseFloat(args[i+1]) : 4.0; })();
const LIMIT     = (() => { const i = args.indexOf('--limit');     return i !== -1 ? parseInt(args[i+1], 10) : 0; })();

if (args.includes('--help')) {
  console.log(`
generate-cv-batch.mjs — batch CV generator

USAGE
  node generate-cv-batch.mjs                  all Evaluated 4.0+ without PDF
  node generate-cv-batch.mjs --min-score 3.5  lower score threshold
  node generate-cv-batch.mjs --dry-run        preview only, no API calls
  node generate-cv-batch.mjs --limit 3        max 3 jobs per run
`);
  process.exit(0);
}

// ── parse tracker ─────────────────────────────────────────────────
function parseTracker() {
  if (!existsSync(TRACKER)) return [];
  const rows = [];
  for (const line of readFileSync(TRACKER, 'utf-8').split('\n')) {
    if (!line.startsWith('|') || line.includes('---')) continue;
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length < 7) continue;
    const [num, date, company, role, score, status, pdf] = cols;
    if (num === '#' || !date?.match(/\d{4}-\d{2}-\d{2}/)) continue;
    rows.push({ num, company, role, score: parseFloat(score) || 0, status, hasPdf: pdf === '✅' });
  }
  return rows;
}

// ── parse pipeline.md processed section for URLs ─────────────────
function parsePipelineUrls() {
  if (!existsSync(PIPELINE)) return new Map();
  const urlMap = new Map();
  for (const line of readFileSync(PIPELINE, 'utf-8').split('\n')) {
    const m = line.match(/^- \[x\] (https?:\/\/\S+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)/);
    if (!m) continue;
    const url     = m[1].trim();
    const company = m[2].trim().toLowerCase();
    const role    = m[3].trim().toLowerCase();
    // Index by company::roleWord combinations for fuzzy matching
    const words = role.split(/\s+/);
    for (let len = words.length; len >= 2; len--) {
      urlMap.set(`${company}::${words.slice(0, len).join(' ')}`, url);
    }
  }
  return urlMap;
}

// ── find best URL match for a tracker row ────────────────────────
function findUrl(row, urlMap) {
  const company   = row.company.toLowerCase();
  const roleWords = row.role.toLowerCase().split(/\s+/);

  // Try progressively shorter role key matches
  for (let len = roleWords.length; len >= 2; len--) {
    const key = `${company}::${roleWords.slice(0, len).join(' ')}`;
    if (urlMap.has(key)) return urlMap.get(key);
  }

  // Fuzzy: company match + at least 2 shared meaningful words
  const roleSet = new Set(roleWords.filter(w => w.length > 3));
  for (const [key, url] of urlMap) {
    if (!key.startsWith(company + '::')) continue;
    const keyWords = key.split('::')[1].split(/\s+/).filter(w => w.length > 3);
    if (keyWords.filter(w => roleSet.has(w)).length >= 2) return url;
  }

  return null;
}

// ── slugify company + role ────────────────────────────────────────
function slugify(company, role) {
  const c = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const r = role.toLowerCase().replace(/[^a-z0-9\s]+/g, '').trim().split(/\s+/).slice(0, 4).join('-');
  return `${c}-${r}`;
}

// ── update tracker PDF column to ✅ ──────────────────────────────
function markPdfDone(company, role) {
  if (!existsSync(TRACKER)) return;
  const cLower = company.toLowerCase().replace(/[^a-z]/g, '');
  const rFirst = role.toLowerCase().split(/\s+/)[0];
  const lines  = readFileSync(TRACKER, 'utf-8').split('\n');
  const updated = lines.map(line => {
    if (!line.startsWith('|')) return line;
    const cols = line.split('|');
    if (cols.length < 8) return line;
    const rc = cols[3].trim().toLowerCase().replace(/[^a-z]/g, '');
    const rr = cols[4].trim().toLowerCase();
    if (rc.includes(cLower) && rr.startsWith(rFirst)) {
      cols[6] = ' ✅ ';
      return cols.join('|');
    }
    return line;
  });
  writeFileSync(TRACKER, updated.join('\n'), 'utf-8');
}

// ── run generate-cv.mjs as child process ─────────────────────────
function runGenerateCv(url, slug) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [join(ROOT, 'generate-cv.mjs'), '--url', url, '--slug', slug],
      { cwd: ROOT, stdio: 'inherit' }
    );
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`exited ${code}`)));
  });
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

const tracker = parseTracker();
const urlMap  = parsePipelineUrls();

// Jobs needing a CV: Evaluated + score >= min + no PDF
const needCv = tracker.filter(r =>
  r.status === 'Evaluated' && r.score >= MIN_SCORE && !r.hasPdf
);

console.log(`\n${'═'.repeat(60)}`);
console.log(`  generate-cv-batch`);
console.log(`  Min score: ${MIN_SCORE} | Model: ${process.env.OPENAI_MODEL || '(from .env)'}`);
if (DRY_RUN) console.log('  MODE: DRY RUN — no API calls');
console.log(`${'═'.repeat(60)}\n`);

if (needCv.length === 0) {
  console.log('✅ All evaluated jobs already have CVs.');
  console.log('   Next: node output/_apply_today.mjs\n');
  process.exit(0);
}

// Attach URLs and slugs
const workList  = needCv.map(r => ({ ...r, url: findUrl(r, urlMap), slug: slugify(r.company, r.role) }));
const toProcess = LIMIT > 0 ? workList.slice(0, LIMIT) : workList;

console.log(`Found ${toProcess.length} job(s) needing a CV:\n`);
for (const job of toProcess) {
  console.log(`  [${job.score}/5] ${job.company} — ${job.role}`);
  console.log(`         slug: ${job.slug}`);
  console.log(`         url:  ${job.url || '✗ not found in pipeline.md'}`);
}

if (DRY_RUN) {
  console.log('\nDry run done. Run without --dry-run to generate.\n');
  process.exit(0);
}

// Process
let success = 0, failed = 0;
const skipped = [];

for (const [i, job] of toProcess.entries()) {
  console.log(`\n[${i+1}/${toProcess.length}] ${job.company} — ${job.role}  (${job.score}/5)`);

  if (!job.url) {
    console.log(`  ⚠  No URL — skipping`);
    console.log(`     Add URL to pipeline.md or run: node generate-cv.mjs --file jds/x.txt --slug ${job.slug}`);
    skipped.push(job);
    continue;
  }

  try {
    await runGenerateCv(job.url, job.slug);
    markPdfDone(job.company, job.role);
    success++;
  } catch (err) {
    console.error(`  ❌ ${err.message}`);
    failed++;
  }

  if (i < toProcess.length - 1) await new Promise(r => setTimeout(r, 2000));
}

// Summary
console.log(`\n${'═'.repeat(60)}`);
console.log(`  ✅ Generated: ${success}  ❌ Failed: ${failed}  ⚠ Skipped: ${skipped.length}`);
if (skipped.length > 0) {
  console.log('\n  Skipped (no URL in pipeline.md):');
  skipped.forEach(j => console.log(`    - ${j.company} — ${j.role}`));
}
console.log('\n  Next steps:');
console.log('    node output/_apply_today.mjs       (dry run)');
console.log('    node output/_apply_today.mjs --submit  (submit)');
console.log(`${'═'.repeat(60)}\n`);
