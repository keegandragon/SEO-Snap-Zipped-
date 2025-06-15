# Testing Subscription Expiry System

This guide helps you test the automatic subscription expiry system to ensure it works correctly.

## 1. Create Test Data

### Create a Test User with Expired Subscription

```sql
-- 1. Create a test user (or use existing)
INSERT INTO users (id, auth_id, email, name, is_premium, usage_limit, usage_count)
VALUES (
  gen_random_uuid(),
  gen_random_uuid(), -- fake auth_id for testing
  'test-expired@example.com',
  'Test Expired User',
  true,
  50, -- starter plan
  10
) 
ON CONFLICT (email) DO UPDATE SET
  is_premium = true,
  usage_limit = 50,
  usage_count = 10
RETURNING id;

-- 2. Create an expired subscription for this user
INSERT INTO subscriptions (
  user_id,
  plan_type,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end
)
SELECT 
  u.id,
  'starter',
  'active',
  NOW() - INTERVAL '1 month',
  NOW() - INTERVAL '1 day', -- expired yesterday
  false
FROM users u 
WHERE u.email = 'test-expired@example.com';
```

### Create a Test User with Soon-to-Expire Subscription

```sql
-- Create a subscription expiring in 2 days
INSERT INTO subscriptions (
  user_id,
  plan_type,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end
)
SELECT 
  u.id,
  'pro',
  'active',
  NOW() - INTERVAL '28 days',
  NOW() + INTERVAL '2 days', -- expires in 2 days
  false
FROM users u 
WHERE u.email = 'test-expired@example.com';
```

## 2. Check Current State

### View All Test Subscriptions
```sql
SELECT * FROM subscription_overview 
WHERE email LIKE '%test%' 
ORDER BY current_period_end;
```

### Check for Overdue Subscriptions
```sql
SELECT * FROM get_expired_subscriptions();
```

### Get Subscription Statistics
```sql
SELECT * FROM get_subscription_stats();
```

## 3. Test the SQL Function

### Run the Cleanup Function
```sql
-- This should find and fix expired subscriptions
SELECT check_expired_subscriptions();
```

### Verify the Results
```sql
-- Check if expired subscription was cleaned up
SELECT 
  u.email,
  u.is_premium,
  u.usage_limit,
  s.plan_type,
  s.status,
  s.current_period_end
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE u.email = 'test-expired@example.com'
ORDER BY s.created_at DESC;
```

**Expected Results:**
- User should have `is_premium = false`
- User should have `usage_limit = 5`
- Old subscription should have `status = 'expired'`
- New subscription should have `plan_type = 'free'` and `status = 'active'`

## 4. Test the Edge Function

### Test via HTTP Request
```bash
# Replace with your actual Supabase URL and service role key
curl -X POST "https://your-project.supabase.co/functions/v1/check-expired-subscriptions" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test the Scheduled Tasks Function
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/scheduled-tasks" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"source": "manual_test"}'
```

## 5. Test GitHub Actions (if set up)

### Manual Trigger
1. Go to your GitHub repository
2. Click **Actions** tab
3. Click **Scheduled Tasks - Check Expired Subscriptions**
4. Click **Run workflow** → **Run workflow**
5. Wait for completion and check logs

### Check Logs
Look for these log messages:
- ✅ "Expired subscriptions checked"
- ✅ "Old uploads cleaned up"
- ✅ "Scheduled tasks completed successfully"

## 6. Test Edge Cases

### Test Multiple Expired Subscriptions
```sql
-- Create multiple expired subscriptions
INSERT INTO users (id, auth_id, email, name, is_premium, usage_limit)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'test1@example.com', 'Test User 1', true, 50),
  (gen_random_uuid(), gen_random_uuid(), 'test2@example.com', 'Test User 2', true, 200),
  (gen_random_uuid(), gen_random_uuid(), 'test3@example.com', 'Test User 3', true, 50);

-- Create expired subscriptions for all test users
INSERT INTO subscriptions (user_id, plan_type, status, current_period_end)
SELECT 
  u.id,
  CASE 
    WHEN u.usage_limit = 50 THEN 'starter'
    WHEN u.usage_limit = 200 THEN 'pro'
    ELSE 'free'
  END,
  'active',
  NOW() - INTERVAL '1 day'
FROM users u 
WHERE u.email LIKE 'test%@example.com';
```

### Run Cleanup and Verify
```sql
-- Run cleanup
SELECT check_expired_subscriptions();

-- Verify all users are now on free plan
SELECT 
  email,
  is_premium,
  usage_limit,
  (SELECT plan_type FROM subscriptions WHERE user_id = u.id AND status = 'active') as current_plan
FROM users u
WHERE email LIKE 'test%@example.com';
```

## 7. Performance Testing

### Test with Large Dataset
```sql
-- Check how long the function takes with current data
EXPLAIN ANALYZE SELECT check_expired_subscriptions();

-- Check subscription query performance
EXPLAIN ANALYZE 
SELECT * FROM subscriptions 
WHERE current_period_end < NOW() AND status = 'active';
```

## 8. Cleanup Test Data

### Remove Test Users and Subscriptions
```sql
-- Delete test subscriptions
DELETE FROM subscriptions 
WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE 'test%@example.com'
);

-- Delete test users
DELETE FROM users WHERE email LIKE 'test%@example.com';
```

## 9. Monitoring Queries

### Daily Health Check
```sql
-- Run this daily to monitor subscription health
SELECT 
  'Overdue Subscriptions' as metric,
  COUNT(*) as count
FROM subscriptions 
WHERE current_period_end < NOW() AND status = 'active'

UNION ALL

SELECT 
  'Expiring Soon (7 days)' as metric,
  COUNT(*) as count
FROM subscriptions 
WHERE current_period_end < NOW() + INTERVAL '7 days' 
  AND current_period_end > NOW()
  AND status = 'active'

UNION ALL

SELECT 
  'Premium Users with Free Subscriptions' as metric,
  COUNT(*) as count
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE u.is_premium = true 
  AND s.plan_type = 'free' 
  AND s.status = 'active';
```

## Expected Behavior

✅ **What Should Happen:**
1. Expired subscriptions get `status = 'expired'`
2. Users get `is_premium = false` and `usage_limit = 5`
3. New free subscriptions are created
4. No data is lost, just status changes

❌ **What Should NOT Happen:**
1. Active subscriptions should not be affected
2. User data should not be deleted
3. No duplicate subscriptions for the same user

## Troubleshooting

### Common Issues:
1. **Function doesn't run:** Check GitHub secrets and Edge Function logs
2. **No changes made:** Verify there are actually expired subscriptions
3. **Permissions error:** Ensure service role key is correct
4. **Timeout:** Function might need optimization for large datasets

### Debug Queries:
```sql
-- Find subscriptions that should be expired but aren't
SELECT * FROM subscription_overview WHERE alert_status = 'OVERDUE';

-- Check for inconsistent user/subscription data
SELECT 
  u.email,
  u.is_premium,
  u.usage_limit,
  s.plan_type,
  s.status
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE (u.is_premium = true AND s.plan_type = 'free')
   OR (u.is_premium = false AND s.plan_type != 'free' AND s.status = 'active');
```