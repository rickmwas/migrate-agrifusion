import Ajv from 'ajv';
import { chatWithGemini } from '../integrations/gemini/chat.js';

// Ajv package exports types that sometimes confuse TS in this setup; cast to any for instantiation
const ajv = new (Ajv as any)();

type SendToGeminiArgs = {
  prompt: string;
  schema?: object;
  maxTokens?: number;
  project?: string;
  location?: string;
};

async function fetchWithRetry(url: string, opts: RequestInit, retries = 2, backoff = 300) {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, backoff));
      return fetchWithRetry(url, opts, retries - 1, backoff * 2);
    }
    throw err;
  }
}

export async function sendToGemini({ prompt, schema, maxTokens = 1024 }: SendToGeminiArgs) {
  // Use server-side SDK helper to get text response
  const text = await chatWithGemini(prompt);

  const raw = { text };

  let parsed = null;
  if (schema) {
    const jsonTextMatch = text.match(/\{[\s\S]*\}/);
    const candidate = jsonTextMatch ? jsonTextMatch[0] : text;
    try {
      parsed = JSON.parse(candidate);
    } catch (e) {
      parsed = null;
    }

    if (parsed) {
      const validate = ajv.compile(schema as object);
      const valid = validate(parsed);
      if (!valid) {
        // Retry once with a strict instruction
        const regenPrompt = `Return ONLY JSON that matches this schema: ${JSON.stringify(schema)}\n\n${prompt}`;
        const retryText = await chatWithGemini(regenPrompt);
        const match2 = retryText.match(/\{[\s\S]*\}/);
        try {
          parsed = match2 ? JSON.parse(match2[0]) : JSON.parse(retryText);
        } catch (e) {
          parsed = null;
        }
        if (parsed) {
          const valid2 = ajv.compile(schema as object)(parsed);
          if (!valid2) {
            return { parsed: null, raw };
          }
        }
      }
    }
  }

  return { parsed, raw };
}

export default sendToGemini;
