import { createClient } from '@supabase/supabase-js';
import sendToGemini from '../llm/gemini.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: any = null;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
} else {
  console.warn('Supabase server URL or service role key not set; market-analyze endpoint will not function until env vars are provided.');
}

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
  // Guard against missing Supabase configuration to provide a clear error message
  if (!supabaseAdmin) {
    console.error('Supabase admin not initialized in market-analyze handler');
    return res.status(500).json({ error: 'Supabase not configured on server' });
  }
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const body = req.body || (await req.json());
    const { produce_type, location, quantity, quality_grade, additional_notes } = body;

    if (!produce_type || !location) return res.status(400).json({ error: 'produce_type and location are required' });

    // Fetch real weather data from Open-Meteo
    const geocodeRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
    const geocodeData = await geocodeRes.json();
    if (!geocodeData.results || geocodeData.results.length === 0) return res.status(404).json({ error: 'Location not found' });

    const { latitude, longitude, name: locationName } = geocodeData.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,precipitation,relativehumidity_2m,windspeed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode&timezone=Africa/Nairobi&forecast_days=7`
    );
    const weather = await weatherRes.json();

    const currentWeather = weather.current_weather;
    const recentRainfall = weather.daily?.precipitation_sum?.slice(0, 7).reduce((sum: number, p: number) => sum + p, 0) || 0;
    const weatherImpact = `Current temperature: ${currentWeather.temperature}°C, Conditions: ${currentWeather.weathercode}, Wind: ${currentWeather.windspeed} km/h, Recent rainfall: ${recentRainfall}mm over 7 days.`;
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
      weather_raw: JSON.stringify(weather) || null,
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
