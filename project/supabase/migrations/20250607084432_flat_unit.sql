/*
  # Add Stripe integration fields

  1. Changes
    - Add stripe_customer_id to users table
    - Add stripe_subscription_id to subscriptions table
    - Add stripe_price_id to subscriptions table
    - Add indexes for better performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add Stripe fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Add Stripe fields to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS stripe_price_id text;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Add unique constraints
ALTER TABLE users 
ADD CONSTRAINT users_stripe_customer_id_unique UNIQUE (stripe_customer_id);

ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id);