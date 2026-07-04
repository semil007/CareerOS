#!/usr/bin/env node
/**
 * daily-status.mjs — Your daily job search dashboard
 *
 * Shows:
 *   1. What you've already applied to
 *   2. What's ready to apply RIGHT NOW (CV done, just needs submit)
 *   3. What still needs a CV generated
 *   4. What's pending evaluation in pipeline
 *   5. What to do today
 *
 * Usage:
 *   node daily-status.mjs
 */

import { readFileSync, existsSync, readdirSync } from 'fs';

const TRACKER   = 'data/applications.md';
const PIPELINE  = 'data/pipeline.md';
const OUTPUT    = 'output/';

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
    rows.push({ num, date, company, role, score, status, hasPdf: pdf === '✅' });
  }
  return rows;
}

// ── parse pipeline pending ────────────────────────────────────────
function parsePipeline() {
  if (!existsSync(PIPELINE)) return { pending: [], processed: [] };
  const text = readFileSync(PIPELINE, 'utf-8');
  const pending = [];
  const processed = [];
  for (const line of text.split('\n')) {
    const pendingMatch = line.match(/^- \[ \] (https?:\/\/\S+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)/);
    if (pendingMatch) {
      pending.push({
        url: pendingMatch[1].trim(),
        company: pendingMatch[2].trim(),
        title: pendingMatch[3].trim(),
      });
    }
    const doneMatch = line.match(/^- \[x\] (https?:\/\/\S+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)/);
    if (doneMatch) {
      processed.push({
        url: doneMatch[1].trim(),
        company: doneMatch[2].trim(),
        title: doneMatch[3].trim(),
      });
    }
  }
  return { pending, processed };
}


// ── colours (works in macOS Terminal) ────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  grey:   '\x1b[90m',
  white:  '\x1b[97m',
};

function h(text)    { return C.bold + C.white + text + C.reset; }
function ok(text)   { return C.green + text + C.reset; }
function warn(text) { return C.yellow + text + C.reset; }
function bad(text)  { return C.red + text + C.reset; }
function dim(text)  { return C.grey + text + C.reset; }
function hi(text)   { return C.cyan + text + C.reset; }

// ── read output PDF list ──────────────────────────────────────────
const outputPdfs = existsSync(OUTPUT)
  ? readdirSync(OUTPUT).filter(f => f.endsWith('.pdf')).map(f => f.toLowerCase())
  : [];


function hasPdfFor(company, role) {
  const c = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  const rWords = role.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3).slice(0, 3);
  return outputPdfs.find(f => {
    // must match company name somewhere in filename
    const matchesCompany = f.includes(c) || (c.includes('sarvam') && f.includes('sarvam'));
    // must match at least one meaningful role word
    const matchesRole = rWords.some(w => f.includes(w));
    return matchesCompany && matchesRole;
  }) || null;
}

// ── main ─────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const jobs  = parseTracker();
const { pending: pipelinePending } = parsePipeline();

// Bucket tracker rows
const applied     = jobs.filter(j => j.status === 'Applied');
const responded   = jobs.filter(j => j.status === 'Responded');
const interview   = jobs.filter(j => j.status === 'Interview');
const offer       = jobs.filter(j => j.status === 'Offer');
const evaluated   = jobs.filter(j => j.status === 'Evaluated');
const rejected    = jobs.filter(j => j.status === 'Rejected');
const skipped     = jobs.filter(j => ['SKIP', 'Discarded'].includes(j.status));

// Split evaluated into: ready-to-apply (has PDF) vs needs-CV
const readyToApply = evaluated.filter(j => j.hasPdf);
const needsCv      = evaluated.filter(j => !j.hasPdf && parseFloat(j.score) >= 4.0);
const lowScore     = evaluated.filter(j => !j.hasPdf && parseFloat(j.score) < 4.0);

// ─────────────────────────────────────────────────────────────────
console.log('\n' + h('══════════════════════════════════════════════'));
console.log(h('  DAILY JOB SEARCH STATUS — ' + today));
console.log(h('══════════════════════════════════════════════'));

// ── SCOREBOARD ────────────────────────────────────────────────────
console.log('\n' + h('📊 SCOREBOARD'));
console.log(`  ${ok('✅ Applied')}        ${applied.length}`);
console.log(`  ${hi('📞 Responded')}      ${responded.length}`);
console.log(`  ${hi('🎙  Interview')}      ${interview.length}`);
console.log(`  ${ok('🏆 Offer')}          ${offer.length}`);
console.log(`  ${warn('⏳ Evaluated')}      ${evaluated.length}  (${readyToApply.length} ready-to-apply, ${needsCv.length} need CV)`);
console.log(`  ${bad('❌ Rejected')}       ${rejected.length}`);
console.log(`  ${dim('⏭  Skipped')}        ${skipped.length}`);
console.log(`  ${dim('📥 In pipeline')}    ${pipelinePending.length}  (not yet evaluated)`);

