import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: any = null;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
} else {
  console.warn('Supabase server URL or service role key not set; weather-analyses endpoint will not function until env vars are provided.');
}

export default async function handler(req: any, res: any) {
  try {
    const q = req.query || (req.url && Object.fromEntries(new URLSearchParams(req.url.split('?')[1])) ) || {};
    const limit = Number(q.limit) || 5;

    const { data, error } = await supabaseAdmin
      .from('weather_analysis')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch weather_analysis', error);
      return res.status(500).json({ error: 'Failed to fetch' });
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
