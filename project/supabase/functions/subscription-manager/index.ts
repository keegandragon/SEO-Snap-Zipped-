import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json'
};

interface SubscriptionUpdate {
  userId: string;
  oldPlan: string;
  newPlan: string;
  reason: string;
  processedAt: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });

    console.log('🔍 Starting comprehensive subscription expiry check...');

    // Step 1: Find all expired subscriptions
    const { data: expiredSubs, error: findError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan_type,
        status,
        current_period_end,
        stripe_subscription_id,
        users!inner(id, email, name, is_premium, usage_limit)
      `)
      .eq('status', 'active')
      .lt('current_period_end', new Date().toISOString());

    if (findError) {
      throw new Error(`Failed to find expired subscriptions: ${findError.message}`);
    }

    console.log(`📊 Found ${expiredSubs?.length || 0} expired subscriptions`);

    const updates: SubscriptionUpdate[] = [];
    let processedCount = 0;
    let errorCount = 0;

    if (expiredSubs && expiredSubs.length > 0) {
      for (const sub of expiredSubs) {
        try {
          console.log(`⏰ Processing expired subscription for user: ${sub.users.email}`);
          
          // Step 2: Update subscription status to expired
          const { error: subUpdateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'expired',
              updated_at: new Date().toISOString()
            })
            .eq('id', sub.id);

          if (subUpdateError) {
            throw new Error(`Failed to update subscription: ${subUpdateError.message}`);
          }

          // Step 3: Downgrade user to free plan
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({
              is_premium: false,
              usage_limit: 5,
              // Reset usage count at the start of new billing period
              usage_count: 0
            })
            .eq('id', sub.user_id);

          if (userUpdateError) {
            throw new Error(`Failed to update user: ${userUpdateError.message}`);
          }

          // Step 4: Create new free subscription
          const { error: newSubError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: sub.user_id,
              plan_type: 'free',
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
              cancel_at_period_end: false,
              canceled_at: null
            });

          if (newSubError) {
            throw new Error(`Failed to create free subscription: ${newSubError.message}`);
          }

          updates.push({
            userId: sub.user_id,
            oldPlan: sub.plan_type,
            newPlan: 'free',
            reason: 'subscription_expired',
            processedAt: new Date().toISOString()
          });

          processedCount++;
          console.log(`✅ Successfully downgraded ${sub.users.email} from ${sub.plan_type} to free`);

        } catch (error) {
          errorCount++;
          console.error(`❌ Error processing subscription for user ${sub.user_id}:`, error);
        }
      }
    }

    // Step 5: Check for users with inconsistent states (premium users with free subscriptions)
    console.log('🔍 Checking for inconsistent user states...');
    
    const { data: inconsistentUsers, error: inconsistentError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        is_premium,
        usage_limit,
        subscriptions!inner(plan_type, status)
      `)
      .eq('is_premium', true)
      .eq('subscriptions.plan_type', 'free')
      .eq('subscriptions.status', 'active');

    if (inconsistentError) {
      console.error('Error checking inconsistent states:', inconsistentError);
    } else if (inconsistentUsers && inconsistentUsers.length > 0) {
      console.log(`🔧 Found ${inconsistentUsers.length} users with inconsistent states, fixing...`);
      
      for (const user of inconsistentUsers) {
        try {
          const { error: fixError } = await supabase
            .from('users')
            .update({
              is_premium: false,
              usage_limit: 5
            })
            .eq('id', user.id);

          if (!fixError) {
            console.log(`✅ Fixed inconsistent state for user: ${user.email}`);
            processedCount++;
          }
        } catch (error) {
          console.error(`❌ Error fixing user state for ${user.id}:`, error);
          errorCount++;
        }
      }
    }

    // Step 6: Log summary
    console.log(`📈 Subscription expiry check completed:`);
    console.log(`   - Processed: ${processedCount} subscriptions`);
    console.log(`   - Errors: ${errorCount}`);
    console.log(`   - Updates: ${updates.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription expiry check completed',
        summary: {
          totalExpired: expiredSubs?.length || 0,
          processed: processedCount,
          errors: errorCount,
          updates: updates
        },
        timestamp: new Date().toISOString()
      }),
      {
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.error('❌ Critical error in subscription manager:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process subscription expiry',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});