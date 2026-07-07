import { readFileSync } from 'fs';
import { config } from 'dotenv';
config();
const cvContent = readFileSync('cv.md', 'utf-8').trim();
const jdText = "a".repeat(15000); // 15k chars
const systemPrompt = `You are career-ops...
${readFileSync('modes/_shared.md', 'utf-8').trim()}
${readFileSync('modes/oferta.md', 'utf-8').trim()}
${cvContent}
`;

function sanitizeForJson(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

const bodyString = JSON.stringify({
  model: process.env.OPENAI_MODEL,
  messages: [
    { role: 'system', content: sanitizeForJson(systemPrompt) },
    { role: 'user', content: `JOB DESCRIPTION TO EVALUATE:\n\n${sanitizeForJson(jdText)}` },
  ],
  stream: false,
  temperature: 0.4,
});

try {
  const res = await fetch(process.env.OPENAI_BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: bodyString,
    signal: AbortSignal.timeout(300000)
  });
  if (!res.ok) console.log(res.status, await res.text());
  else console.log(await res.json());
} catch(e) {
  console.error("FETCH ERROR:", e.message);
  console.error("CAUSE:", e.cause);
}
