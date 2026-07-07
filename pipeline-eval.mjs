#!/usr/bin/env node
/**
 * pipeline-eval.mjs — Batch evaluate all pending pipeline.md URLs
 * using your configured OpenAI-compatible model (Qubrid/Qwen from .env)
 *
 * Usage:
 *   node pipeline-eval.mjs              → evaluate all - [ ] entries
 *   node pipeline-eval.mjs --dry-run    → show what would be evaluated, no API calls
 *   node pipeline-eval.mjs --limit 5    → process only first 5
 *
 * Uses: OPENAI_BASE_URL + OPENAI_MODEL + OPENAI_API_KEY from .env
 * Each job: fetches JD via Playwright → evaluates via openai-eval logic → saves report
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

try { const { config } = await import('dotenv'); config(); } catch {}

const ROOT    = dirname(fileURLToPath(import.meta.url));
const PIPELINE = join(ROOT, 'data', 'pipeline.md');

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT   = (() => {
  const i = process.argv.indexOf('--limit');
  return i !== -1 ? parseInt(process.argv[i + 1], 10) : 0;
})();

// ── read pending URLs from pipeline.md ───────────────────────────
function readPending() {
  if (!existsSync(PIPELINE)) return [];
  const lines = readFileSync(PIPELINE, 'utf-8').split('\n');
  const pending = [];
  for (const line of lines) {
    const m = line.match(/^- \[ \] (https?:\/\/\S+)\s*\|?\s*(.*)/);
    if (!m) continue;
    const url  = m[1].trim();
    const rest = m[2].trim();
    const parts = rest.split('|').map(s => s.trim());
    pending.push({
      url,
      company: parts[0] || 'Unknown',
      title:   parts[1] || 'Unknown',
    });
  }
  return pending;
}

// ── fetch JD text via Playwright ─────────────────────────────────
async function fetchJD(url, company = '') {
  // 1. Try Greenhouse API first to avoid iframes and cookie/bot walls
  const m1 = url.match(/(?:job-boards|boards)\.greenhouse\.io\/([^/]+)\/jobs\/(\d+)/);
  const m2 = url.match(/gh_jid=(\d+)/);
  if (m1 || m2) {
    const jobId = m1 ? m1[2] : m2[1];
    let board = m1 ? m1[1] : null;
    if (!board && company) {
      board = company.toLowerCase().replace(/[^a-z0-9]+/g, '');
    }
    if (board && jobId) {
      try {
        const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${jobId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.content) {
            const decoded = json.content
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&nbsp;/g, ' ');
            const cleanText = decoded.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            return `URL: ${url}\nCompany: ${json.company_name || company}\nTitle: ${json.title}\n\n${cleanText}`;
          }
        }
      } catch (e) {
        // Fall back silently to Playwright
      }
    }
  }

  // 1.5. Try Ashby API next to bypass anti-bot and client-rendering delay
  const mAshby = url.match(/jobs\.ashbyhq\.com\/([^/]+)\/([^/?#]+)/);
  if (mAshby) {
    const board = mAshby[1];
    const jobId = mAshby[2];
    if (board && jobId) {
      try {
        const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${board}?includeCompensation=true`);
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.jobs)) {
            const job = json.jobs.find(j => j.id === jobId || (j.jobUrl && j.jobUrl.includes(jobId)));
            if (job) {
              const description = job.descriptionPlain || job.descriptionHtml || '';
              const cleanText = description
                .replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              return `URL: ${url}\nCompany: ${company || board}\nTitle: ${job.title}\n\n${cleanText}`;
            }
          }
        }
      } catch (e) {
        // Fall back silently to Playwright
      }
    }
  }

  // 2. Playwright fallback with realistic User-Agent
  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch { throw new Error('Playwright not installed — run: npx playwright install chromium'); }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);
    const text = await page.evaluate(() => {
      document.querySelectorAll('script,style,nav,footer,header,[role="banner"]').forEach(e => e.remove());
      return (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
    });
    return `URL: ${url}\n\n${text.slice(0, 15000)}`;
  } finally {
    await browser.close();
  }
}

// ── run openai-eval.mjs on a JD text file ────────────────────────
function runEval(jdFilePath) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [join(ROOT, 'openai-eval.mjs'), '--file', jdFilePath],
      { cwd: ROOT, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    let out = '';
    let err = '';
    child.stdout.on('data', d => { out += d; process.stdout.write(d); });
    child.stderr.on('data', d => { err += d; process.stderr.write(d); });
    child.on('close', code => {
      if (code === 0) resolve(out);
      else reject(new Error(`openai-eval exited ${code}: ${err.slice(0, 200)}`));
    });
  });
}

// ── mark URL as processed in pipeline.md ─────────────────────────
function markDone(url) {
  const text    = readFileSync(PIPELINE, 'utf-8');
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const updated = text.replace(
    new RegExp(`^(- \\[\\s\\] ${escaped}.*)$`, 'm'),
    (line) => line.replace('- [ ]', '- [x]')
  );
  writeFileSync(PIPELINE, updated, 'utf-8');
}

// ── main ─────────────────────────────────────────────────────────
const pending = readPending();

if (pending.length === 0) {
  console.log('✅ No pending jobs in pipeline.md');
  process.exit(0);
}

const toProcess = LIMIT > 0 ? pending.slice(0, LIMIT) : pending;

console.log(`\n${'═'.repeat(60)}`);
console.log(`  pipeline-eval — ${toProcess.length} job(s) to evaluate`);
console.log(`  Model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'} via ${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}`);
if (DRY_RUN) console.log('  MODE: DRY RUN — no API calls');
console.log(`${'═'.repeat(60)}\n`);

for (const [i, job] of toProcess.entries()) {
  console.log(`\n[${i + 1}/${toProcess.length}] ${job.company} — ${job.title}`);
  console.log(`  URL: ${job.url}`);

  if (DRY_RUN) {
    console.log('  → skipped (dry run)');
    continue;
  }

  // Write JD to temp file
  const tmpFile = join(tmpdir(), `career-ops-jd-${randomUUID()}.txt`);

  try {
    // 1. Fetch JD
    process.stdout.write('  [1/3] Fetching JD... ');
    const jdText = await fetchJD(job.url, job.company);
    writeFileSync(tmpFile, jdText, 'utf-8');
    console.log(`done (${Math.round(jdText.length / 1000)}k chars)`);

    // 2. Evaluate
    console.log('  [2/3] Evaluating with', process.env.OPENAI_MODEL || 'gpt-4o-mini', '...');
    await runEval(tmpFile);

    // 3. Mark done in pipeline
    markDone(job.url);
    console.log('  [3/3] ✅ Marked as processed in pipeline.md');

  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    console.error('  → Skipping this job, continuing with next...');
  } finally {
    // Clean up temp file
    try { if (existsSync(tmpFile)) require('fs').unlinkSync(tmpFile); } catch {}
  }

  // Polite delay between requests
  if (i < toProcess.length - 1) {
    console.log('  ⏳ Waiting 3s before next job...');
    await new Promise(r => setTimeout(r, 3000));
  }
}

// Merge tracker additions
console.log('\n📊 Merging tracker additions...');
try {
  const { execSync } = await import('child_process');
  execSync('node merge-tracker.mjs', { cwd: ROOT, stdio: 'inherit' });
} catch (e) {
  console.error('  ⚠ merge-tracker failed:', e.message);
}

console.log('\n' + '═'.repeat(60));
console.log(`  Done. ${toProcess.length} job(s) processed.`);
console.log('  Run: node daily-status.mjs');
console.log('═'.repeat(60) + '\n');
