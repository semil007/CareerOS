#!/usr/bin/env node
/**
 * generate-cv.mjs — Tailored CV generator using your .env model (Qubrid/Qwen/OpenAI-compatible)
 *
 * Reads JD (URL or file), asks your configured model to tailor cv.md,
 * injects into the HTML template, and generates a PDF — zero chat credits used.
 *
 * Usage:
 *   node generate-cv.mjs --url https://jobs.ashbyhq.com/sarvam/xxx
 *   node generate-cv.mjs --file jds/role.txt
 *   node generate-cv.mjs --url <url> --slug sarvam-vision   (custom output slug)
 *
 * Requires: OPENAI_BASE_URL + OPENAI_MODEL + OPENAI_API_KEY in .env
 * Output:   output/{slug}-cv.html  +  output/{slug}-cv.pdf
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

try { const { config } = await import('dotenv'); config(); } catch {}

const ROOT = dirname(fileURLToPath(import.meta.url));

// ── CLI args ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help')) {
  console.log(`
generate-cv.mjs — Tailored CV using your .env model

USAGE
  node generate-cv.mjs --url <job-url>
  node generate-cv.mjs --file <jd-file>
  node generate-cv.mjs --url <url> --slug <custom-slug>

OPTIONS
  --url <url>      Fetch JD from URL via Playwright
  --file <path>    Read JD from local file
  --slug <slug>    Output filename slug (default: auto from company+role)
  --no-pdf         Generate HTML only, skip PDF conversion
  --help           Show this help

EXAMPLES
  node generate-cv.mjs --url https://jobs.ashbyhq.com/sarvam/xxx
  node generate-cv.mjs --file jds/nvidia-sa.txt --slug nvidia-sa-genai
`);
  process.exit(0);
}

let jdSource = null;
let jdIsUrl  = false;
let customSlug = null;
let skipPdf  = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url'  && args[i+1]) { jdSource = args[++i]; jdIsUrl = true; }
  if (args[i] === '--file' && args[i+1]) { jdSource = args[++i]; }
  if (args[i] === '--slug' && args[i+1]) { customSlug = args[++i]; }
  if (args[i] === '--no-pdf') skipPdf = true;
}

if (!jdSource) {
  console.error('❌  Provide --url or --file. Run with --help for usage.');
  process.exit(1);
}

// ── fetch JD ─────────────────────────────────────────────────────
async function fetchJD(url) {
  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch { throw new Error('Playwright not installed — run: npx playwright install chromium'); }
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    // Go directly to /application if Ashby (gets form page, not overview)
    const appUrl = url.includes('ashbyhq.com') && !url.endsWith('/application')
      ? url.replace(/\/$/, '') + '/application'
      : url;
    await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);
    const text = await page.evaluate(() => {
      document.querySelectorAll('script,style,nav,footer,header').forEach(e => e.remove());
      return (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
    });
    return `URL: ${url}\n\n${text.slice(0, 12000)}`;
  } finally {
    await browser.close();
  }
}

// ── call API ──────────────────────────────────────────────────────
async function callModel(systemPrompt, userMessage) {
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model   = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const apiKey  = process.env.OPENAI_API_KEY || '';
  const endpoint = `${baseUrl}/chat/completions`;

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
      max_tokens: 6000,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || '';
}

// ── run generate-pdf.mjs ──────────────────────────────────────────
function runPdf(htmlPath, pdfPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [join(ROOT, 'generate-pdf.mjs'), htmlPath, pdfPath, '--format=a4'],
      { cwd: ROOT, stdio: 'inherit' }
    );
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`generate-pdf exited ${code}`)));
  });
}

// ── slugify ───────────────────────────────────────────────────────
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

// 1. Get JD text
let jdText;
if (jdIsUrl) {
  console.log(`\n📥 Fetching JD from ${jdSource}...`);
  jdText = await fetchJD(jdSource);
  console.log(`   ${Math.round(jdText.length / 1000)}k chars fetched`);
} else {
  if (!existsSync(jdSource)) { console.error(`❌  File not found: ${jdSource}`); process.exit(1); }
  jdText = readFileSync(jdSource, 'utf-8').trim();
  console.log(`\n📄 JD loaded from ${jdSource} (${Math.round(jdText.length / 1000)}k chars)`);
}

// 2. Load context
const cvMd      = readFileSync(join(ROOT, 'cv.md'), 'utf-8');
const profileYml = existsSync(join(ROOT, 'config/profile.yml'))
  ? readFileSync(join(ROOT, 'config/profile.yml'), 'utf-8') : '';
const profileMd  = existsSync(join(ROOT, 'modes/_profile.md'))
  ? readFileSync(join(ROOT, 'modes/_profile.md'), 'utf-8') : '';

// 3. Load existing HTML template (use sarvam-vision as base — clean structure)
const templateHtml = existsSync(join(ROOT, 'output/sarvam-vision-cv.html'))
  ? readFileSync(join(ROOT, 'output/sarvam-vision-cv.html'), 'utf-8')
  : null;

// 4. Ask model to produce tailored CV sections
console.log(`\n🤖 Tailoring CV with ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}...`);

const systemPrompt = `You are an expert CV writer. You tailor a candidate's CV specifically for a job description.

CANDIDATE CV (source of truth — never invent facts):
${cvMd}

CANDIDATE PROFILE:
${profileMd.slice(0, 2000)}

RULES:
1. NEVER invent experience, metrics, or skills not in the CV
2. Reorder and reframe existing bullets to match JD keywords
3. Output ONLY valid JSON — no markdown, no explanation
4. JSON must have exactly these keys:
   - "headline": subtitle line under the name (role-specific, max 12 words)
   - "summary": 3-4 sentence professional summary tailored to JD (plain text)
   - "tags": array of 14-16 competency tag strings most relevant to JD
   - "bullets_ak": array of 6 bullet strings for AK Technologies experience (reordered/reframed for JD)
   - "company": company name from JD
   - "role": job title from JD
   - "slug": kebab-case slug for filenames e.g. "sarvam-dubbing" or "nvidia-sa-genai"`;

const userMessage = `Tailor the CV for this job:\n\n${jdText.slice(0, 8000)}`;

let tailored;
try {
  const raw = await callModel(systemPrompt, userMessage);
  
  // Extract JSON object to ignore conversational filler (e.g. "I'm sorry, here is the JSON: ...")
  let clean = raw;
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    clean = jsonMatch[0];
  } else {
    // Fallback to strip markdown if no clear block is found
    clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  }
  
  tailored = JSON.parse(clean);
} catch (err) {
  console.error(`❌  Model error or JSON parse failed: ${err.message}`);
  process.exit(1);
}

const slug = customSlug || slugify(tailored.slug || `${tailored.company}-${tailored.role}`);
console.log(`   Company: ${tailored.company} | Role: ${tailored.role} | Slug: ${slug}`);

// 5. Build HTML — inject tailored content into template structure
const tagsHtml   = (tailored.tags || []).map(t => `<span class="tag">${t}</span>`).join('\n      ');
const bulletsHtml = (tailored.bullets_ak || []).map(b => `<li>${b}</li>`).join('\n        ');

// Use sarvam-vision template as base and swap the dynamic parts
let html;
if (templateHtml) {
  html = templateHtml
    .replace(
      /(<div class="title-line">)[^<]*/,
      `$1${tailored.headline}`
    )
    .replace(
      /(<p class="summary-text">\s*)[^<]*/s,
      (_, open) => open + (tailored.summary || '')
    )
    .replace(
      /(<div class="entry-title-company">Machine Learning Engineer[\s\S]*?<\/div>[\s\S]*?<ul class="bullets">)[\s\S]*?(<\/ul>)/,
      `$1\n        ${bulletsHtml}\n      $2`
    );
} else {
  // Fallback: build minimal HTML from scratch
  html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Semil Periyasamy — CV</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;max-width:780px;margin:0 auto;padding:32px 40px;color:#1a1a2e}
h1{font-size:26px;margin-bottom:4px}.sub{color:#555;font-style:italic;margin-bottom:8px}
h2{font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#1a8a8a;border-bottom:1.5px solid #e2e2e2;padding-bottom:3px;margin:14px 0 8px}
p{font-size:10.5px;line-height:1.7}ul{padding-left:16px}li{font-size:10.5px;line-height:1.6;margin-bottom:3px}
.tags{display:flex;flex-wrap:wrap;gap:6px}.tag{font-size:10px;padding:3px 9px;border-radius:3px;background:#e8f7f7;border:1px solid #b8e0e0;color:#1a8a8a}
</style></head><body>
<h1>Semil Periyasamy</h1><div class="sub">${tailored.headline}</div>
<p>semilpm@gmail.com | +91 70924 04027 | linkedin.com/in/semil-p | getsemil.com | github.com/semil007 | Coimbatore, India</p>
<h2>Professional Summary</h2><p>${tailored.summary}</p>
<h2>Core Competencies</h2><div class="tags">${tagsHtml}</div>
<h2>Work Experience</h2>
<p><strong>AK Technologies</strong> — Machine Learning Engineer | Sep 2024 – Present | Coimbatore</p>
<ul>${bulletsHtml}</ul>
<p><strong>DigitalGarage Pvt. Ltd</strong> — AI Engineer Intern | Mar 2024 – Aug 2024</p>
<ul><li>Built and benchmarked ML models for computer vision and NLP; contributed to system design and evaluation pipelines.</li></ul>
<p><strong>Shiash Info Solutions Pvt. Ltd</strong> — Data Science Intern | Feb 2024 – May 2024</p>
<ul><li>Multi-source data analysis with Python; built visualisation pipelines for business insights.</li></ul>
<h2>Technical Skills</h2>
<p><strong>Languages:</strong> Python, SQL, R | <strong>LLM:</strong> Fine-tuning (LoRA/QLoRA), RAG, Agentic Systems, Gemini 1.5 | <strong>Inference:</strong> TensorRT-LLM, vLLM, CUDA, INT8/FP8 | <strong>MLOps:</strong> W&B, Vertex AI, Azure ML, Docker, Redis | <strong>Open Source:</strong> vLLM, LLMCache contributor</p>
<h2>Certifications</h2>
<ul><li>Deploying RAG Pipelines for Production at Scale — NVIDIA</li><li>Adversarial Machine Learning DLI — NVIDIA</li><li>Professional AI Developer — IBM/Coursera</li></ul>
<h2>Education</h2>
<p>B.Tech — Artificial Intelligence &amp; Data Science | Arjun College of Technology, Coimbatore | Jul 2020 – May 2024 | GPA: 8.2/10</p>
</body></html>`;
}

// 6. Write HTML
const htmlPath = join(ROOT, 'output', `${slug}-cv.html`);
const pdfPath  = join(ROOT, 'output', `${slug}-cv.pdf`);
writeFileSync(htmlPath, html, 'utf-8');
console.log(`\n✅ HTML written: output/${slug}-cv.html`);

// 7. Generate PDF
if (!skipPdf) {
  console.log(`📄 Generating PDF...`);
  try {
    await runPdf(htmlPath, pdfPath);
    console.log(`✅ PDF ready:  output/${slug}-cv.pdf`);
  } catch (err) {
    console.error(`⚠  PDF failed: ${err.message}`);
    console.log(`   HTML is ready — run manually: node generate-pdf.mjs ${htmlPath} ${pdfPath} --format=a4`);
  }
}

console.log(`\n🎯 Done: ${tailored.company} — ${tailored.role}`);
console.log(`   HTML: output/${slug}-cv.html`);
if (!skipPdf) console.log(`   PDF:  output/${slug}-cv.pdf`);
