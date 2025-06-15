/*
  # Enhanced Subscription Expiry Management

  1. Changes
    - Drop and recreate check_expired_subscriptions function with enhanced return type
    - Add subscription health monitoring functions
    - Add manual user downgrade function for admin use
    - Add performance indexes for subscription queries

  2. Security
    - All functions use SECURITY DEFINER
    - Maintain existing RLS policies
*/

-- Drop existing function to avoid return type conflict
DROP FUNCTION IF EXISTS check_expired_subscriptions();

-- Enhanced function to check and handle expired subscriptions
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS TABLE (
  processed_count integer,
  error_count integer,
  summary jsonb
) AS $$
DECLARE
  processed_count integer := 0;
  error_count integer := 0;
  summary_data jsonb := '{}';
  expired_sub record;
  user_record record;
BEGIN
  -- Log start of process
  RAISE NOTICE 'Starting subscription expiry check at %', NOW();

  -- Process each expired subscription
  FOR expired_sub IN 
    SELECT s.*, u.email, u.name, u.is_premium, u.usage_limit
    FROM subscriptions s
    JOIN users u ON s.user_id = u.id
    WHERE s.status = 'active' 
      AND s.current_period_end < NOW()
  LOOP
    BEGIN
      RAISE NOTICE 'Processing expired subscription for user: % (Plan: %)', expired_sub.email, expired_sub.plan_type;

      -- Update subscription to expired
      UPDATE subscriptions 
      SET 
        status = 'expired',
        updated_at = NOW()
      WHERE id = expired_sub.id;

      -- Downgrade user to free plan
      UPDATE users 
      SET 
        is_premium = false,
        usage_limit = 5,
        usage_count = 0  -- Reset usage for new billing period
      WHERE id = expired_sub.user_id;

      -- Create new free subscription
      INSERT INTO subscriptions (
        user_id, 
        plan_type, 
        status, 
        current_period_start, 
        current_period_end,
        cancel_at_period_end,
        canceled_at
      ) VALUES (
        expired_sub.user_id,
        'free',
        'active',
        NOW(),
        NOW() + INTERVAL '1 month',
        false,
        null
      );

      processed_count := processed_count + 1;
      RAISE NOTICE 'Successfully downgraded user % from % to free', expired_sub.email, expired_sub.plan_type;

    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      RAISE WARNING 'Error processing subscription for user %: %', expired_sub.email, SQLERRM;
    END;
  END LOOP;

  -- Fix any inconsistent user states
  UPDATE users 
  SET 
    is_premium = false,
    usage_limit = 5
  WHERE is_premium = true 
    AND id IN (
      SELECT user_id 
      FROM subscriptions 
      WHERE plan_type = 'free' 
        AND status = 'active'
    );

  -- Build summary
  summary_data := jsonb_build_object(
    'processed_at', NOW(),
    'expired_subscriptions_found', (
      SELECT COUNT(*) 
      FROM subscriptions 
      WHERE status = 'expired' 
        AND updated_at::date = CURRENT_DATE
    ),
    'active_free_subscriptions', (
      SELECT COUNT(*) 
      FROM subscriptions 
      WHERE plan_type = 'free' 
        AND status = 'active'
    ),
    'active_paid_subscriptions', (
      SELECT COUNT(*) 
      FROM subscriptions 
      WHERE plan_type IN ('starter', 'pro') 
        AND status = 'active'
    )
  );

  RAISE NOTICE 'Subscription expiry check completed. Processed: %, Errors: %', processed_count, error_count;

  RETURN QUERY SELECT processed_count, error_count, summary_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription health report
