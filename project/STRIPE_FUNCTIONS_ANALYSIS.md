# Stripe Functions Analysis

## Currently Active Functions (KEEP THESE):

### 1. `/supabase/functions/create-checkout-session/index.ts` ✅ MAIN FUNCTION
- **Purpose**: Creates Stripe checkout sessions for subscriptions
- **Used by**: Plans.tsx, Premium.tsx, SubscriptionService.tsx
- **Status**: This is the PRIMARY function being called
- **Keep**: YES - This is your main checkout function

### 2. `/supabase/functions/stripe-webhook/index.ts` ✅ WEBHOOK HANDLER
- **Purpose**: Handles Stripe webhooks (payment success, subscription updates)
- **Used by**: Stripe sends webhooks here automatically
- **Status**: Essential for processing payments
- **Keep**: YES - Required for payment processing

## Secondary Functions (KEEP BUT NOT DIRECTLY USED):

### 3. `/supabase/functions/create-portal-session/index.ts` ✅ PORTAL
- **Purpose**: Creates customer portal sessions for subscription management
- **Used by**: Could be used for subscription management
- **Status**: Useful but not currently called
- **Keep**: YES - Useful for customer self-service

### 4. `/supabase/functions/get-stripe-products/index.ts` ✅ PRODUCTS
- **Purpose**: Fetches products/prices from Stripe API
- **Used by**: Could be used to sync Stripe data
- **Status**: Useful but not currently called
- **Keep**: YES - Useful for data sync

## Conflicting/Duplicate Services (REMOVE THESE):

### 5. `/src/services/stripeService.ts` ❌ DUPLICATE
- **Purpose**: Frontend Stripe service (duplicates Edge Function calls)
- **Problem**: Conflicts with SubscriptionService.tsx
- **Action**: REMOVE - Use SubscriptionService.tsx instead

### 6. `/src/services/SubscriptionService.tsx` ✅ FRONTEND SERVICE
- **Purpose**: Frontend service that calls the Edge Functions
- **Status**: This is what Plans.tsx should use
- **Keep**: YES - This is your frontend interface

## Current Problem:

Your `Plans.tsx` is using `createStripeCheckoutSession` from `/src/services/SubscriptionService.tsx`, which calls the Edge Function at `/supabase/functions/create-checkout-session/index.ts`.

The error "Edge Function returned a non-2xx status code" means the Edge Function is failing, likely due to invalid Stripe Price IDs in your database.

## Recommendation:

1. **REMOVE**: `/src/services/stripeService.ts` (duplicate/conflicting)
2. **KEEP**: All Edge Functions (they're all useful)
3. **KEEP**: `/src/services/SubscriptionService.tsx` (frontend interface)
4. **FIX**: The Stripe Price IDs in your database (use Stripe Debugger)