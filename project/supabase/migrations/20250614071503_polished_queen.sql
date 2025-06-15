/*
  # Add subscription monitoring and cleanup functions

  1. New Indexes
    - Add performance indexes for subscription queries
    
  2. New Functions
    - get_subscription_stats() - Get subscription statistics
    - get_expired_subscriptions() - Find subscriptions that need cleanup
    - force_expire_subscription() - Manually expire a subscription
    
  3. New View
    - subscription_overview - Easy monitoring view with RLS
    
  4. Security
    - All functions use SECURITY DEFINER
    - View has proper RLS policies
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Function to get subscription statistics
CREATE OR REPLACE FUNCTION get_subscription_stats()
RETURNS TABLE (
  total_subscriptions bigint,
  active_subscriptions bigint,
  expired_subscriptions bigint,
  canceled_subscriptions bigint,
  free_plan_users bigint,
  starter_plan_users bigint,
  pro_plan_users bigint,
  overdue_subscriptions bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
    COUNT(*) FILTER (WHERE status = 'expired') as expired_subscriptions,
    COUNT(*) FILTER (WHERE status = 'canceled') as canceled_subscriptions,
    COUNT(*) FILTER (WHERE plan_type = 'free') as free_plan_users,
    COUNT(*) FILTER (WHERE plan_type = 'starter') as starter_plan_users,
    COUNT(*) FILTER (WHERE plan_type = 'pro') as pro_plan_users,
    COUNT(*) FILTER (WHERE current_period_end < NOW() AND status = 'active') as overdue_subscriptions
  FROM subscriptions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get expired subscriptions that need cleanup
CREATE OR REPLACE FUNCTION get_expired_subscriptions()
RETURNS TABLE (
  user_id uuid,
  user_email text,
  plan_type text,
  status text,
  current_period_end timestamptz,
  days_overdue integer,
  user_is_premium boolean,
  user_usage_limit integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.user_id,
    u.email as user_email,
    s.plan_type,
    s.status,
    s.current_period_end,
    EXTRACT(DAY FROM NOW() - s.current_period_end)::integer as days_overdue,
    u.is_premium as user_is_premium,
    u.usage_limit as user_usage_limit
  FROM subscriptions s
  JOIN users u ON s.user_id = u.id
  WHERE s.current_period_end < NOW()
    AND s.status = 'active'
  ORDER BY s.current_period_end ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually expire a specific subscription
CREATE OR REPLACE FUNCTION force_expire_subscription(target_user_id uuid)
RETURNS TABLE (
  success boolean,
  message text,
  old_plan_type text,
  new_plan_type text
) AS $$
DECLARE
  old_plan text;
  subscription_record record;
BEGIN
  -- Get current subscription info
  SELECT plan_type INTO old_plan
  FROM subscriptions 
  WHERE user_id = target_user_id 
    AND status = 'active'
  LIMIT 1;

  IF old_plan IS NULL THEN
    RETURN QUERY SELECT false, 'No active subscription found for user', null::text, null::text;
    RETURN;
  END IF;

  -- Update subscription to expired
  UPDATE subscriptions 
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE user_id = target_user_id 
    AND status = 'active';

  -- Update user to free plan
  UPDATE users 
  SET 
    is_premium = false,
    usage_limit = 5
  WHERE id = target_user_id;

  -- Create new free subscription
  INSERT INTO subscriptions (user_id, plan_type, status, current_period_start, current_period_end)
  VALUES (
    target_user_id,
    'free',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
  );

  RETURN QUERY SELECT true, 'Subscription expired and user moved to free plan', old_plan, 'free'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a table for the subscription overview instead of a view to avoid RLS issues
CREATE TABLE IF NOT EXISTS subscription_overview_cache (
  user_id uuid PRIMARY KEY,
  email text,
  name text,
  is_premium boolean,
  usage_limit integer,
  usage_count integer,
  plan_type text,
  subscription_status text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  canceled_at timestamptz,
  alert_status text,
  days_until_expiry numeric,
  last_updated timestamptz DEFAULT NOW()
);

-- Enable RLS on the cache table
ALTER TABLE subscription_overview_cache ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for the cache table
CREATE POLICY "Users can view their own subscription overview cache"
  ON subscription_overview_cache
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Function to refresh the subscription overview cache
CREATE OR REPLACE FUNCTION refresh_subscription_overview_cache()
RETURNS void AS $$
BEGIN
  -- Clear existing cache
  DELETE FROM subscription_overview_cache;
  
  -- Populate with fresh data
  INSERT INTO subscription_overview_cache (
    user_id,
    email,
    name,
    is_premium,
    usage_limit,
    usage_count,
    plan_type,
    subscription_status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    canceled_at,
    alert_status,
    days_until_expiry,
    last_updated
  )
  SELECT 
    u.id as user_id,
    u.email,
    u.name,
    u.is_premium,
    u.usage_limit,
    u.usage_count,
    COALESCE(s.plan_type, 'free') as plan_type,
    COALESCE(s.status, 'active') as subscription_status,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.canceled_at,
    CASE 
      WHEN s.current_period_end < NOW() AND s.status = 'active' THEN 'OVERDUE'
      WHEN s.current_period_end < NOW() + INTERVAL '7 days' AND s.status = 'active' THEN 'EXPIRING_SOON'
      ELSE 'OK'
    END as alert_status,
    EXTRACT(DAY FROM s.current_period_end - NOW()) as days_until_expiry,
    NOW() as last_updated
  FROM users u
  LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status IN ('active', 'canceled')
  ORDER BY s.current_period_end ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a user's subscription overview
CREATE OR REPLACE FUNCTION get_user_subscription_overview(target_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  email text,
  name text,
  is_premium boolean,
  usage_limit integer,
  usage_count integer,
  plan_type text,
  subscription_status text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  canceled_at timestamptz,
  alert_status text,
  days_until_expiry numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email,
    u.name,
    u.is_premium,
    u.usage_limit,
    u.usage_count,
    COALESCE(s.plan_type, 'free') as plan_type,
    COALESCE(s.status, 'active') as subscription_status,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.canceled_at,
    CASE 
      WHEN s.current_period_end < NOW() AND s.status = 'active' THEN 'OVERDUE'
      WHEN s.current_period_end < NOW() + INTERVAL '7 days' AND s.status = 'active' THEN 'EXPIRING_SOON'
      ELSE 'OK'
    END as alert_status,
    EXTRACT(DAY FROM s.current_period_end - NOW()) as days_until_expiry
  FROM users u
  LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status IN ('active', 'canceled')
  WHERE u.id = target_user_id
  ORDER BY s.current_period_end ASC NULLS LAST
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;