CREATE OR REPLACE FUNCTION get_subscription_health_report()
RETURNS TABLE (
  metric text,
  count bigint,
  details jsonb
) AS $$
BEGIN
  RETURN QUERY
  -- Overdue subscriptions (should be 0 if system is working)
  SELECT 
    'overdue_subscriptions'::text,
    COUNT(*),
    jsonb_agg(
      jsonb_build_object(
        'user_email', u.email,
        'plan_type', s.plan_type,
        'days_overdue', EXTRACT(DAY FROM NOW() - s.current_period_end)
      )
    )
  FROM subscriptions s
  JOIN users u ON s.user_id = u.id
  WHERE s.status = 'active' 
    AND s.current_period_end < NOW()

  UNION ALL

  -- Inconsistent user states (premium users with free subscriptions)
  SELECT 
    'inconsistent_user_states'::text,
    COUNT(*),
    jsonb_agg(
      jsonb_build_object(
        'user_email', u.email,
        'user_is_premium', u.is_premium,
        'subscription_plan', s.plan_type
      )
    )
  FROM users u
  JOIN subscriptions s ON u.id = s.user_id
  WHERE s.status = 'active'
    AND (
      (u.is_premium = true AND s.plan_type = 'free') OR
      (u.is_premium = false AND s.plan_type IN ('starter', 'pro'))
    )

  UNION ALL

  -- Subscriptions expiring in next 7 days
  SELECT 
    'expiring_soon'::text,
    COUNT(*),
    jsonb_agg(
      jsonb_build_object(
        'user_email', u.email,
        'plan_type', s.plan_type,
        'days_until_expiry', EXTRACT(DAY FROM s.current_period_end - NOW())
      )
    )
  FROM subscriptions s
  JOIN users u ON s.user_id = u.id
  WHERE s.status = 'active' 
    AND s.current_period_end > NOW()
    AND s.current_period_end < NOW() + INTERVAL '7 days'

  UNION ALL

  -- Overall subscription distribution
  SELECT 
    'subscription_distribution'::text,
    COUNT(*),
    jsonb_build_object(
      'free', (SELECT COUNT(*) FROM subscriptions WHERE plan_type = 'free' AND status = 'active'),
      'starter', (SELECT COUNT(*) FROM subscriptions WHERE plan_type = 'starter' AND status = 'active'),
      'pro', (SELECT COUNT(*) FROM subscriptions WHERE plan_type = 'pro' AND status = 'active'),
      'expired', (SELECT COUNT(*) FROM subscriptions WHERE status = 'expired'),
      'canceled', (SELECT COUNT(*) FROM subscriptions WHERE status = 'canceled')
    )
  FROM subscriptions
  WHERE status = 'active'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually force downgrade a user (for admin use)
CREATE OR REPLACE FUNCTION force_downgrade_user(target_user_email text)
RETURNS TABLE (
  success boolean,
  message text,
  old_plan text,
  new_plan text
) AS $$
DECLARE
  user_record record;
  old_plan_type text;
BEGIN
  -- Find the user
  SELECT u.*, s.plan_type as current_plan
  INTO user_record
  FROM users u
  LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
  WHERE u.email = target_user_email;

  IF user_record.id IS NULL THEN
    RETURN QUERY SELECT false, 'User not found', null::text, null::text;
    RETURN;
  END IF;

  old_plan_type := COALESCE(user_record.current_plan, 'free');

  -- Expire current subscription if it exists
  UPDATE subscriptions 
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE user_id = user_record.id 
    AND status = 'active';

  -- Downgrade user to free
  UPDATE users 
  SET 
    is_premium = false,
    usage_limit = 5,
    usage_count = 0
  WHERE id = user_record.id;

  -- Create new free subscription
  INSERT INTO subscriptions (
    user_id, 
    plan_type, 
    status, 
    current_period_start, 
    current_period_end
  ) VALUES (
    user_record.id,
    'free',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
  );

  RETURN QUERY SELECT 
    true, 
    'User successfully downgraded to free plan', 
    old_plan_type, 
    'free'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add performance indexes (using IF NOT EXISTS to avoid conflicts)
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_period_end 
ON subscriptions(status, current_period_end);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
ON subscriptions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_users_premium_status 
ON users(is_premium, usage_limit);