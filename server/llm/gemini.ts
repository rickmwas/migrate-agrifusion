import Ajv from 'ajv';

const ajv = new Ajv();

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

export async function sendToGemini({ prompt, schema, maxTokens = 1024, project, location }: SendToGeminiArgs) {
  // Support GOOGLE_APPLICATION_CREDENTIALS or VERTEX_API_KEY
  const apiKey = process.env.VERTEX_API_KEY;
  const useApiKey = Boolean(apiKey);

  const endpoint = useApiKey
    ? `https://us-central1-aiplatform.googleapis.com/v1/projects/${project}/locations/${location || 'us-central1'}/publishers/google/models/text-bison:predict`
    : `https://us-central1-aiplatform.googleapis.com/v1/projects/${project}/locations/${location || 'us-central1'}/publishers/google/models/text-bison:predict`;

  const body = {
    instances: [
      {
        content: prompt,
      },
    ],
    parameters: {
      maxOutputTokens: maxTokens,
      temperature: 0.2,
    },
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (useApiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const res = await fetchWithRetry(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
  const raw = await res.json();

  // Attempt to extract text from possible response shapes
  const text = raw?.predictions?.[0]?.content || raw?.prediction || raw?.response || JSON.stringify(raw);

  let parsed = null;
  if (schema) {
    // Try parsing JSON out of the text
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
        const retryRes = await fetchWithRetry(endpoint, { method: 'POST', headers, body: JSON.stringify({ instances: [{ content: regenPrompt }], parameters: { maxOutputTokens: maxTokens } }) });
        const retryRaw = await retryRes.json();
        const retryText = retryRaw?.predictions?.[0]?.content || JSON.stringify(retryRaw);
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
