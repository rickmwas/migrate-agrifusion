-- Add seller information columns to market_listings table
-- Rename city to location for consistency
-- Add seller contact information

ALTER TABLE market_listings
ADD COLUMN IF NOT EXISTS seller_name text,
ADD COLUMN IF NOT EXISTS seller_phone text,
ADD COLUMN IF NOT EXISTS seller_email text,
ADD COLUMN IF NOT EXISTS location text;

-- Copy city data to location column
UPDATE market_listings SET location = city WHERE location IS NULL;

-- Drop the old city column
ALTER TABLE market_listings DROP COLUMN IF EXISTS city;
