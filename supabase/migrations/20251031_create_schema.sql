-- Create profiles table (linked to auth.users)
create table if not exists profiles (
  id uuid primary key,
  full_name text,
  user_type text,
  location text,
  phone_number text,
  farm_name text,
  farm_type text,
  farm_size text,
  primary_crops jsonb,
  business_name text,
  purchase_interests jsonb,
  created_at timestamptz default now()
);

-- Create market_listings table
create table if not exists market_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid,
  title text,
  description text,
  price numeric,
  unit text,
  category text,
  city text,
  image_url text,
  quantity_available numeric,
  status text default 'active',
  created_at timestamptz default now(),
  constraint fk_seller foreign key(seller_id) references profiles(id) on delete set null
);

-- Create market_trends table
create table if not exists market_trends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  produce_type text,
  location text,
  quantity numeric,
  quality_grade text,
  suggested_price_min numeric,
  suggested_price_optimal numeric,
  suggested_price_max numeric,
  demand_level text,
  supply_level text,
  price_trend text,
  market_analysis text,
  weather_impact text,
  recommendations jsonb,
  confidence_score integer,
  weather_raw jsonb,
  llm_raw jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
