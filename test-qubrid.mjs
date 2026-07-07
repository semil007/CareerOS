import { readFileSync } from 'fs';
import { config } from 'dotenv';
config();
const jdText = "Job Description Test";
const cvContent = "CV Test";
const systemPrompt = "System Prompt Test";
const bodyString = JSON.stringify({
  model: process.env.OPENAI_MODEL,
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `JOB DESCRIPTION TO EVALUATE:\n\n${jdText}` },
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
