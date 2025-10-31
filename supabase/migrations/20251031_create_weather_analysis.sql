-- Create weather_analysis table
create table if not exists weather_analysis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  location text not null,
  latitude double precision,
  longitude double precision,
  current_temperature numeric,
  current_conditions text,
  humidity numeric,
  wind_speed numeric,
  precipitation numeric,
  uv_index numeric,
  forecast_7day jsonb,
  agricultural_impact text,
  planting_recommendations jsonb,
  risk_alerts jsonb,
  optimal_activities jsonb,
  historical_comparison text,
  created_at timestamptz default now()
);
