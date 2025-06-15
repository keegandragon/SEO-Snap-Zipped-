/*
  # Update Stripe Price IDs with Real Values

  1. Changes
    - Update existing sample price IDs with real Stripe Price IDs
    - Ensure product mappings are correct
    - Update metadata if needed

  2. Instructions
    - Replace the price IDs below with your actual Stripe Price IDs
    - Make sure the product_id matches your products
*/

-- First, let's see what we currently have
-- You can run this query in your Supabase SQL editor to see current data:
-- SELECT * FROM stripe_prices ORDER BY product_id, recurring_interval;

-- Update with your actual Stripe Price IDs
-- REPLACE THESE WITH YOUR REAL STRIPE PRICE IDs FROM YOUR STRIPE DASHBOARD

-- Update Starter Plan Prices
UPDATE stripe_prices 
SET id = 'prod_SSNJ8rpsJdctIK'  -- Replace with your real price ID
WHERE id = '$9.99';

UPDATE stripe_prices 
SET id = 'prod_SSXQy1zPXMhtMG'   -- Replace with your real price ID
WHERE id = '$99.99';

-- Update Pro Plan Prices  
UPDATE stripe_prices 
SET id = 'prod_SSXNFyOnzEKr2Q'      -- Replace with your real price ID
WHERE id = '$19.99';

UPDATE stripe_prices 
SET id = 'prod_SSXRP84gj6oNpD'       -- Replace with your real price ID
WHERE id = '$199.99';

-- Optional: Update product IDs if they're different
-- UPDATE stripe_products SET id = 'prod_YOUR_ACTUAL_STARTER_PRODUCT_ID' WHERE id = 'prod_starter';
-- UPDATE stripe_products SET id = 'prod_YOUR_ACTUAL_PRO_PRODUCT_ID' WHERE id = 'prod_pro';

-- Verify the updates
SELECT 
  sp.id as price_id,
  sp.unit_amount,
  sp.recurring_interval,
  spr.name as product_name
FROM stripe_prices sp
JOIN stripe_products spr ON sp.product_id = spr.id
ORDER BY spr.name, sp.recurring_interval;