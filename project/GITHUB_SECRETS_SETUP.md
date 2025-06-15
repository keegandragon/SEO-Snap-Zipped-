# GitHub Secrets Setup for Scheduled Tasks

To enable automatic subscription expiry checking, you need to set up GitHub repository secrets.

## Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### 1. SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** Your Supabase project URL
- **Example:** `https://your-project-id.supabase.co`
- **Where to find:** Supabase Dashboard → Settings → API

### 2. SUPABASE_SERVICE_ROLE_KEY
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Your Supabase service role key (secret key)
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find:** Supabase Dashboard → Settings → API → service_role (secret)
- **⚠️ IMPORTANT:** This is a secret key - never expose it publicly

### 3. CRON_SECRET_TOKEN (Optional but Recommended)
- **Name:** `CRON_SECRET_TOKEN`
- **Value:** A random secret token you generate
- **Example:** `your-random-secret-token-here-123456`
- **Purpose:** Prevents unauthorized calls to your scheduled tasks endpoint

## How to Generate CRON_SECRET_TOKEN

```bash
# Option 1: Use openssl (if available)
openssl rand -hex 32

# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Use online generator
# Visit: https://www.uuidgenerator.net/
```

## Setting Up the Secrets

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**
5. Add each secret one by one:

```
Name: SUPABASE_URL
Value: https://your-project-id.supabase.co

Name: SUPABASE_SERVICE_ROLE_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Name: CRON_SECRET_TOKEN
Value: your-generated-random-token
```

## Testing the Setup

### 1. Manual Trigger
- Go to GitHub → Actions tab
- Click "Scheduled Tasks - Check Expired Subscriptions"
- Click "Run workflow" → "Run workflow"
- Check the logs to see if it runs successfully

### 2. Check Supabase Logs
- Go to Supabase Dashboard → Edge Functions
- Look for logs from `scheduled-tasks` function
- Should see successful execution logs

### 3. Verify Database Changes
Run this query in Supabase SQL Editor:
```sql
-- Check for any expired subscriptions that should be cleaned up
SELECT 
  u.email,
  s.plan_type,
  s.status,
  s.current_period_end,
  CASE 
    WHEN s.current_period_end < NOW() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as should_be_status
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.current_period_end < NOW()
   OR s.status = 'expired';
```

## Alternative: External Cron Service

If you prefer not to use GitHub Actions, you can use external services:

### Cron-job.org (Free)
1. Go to https://cron-job.org
2. Create account
3. Add new cron job:
   - **URL:** `https://your-project.supabase.co/functions/v1/scheduled-tasks`
   - **Schedule:** Daily at 2 AM
   - **HTTP Method:** POST
   - **Headers:** 
     ```
     Authorization: Bearer YOUR_SERVICE_ROLE_KEY
     Content-Type: application/json
     X-Cron-Secret: YOUR_SECRET_TOKEN
     ```

### EasyCron
1. Go to https://www.easycron.com
2. Similar setup as above

## Security Notes

- **Never commit secrets** to your repository
- **Use service role key** for server-side operations
- **Set up the secret token** to prevent unauthorized access
- **Monitor logs** regularly to ensure tasks are running
- **Test thoroughly** before relying on automated cleanup

## Troubleshooting

### Common Issues:
1. **401 Unauthorized:** Check your service role key
2. **404 Not Found:** Verify your Supabase URL
3. **Function timeout:** Edge function might need optimization
4. **No changes:** Check if there are actually expired subscriptions

### Debug Commands:
```bash
# Test the endpoint manually
curl -X POST "https://your-project.supabase.co/functions/v1/scheduled-tasks" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```