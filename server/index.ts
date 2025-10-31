import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import marketAnalyze from './api/market-analyze';
import marketTrends from './api/market-trends';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.post('/api/market-analyze', async (req, res) => {
  return marketAnalyze(req, res);
});

app.get('/api/market-trends', async (req, res) => {
  return marketTrends(req, res);
});

app.post('/api/weather-analyze', async (req, res) => {
  return (await import('./api/weather-analyze')).default(req, res);
});

app.get('/api/weather-analyses', async (req, res) => {
  return (await import('./api/weather-analyses')).default(req, res);
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
