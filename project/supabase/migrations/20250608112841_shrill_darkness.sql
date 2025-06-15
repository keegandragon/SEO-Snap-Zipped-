/*
  # Create Stripe Products and Prices Tables

  1. New Tables
    - `stripe_products`
      - `id` (text, primary key) - Stripe Product ID
      - `active` (boolean)
      - `name` (text, not null)
      - `description` (text)
      - `image` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `stripe_prices`
      - `id` (text, primary key) - Stripe Price ID
      - `product_id` (text, foreign key)
      - `active` (boolean)
      - `currency` (text, not null)
      - `unit_amount` (integer) - Price in cents
      - `type` (text, not null) - 'one_time' or 'recurring'
      - `recurring_interval` (text)
      - `recurring_interval_count` (integer)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read stripe data

  3. Sample Data
    - Insert sample products (Starter and Pro plans)
    - Insert sample prices (monthly and yearly for each plan)
*/

-- Create stripe_products table
CREATE TABLE IF NOT EXISTS stripe_products (
  id text PRIMARY KEY, -- Stripe Product ID (e.g., prod_xyz)
  active boolean DEFAULT true,
  name text NOT NULL,
  description text,
  image text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stripe_prices table
CREATE TABLE IF NOT EXISTS stripe_prices (
  id text PRIMARY KEY, -- Stripe Price ID (e.g., price_xyz)
  product_id text REFERENCES stripe_products(id) ON DELETE CASCADE,
  active boolean DEFAULT true,
  currency text NOT NULL DEFAULT 'usd',
  unit_amount integer, -- Price in cents
  type text NOT NULL DEFAULT 'recurring', -- 'one_time' or 'recurring'
  recurring_interval text, -- 'month', 'year', etc.
  recurring_interval_count integer DEFAULT 1,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users to read stripe data
CREATE POLICY "Allow authenticated users to read stripe products"
  ON stripe_products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read stripe prices"
  ON stripe_prices
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample products
INSERT INTO stripe_products (id, name, description, metadata) VALUES 
('prod_starter', 'Starter Plan', 'Great for small businesses', '{"popular": "false"}'),
('prod_pro', 'Pro Plan', 'For power users and agencies', '{"popular": "true"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Insert sample prices (now including currency and type explicitly)
INSERT INTO stripe_prices (id, product_id, currency, unit_amount, type, recurring_interval, metadata) VALUES 
-- Starter Plan Prices
('price_starter_monthly', 'prod_starter', 'usd', 999, 'recurring', 'month', '{"billing_cycle": "monthly"}'), -- $9.99/month
('price_starter_yearly', 'prod_starter', 'usd', 9999, 'recurring', 'year', '{"billing_cycle": "yearly"}'), -- $99.99/year
-- Pro Plan Prices
('price_pro_monthly', 'prod_pro', 'usd', 1999, 'recurring', 'month', '{"billing_cycle": "monthly"}'), -- $19.99/month
('price_pro_yearly', 'prod_pro', 'usd', 19999, 'recurring', 'year', '{"billing_cycle": "yearly"}') -- $199.99/year
ON CONFLICT (id) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  currency = EXCLUDED.currency,
  unit_amount = EXCLUDED.unit_amount,
  type = EXCLUDED.type,
  recurring_interval = EXCLUDED.recurring_interval,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_prices_product_id ON stripe_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_stripe_prices_active ON stripe_prices(active);
CREATE INDEX IF NOT EXISTS idx_stripe_products_active ON stripe_products(active);