/*
  # Add Subscription Management

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `plan_type` (text: 'free', 'starter', 'pro')
      - `status` (text: 'active', 'canceled', 'expired')
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `cancel_at_period_end` (boolean)
      - `canceled_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes to existing tables
    - Add subscription_id to users table

  3. Security
    - Enable RLS on subscriptions table
    - Add policies for users to manage their own subscriptions
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('free', 'starter', 'pro')),
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'expired')) DEFAULT 'active',
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT (now() + interval '1 month'),
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add subscription_id to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES subscriptions(id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Function to update subscription updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Function to create default subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
DECLARE
  subscription_id uuid;
BEGIN
  -- Create a free subscription for the new user
  INSERT INTO subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active')
  RETURNING id INTO subscription_id;
  
  -- Update the user with the subscription_id
  UPDATE users 
  SET subscription_id = subscription_id 
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default subscription for new users
CREATE TRIGGER create_user_subscription
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- Function to check and update expired subscriptions
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void AS $$
BEGIN
  -- Update subscriptions that have passed their end date
  UPDATE subscriptions 
  SET 
    status = 'expired',
    updated_at = now()
  WHERE 
    status = 'active' 
    AND current_period_end < now();
    
  -- Update users whose subscriptions have expired back to free plan
  UPDATE users 
  SET 
    is_premium = false,
    usage_limit = 5
  WHERE id IN (
    SELECT user_id 
    FROM subscriptions 
    WHERE status = 'expired' 
    AND plan_type != 'free'
  );
  
  -- Update expired premium subscriptions to free
  UPDATE subscriptions 
  SET 
    plan_type = 'free',
    status = 'active',
    current_period_start = now(),
    current_period_end = now() + interval '1 month',
    cancel_at_period_end = false,
    canceled_at = null
  WHERE 
    status = 'expired' 
    AND plan_type != 'free';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;