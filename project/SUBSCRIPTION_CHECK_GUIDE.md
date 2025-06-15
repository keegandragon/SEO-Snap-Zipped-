# How to Check Your Subscription Status

## Step 1: Access Your Supabase Database
1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Navigate to "Table Editor" in the left sidebar

## Step 2: Check Your User Record
1. Click on the `users` table
2. Find your user record (look for your email address)
3. Check these fields:
   - `is_premium`: Should be `true` for Starter plan
   - `usage_limit`: Should be `50` for Starter plan
   - `usage_count`: Shows how many descriptions you've generated
   - `stripe_customer_id`: Should contain your Stripe customer ID if payment was processed

## Step 3: Check Your Subscription Record
1. Click on the `subscriptions` table
2. Look for a record where `user_id` matches your user ID from step 2
3. If you find a record, check:
   - `plan_type`: Should be `starter`
   - `status`: Should be `active`
   - `current_period_start` and `current_period_end`: Should show your billing period
   - `stripe_subscription_id`: Should contain your Stripe subscription ID

## Step 4: What the Results Mean

### If users table shows Starter plan BUT subscriptions table is empty:
- You ARE on the Starter plan (the app is working correctly)
- The Subscription Management page is empty because the detailed subscription record wasn't created
- This is a data sync issue, not a billing issue

### If both tables show Free plan:
- You may not actually be on a paid plan
- Check your Stripe dashboard to see if payment was processed
- Check your email for payment confirmations

### If users table shows Free but subscriptions table shows Starter:
- There's a sync issue between the tables
- Your access might be limited to Free plan features

## Step 5: Fix Missing Subscription Record (if needed)
If your `users` table shows Starter but `subscriptions` table is empty, you can manually create the missing record:

1. In the `subscriptions` table, click "Insert row"
2. Fill in:
   - `user_id`: Your user ID from the users table
   - `plan_type`: `starter`
   - `status`: `active`
   - `current_period_start`: Today's date
   - `current_period_end`: One month from today
   - `cancel_at_period_end`: `false`
3. Click "Save"

After this, refresh your app and the Subscription Management page should show your plan details.