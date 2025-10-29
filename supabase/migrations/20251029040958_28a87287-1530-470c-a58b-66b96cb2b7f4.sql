-- Create user_type enum
CREATE TYPE user_type AS ENUM ('farmer', 'buyer');

-- Create farm_type enum
CREATE TYPE farm_type AS ENUM ('crops', 'livestock', 'mixed', 'poultry', 'dairy');

-- Create listing_category enum
CREATE TYPE listing_category AS ENUM ('crops', 'livestock', 'dairy', 'poultry', 'seeds', 'equipment', 'other');

-- Create listing_status enum
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'inactive');

-- Create quality_grade enum
CREATE TYPE quality_grade AS ENUM ('premium', 'grade_a', 'grade_b', 'grade_c', 'reject');

-- Create product_type enum
CREATE TYPE product_type AS ENUM ('crop', 'livestock', 'dairy', 'processed');

-- Create market_readiness enum
CREATE TYPE market_readiness AS ENUM ('ready', 'needs_improvement', 'not_ready');

-- Create price_trend enum
CREATE TYPE price_trend AS ENUM ('falling', 'stable', 'rising');

-- Create demand_supply_level enum
CREATE TYPE demand_supply_level AS ENUM ('very_low', 'low', 'moderate', 'high', 'very_high');

-- 1. Create profiles table for additional user information
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  user_type user_type NOT NULL DEFAULT 'buyer',
  location TEXT,
  phone_number TEXT,
  
  -- Farmer-specific fields
  farm_name TEXT,
  farm_type farm_type,
  farm_size TEXT,
  primary_crops TEXT[],
  
  -- Buyer-specific fields
  business_name TEXT,
  purchase_interests TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 2. Create market_listings table
CREATE TABLE market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category listing_category NOT NULL DEFAULT 'crops',
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  unit TEXT NOT NULL,
  quantity_available INTEGER,
  description TEXT,
  image_url TEXT,
  location TEXT NOT NULL,
  seller_name TEXT,
  seller_phone TEXT,
  seller_email TEXT,
  status listing_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on market_listings
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;

-- Market listings policies
CREATE POLICY "Anyone can view active listings"
  ON market_listings FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Farmers can insert listings"
  ON market_listings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'farmer'
    )
  );

CREATE POLICY "Farmers can update own listings"
  ON market_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Farmers can delete own listings"
  ON market_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- 3. Create quality_reports table
CREATE TABLE quality_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_type product_type NOT NULL,
  product_name TEXT NOT NULL,
  image_url TEXT,
  quality_grade quality_grade,
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  visual_assessment TEXT[],
  defects_detected TEXT[],
  market_readiness market_readiness,
  recommendations TEXT,
  estimated_price_range TEXT,
  shelf_life TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on quality_reports
ALTER TABLE quality_reports ENABLE ROW LEVEL SECURITY;

-- Quality reports policies
CREATE POLICY "Users can view own reports"
  ON quality_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON quality_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Create market_trends table
CREATE TABLE market_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  produce_type TEXT NOT NULL,
  location TEXT NOT NULL,
  suggested_price_min DECIMAL(10, 2),
  suggested_price_optimal DECIMAL(10, 2),
  suggested_price_max DECIMAL(10, 2),
  market_analysis TEXT,
  weather_impact TEXT,
  demand_level demand_supply_level,
  supply_level demand_supply_level,
  price_trend price_trend,
  recommendations TEXT[],
  quality_grade quality_grade,
  quantity DECIMAL(10, 2),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on market_trends
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;

-- Market trends policies
CREATE POLICY "Users can view own trends"
  ON market_trends FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trends"
  ON market_trends FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. Create weather_analyses table
CREATE TABLE weather_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  current_temperature DECIMAL(5, 2),
  current_conditions TEXT,
  humidity INTEGER,
  wind_speed DECIMAL(5, 2),
  precipitation DECIMAL(5, 2),
  uv_index INTEGER,
  forecast_7day JSONB,
  agricultural_impact TEXT,
  planting_recommendations JSONB,
  risk_alerts TEXT[],
  optimal_activities JSONB,
  historical_comparison TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on weather_analyses
ALTER TABLE weather_analyses ENABLE ROW LEVEL SECURITY;

-- Weather analyses policies
CREATE POLICY "Users can view own analyses"
  ON weather_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON weather_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at on relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_listings_updated_at
  BEFORE UPDATE ON market_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();