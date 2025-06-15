# Setting Up Automatic Subscription Expiry

Your project has the SQL function `check_expired_subscriptions()` but it's not being called automatically. Here's how to set it up:

## Current Status ❌

- ✅ SQL function `check_expired_subscriptions()` exists
- ✅ Stripe webhook handlers exist
- ❌ **No scheduled job to run the SQL function**
- ❌ **No automatic cleanup of expired subscriptions**

## What Happens When Subscriptions Expire

### 1. Stripe Webhooks (Real-time) ✅
When Stripe processes subscription changes:
- `customer.subscription.deleted` → User downgraded to free
- `customer.subscription.updated` → Status updated in database
- `invoice.payment_failed` → Subscription marked as past due

### 2. SQL Function Fallback (Needs Setup) ❌
The `check_expired_subscriptions()` function handles edge cases:
- Missed webhooks
- Manual subscription changes
- Database inconsistencies

## Setup Options

### Option 1: GitHub Actions (Recommended)
Create `.github/workflows/scheduled-tasks.yml`:

```yaml
name: Scheduled Tasks
on:
  schedule:
    - cron: '0 2 * * *'  # Run daily at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  check-subscriptions:
    runs-on: ubuntu-latest
    steps:
      - name: Check Expired Subscriptions
        run: |
          curl -X POST "${{ secrets.SUPABASE_URL }}/functions/v1/check-expired-subscriptions" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

### Option 2: External Cron Service
Use services like:
- **Cron-job.org** (free)
- **EasyCron** 
- **Zapier** (scheduled zaps)

Set them to call:
```
POST https://your-project.supabase.co/functions/v1/scheduled-tasks
```

### Option 3: Supabase Cron (pg_cron extension)
Enable in Supabase Dashboard → Database → Extensions:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily check at 2 AM UTC
SELECT cron.schedule(
  'check-expired-subscriptions',
  '0 2 * * *',
  'SELECT check_expired_subscriptions();'
);
```

## Testing the Setup

### 1. Test the SQL Function
In Supabase SQL Editor:
```sql
SELECT check_expired_subscriptions();
```

### 2. Test the Edge Function
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/check-expired-subscriptions" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 3. Create Test Expired Subscription
```sql
-- Create a test expired subscription
INSERT INTO subscriptions (user_id, plan_type, status, current_period_end)
VALUES (
  (SELECT id FROM users LIMIT 1),
  'starter',
  'active',
  NOW() - INTERVAL '1 day'
);

-- Run the function
SELECT check_expired_subscriptions();

-- Check if it was updated
SELECT * FROM subscriptions WHERE status = 'expired';
```

## Monitoring

### 1. Check Logs
- Supabase Dashboard → Edge Functions → Logs
- Look for scheduled task execution

### 2. Database Queries
```sql
-- Check for expired subscriptions
SELECT 
  u.email,
  s.plan_type,
  s.status,
  s.current_period_end,
  s.updated_at
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.current_period_end < NOW()
ORDER BY s.current_period_end DESC;
```

### 3. User Status Verification
```sql
-- Verify users with expired subscriptions are on free plan
SELECT 
  u.email,
  u.is_premium,
  u.usage_limit,
  s.plan_type,
  s.status
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE s.current_period_end < NOW();
```

## Next Steps

1. **Choose a scheduling method** (GitHub Actions recommended)
2. **Set up the scheduled job** to call the Edge Function daily
3. **Test with a fake expired subscription**
4. **Monitor logs** to ensure it's working
5. **Set up alerts** for failed executions

## Important Notes

- The SQL function is **safe to run multiple times**
- It only affects **truly expired** subscriptions
- **Stripe webhooks handle 95%** of cases in real-time
- This is a **safety net** for edge cases
- Consider **time zones** when scheduling (UTC recommended)