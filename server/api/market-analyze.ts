import { createClient } from '@supabase/supabase-js';
import sendToGemini from '../llm/gemini';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase server URL or service role key not set; market-analyze endpoint will not function until env vars are provided.');
}

const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '', {
  auth: { persistSession: false },
});

const weatherSchema = {
  type: 'object',
  properties: {
    current_weather: { type: 'string' },
    temperature: { type: 'number' },
    rainfall_recent: { type: 'string' },
    weather_impact_on_farming: { type: 'string' }
  },
  required: ['current_weather']
};

const marketSchema = {
  type: 'object',
  properties: {
    suggested_price_min: { type: 'number' },
    suggested_price_optimal: { type: 'number' },
    suggested_price_max: { type: 'number' },
    demand_level: { type: 'string' },
    supply_level: { type: 'string' },
    price_trend: { type: 'string' },
    market_analysis: { type: 'string' },
    weather_impact: { type: 'string' },
    recommendations: { type: 'array' },
    confidence_score: { type: 'number' }
  },
  required: ['suggested_price_optimal']
};

// Example handler for Node/Edge function frameworks
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const body = req.body || (await req.json());
    const { produce_type, location, quantity, quality_grade, additional_notes } = body;

    if (!produce_type || !location) return res.status(400).json({ error: 'produce_type and location are required' });

    // Call Gemini for weather
    const weatherPrompt = `Provide current weather conditions for ${location}, Kenya. Return valid JSON matching:\n${JSON.stringify(weatherSchema)}`;
    const weatherResult = await sendToGemini({ prompt: weatherPrompt, schema: weatherSchema, project: process.env.VERTEX_PROJECT_ID, location: process.env.VERTEX_LOCATION });

    // Market prompt uses weather impact
    const weatherImpact = weatherResult.parsed?.weather_impact_on_farming || '';
    const marketPrompt = `Analyze the market for ${produce_type} in ${location}, Kenya with the following inputs:\n- quality_grade: ${quality_grade || 'standard'}\n- quantity: ${quantity || ''}\n- weather_impact: ${weatherImpact}\n\nProvide output as JSON matching schema:\n${JSON.stringify(marketSchema)}`;

    const marketResult = await sendToGemini({ prompt: marketPrompt, schema: marketSchema, project: process.env.VERTEX_PROJECT_ID, location: process.env.VERTEX_LOCATION });

    // Persist to Supabase
    const payload: any = {
      produce_type,
      location,
      quantity: quantity || null,
      quality_grade: quality_grade || null,
      suggested_price_min: marketResult.parsed?.suggested_price_min || null,
      suggested_price_optimal: marketResult.parsed?.suggested_price_optimal || null,
      suggested_price_max: marketResult.parsed?.suggested_price_max || null,
      demand_level: marketResult.parsed?.demand_level || null,
      supply_level: marketResult.parsed?.supply_level || null,
      price_trend: marketResult.parsed?.price_trend || null,
      market_analysis: marketResult.parsed?.market_analysis || null,
      weather_impact: marketResult.parsed?.weather_impact || weatherImpact || null,
      recommendations: marketResult.parsed?.recommendations || null,
      confidence_score: marketResult.parsed?.confidence_score || null,
      weather_raw: weatherResult.raw || null,
      llm_raw: marketResult.raw || null,
    };

    const { data, error } = await supabaseAdmin.from('market_trends').insert([payload]).select().single();
    if (error) {
      console.error('Supabase insert error', error);
      return res.status(500).json({ error: 'Failed to save analysis' });
    }

    return res.status(200).json({ analysis: data });
  } catch (err: any) {
    console.error(err);
    return (req?.res || res).status ? res.status(500).json({ error: err.message || 'Internal error' }) : null;
  }
}
