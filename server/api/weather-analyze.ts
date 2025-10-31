import { createClient } from '@supabase/supabase-js';
import sendToGemini from '../llm/gemini';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '', {
  auth: { persistSession: false },
});

const weatherSchema = {
  type: 'object',
  properties: {
    risk_level: { type: 'string', enum: ['low', 'moderate', 'high', 'critical'] },
    agricultural_impact: { type: 'string' },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          activity: { type: 'string' },
          timing: { type: 'string' },
          reason: { type: 'string' },
          priority: { type: 'string', enum: ['optimal', 'postpone', 'monitor'] }
        }
      }
    },
    risk_alerts: { type: 'array', items: { type: 'string' } },
    historical_comparison: { type: 'string' }
  }
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const body = req.body || (await req.json());
    const { location } = body;
    if (!location) return res.status(400).json({ error: 'location is required' });

    // Geocode via Open-Meteo
    const geocodeRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
    const geocodeData = await geocodeRes.json();
    if (!geocodeData.results || geocodeData.results.length === 0) return res.status(404).json({ error: 'Location not found' });

    const { latitude, longitude, name } = geocodeData.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,precipitation,relativehumidity_2m,windspeed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode&timezone=Africa/Nairobi&forecast_days=7`
    );
    const weather = await weatherRes.json();

    const forecast7day = weather.daily.time.map((date: string, idx: number) => ({
      date,
      temp_max: weather.daily.temperature_2m_max[idx],
      temp_min: weather.daily.temperature_2m_min[idx],
      weathercode: weather.daily.weathercode[idx],
      precipitation_chance: weather.daily.precipitation_probability_max[idx],
      precipitation_amount: weather.daily.precipitation_sum[idx]
    }));

    const prompt = `You are an agricultural weather advisor for Kenyan farmers.\n\nLocation: ${name}\nCurrent Weather:\n- Temperature: ${weather.current_weather.temperature}°C\n- Conditions: ${weather.current_weather.weathercode}\n- Wind: ${weather.current_weather.windspeed} km/h\n\n7-Day Forecast:\n${forecast7day.map((d: any) => `${d.date}: code ${d.weathercode}, High: ${d.temp_max}°C, Low: ${d.temp_min}°C, Rain: ${d.precipitation_amount}mm (${d.precipitation_chance}% chance)`).join('\n')}\n\nProvide JSON matching schema.`;

    const aiResult = await sendToGemini({ prompt, schema: weatherSchema, project: process.env.VERTEX_PROJECT_ID, location: process.env.VERTEX_LOCATION });

    const payload: any = {
      location: name,
      latitude,
      longitude,
      current_temperature: weather.current_weather.temperature,
      current_conditions: weather.current_weather.weathercode,
      wind_speed: weather.current_weather.windspeed,
      humidity: null,
      precipitation: null,
      uv_index: null,
      forecast_7day: forecast7day,
      agricultural_impact: aiResult.parsed?.agricultural_impact || null,
      planting_recommendations: aiResult.parsed?.recommendations || null,
      risk_alerts: aiResult.parsed?.risk_alerts || null,
      optimal_activities: null,
      historical_comparison: aiResult.parsed?.historical_comparison || null,
    };

    const { data, error } = await supabaseAdmin.from('weather_analysis').insert([payload]).select().single();
    if (error) {
      console.error('Insert error', error);
      return res.status(500).json({ error: 'Failed to save' });
    }

    return res.status(200).json({ weather, aiResponse: aiResult.parsed, locationName: name, forecast7day, analysis: data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
