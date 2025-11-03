import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.post('/api/market-analyze', async (req, res) => {
  return (await import('./api/market-analyze.js')).default(req, res);
});

app.get('/api/market-trends', async (req, res) => {
  return (await import('./api/market-trends.js')).default(req, res);
});

app.post('/api/weather-analyze', async (req, res) => {
  return (await import('./api/weather-analyze.js')).default(req, res);
});

app.get('/api/weather-analyses', async (req, res) => {
  return (await import('./api/weather-analyses.js')).default(req, res);
});

app.post('/api/chat', async (req, res) => {
  return (await import('./api/chat.js')).default(req, res);
});

app.post('/api/quality-check', async (req, res) => {
  return (await import('./api/quality-check.js')).default(req, res);
});

app.get('/', (req, res) => {
  res.json({ message: 'Farmer Yield Guide Hub API is running' });
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