// ── ACTIVE — needs your attention ─────────────────────────────────
if (responded.length > 0 || interview.length > 0 || offer.length > 0) {
  console.log('\n' + h('🔥 ACTION NEEDED — Companies that responded'));
  for (const j of [...offer, ...interview, ...responded]) {
    const icon = j.status === 'Offer' ? '🏆' : j.status === 'Interview' ? '🎙 ' : '📞';
    console.log(`  ${icon}  [${j.status}]  ${hi(j.company)} — ${j.role}  ${dim('(' + j.date + ')')}`);
  }
}

// ── READY TO APPLY ────────────────────────────────────────────────
if (readyToApply.length > 0) {
  console.log('\n' + h('🚀 READY TO APPLY — CV done, just submit'));
  for (const j of readyToApply.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))) {
    const pdfFile = hasPdfFor(j.company, j.role);
    console.log(`  ${ok('▶')}  ${warn(j.score)}  ${hi(j.company)} — ${j.role}`);
    if (pdfFile) console.log(`       CV: output/${pdfFile}`);
  }
  console.log(`\n  Run: ${ok('node output/_apply_today.mjs')}           (dry run — check form)`);
  console.log(`  Run: ${ok('node output/_apply_today.mjs --submit')}   (actually submit)`);
}

// ── NEEDS CV ──────────────────────────────────────────────────────
if (needsCv.length > 0) {
  console.log('\n' + h('📄 NEEDS CV — Evaluated 4.0+ but no PDF yet'));
  for (const j of needsCv.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))) {
    console.log(`  ${warn('◉')}  ${warn(j.score)}  ${hi(j.company)} — ${j.role}`);
  }
  console.log(`\n  Ask me in chat: "generate CV for [company] [role]" and I'll make the PDF.`);
}

// ── ALREADY APPLIED ───────────────────────────────────────────────
if (applied.length > 0) {
  console.log('\n' + h('✅ ALREADY APPLIED — Waiting for response'));
  for (const j of applied.sort((a, b) => b.date.localeCompare(a.date))) {
    const daysAgo = Math.floor((new Date(today) - new Date(j.date)) / 86400000);
    const age = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : daysAgo + ' days ago';
    const followUp = daysAgo >= 7 ? warn('  ← follow up?') : '';
    console.log(`  ✓  ${hi(j.company)} — ${j.role}  ${dim('(' + age + ')')}${followUp}`);
  }
}

// ── PIPELINE INBOX ────────────────────────────────────────────────
if (pipelinePending.length > 0) {
  console.log('\n' + h('📥 PIPELINE INBOX — Not yet evaluated'));
  for (const j of pipelinePending.slice(0, 8)) {
    console.log(`  ${dim('○')}  ${j.company} — ${j.title}`);
  }
  if (pipelinePending.length > 8) {
    console.log(`  ${dim('... and ' + (pipelinePending.length - 8) + ' more')}`);
  }
  console.log(`\n  Run: ${ok('node pipeline-eval.mjs')}   to evaluate all of these with your Qwen model`);
}

// ── TODAY'S PRIORITY ──────────────────────────────────────────────
console.log('\n' + h('📋 TODAY\'S PRIORITY'));

const priorities = [];

if (offer.length > 0)        priorities.push(`${ok('1.')} You have an OFFER from ${offer[0].company} — respond!`);
if (interview.length > 0)    priorities.push(`${ok('2.')} Prep for interview at ${interview.map(j => j.company).join(', ')}`);
if (responded.length > 0)    priorities.push(`${hi('3.')} Reply to ${responded.map(j => j.company).join(', ')}`);
if (readyToApply.length > 0) priorities.push(`${warn('4.')} Submit ${readyToApply.length} ready applications: node output/_apply_today.mjs --submit`);
if (needsCv.length > 0)      priorities.push(`${warn('5.')} Generate CVs for ${needsCv.length} jobs (ask me)`);
if (pipelinePending.length > 0) priorities.push(`${dim('6.')} Evaluate ${pipelinePending.length} pending jobs: node pipeline-eval.mjs`);
if (priorities.length === 0) priorities.push(`${dim('All caught up! Run: node scan.mjs  to find new jobs')}`);

for (const p of priorities) console.log('  ' + p);

// ── SCAN REMINDER ─────────────────────────────────────────────────
console.log('\n' + h('🔍 SCAN FOR NEW JOBS'));
console.log(`  Run every 2-3 days: ${ok('node scan.mjs')}`);
console.log(`  With liveness check: ${ok('node scan.mjs --verify --throttle')}`);

// ── HOW TO UPDATE STATUS ──────────────────────────────────────────
console.log('\n' + h('✏️  HOW TO UPDATE STATUS'));
console.log(`  When a company replies → open ${hi('data/applications.md')}`);
console.log(`  Change the Status column: Evaluated → Applied → Responded → Interview → Offer / Rejected`);
console.log(`  Save the file. Run this script again to see updated dashboard.`);

console.log('\n' + dim('─'.repeat(46)) + '\n');
