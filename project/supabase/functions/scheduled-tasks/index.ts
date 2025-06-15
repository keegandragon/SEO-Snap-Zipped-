import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Verify the request is from a trusted source (optional but recommended)
    const authHeader = req.headers.get('Authorization');
    const expectedToken = Deno.env.get('CRON_SECRET_TOKEN');
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

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

    console.log('Running scheduled tasks...');

    // Task 1: Check expired subscriptions
    console.log('Checking expired subscriptions...');
    const { error: expiredError } = await supabase.rpc('check_expired_subscriptions');
    
    if (expiredError) {
      console.error('Error checking expired subscriptions:', expiredError);
    } else {
      console.log('✅ Expired subscriptions checked');
    }

    // Task 2: Clean up old data (optional)
    console.log('Cleaning up old uploads...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error: cleanupError } = await supabase
      .from('uploads')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (cleanupError) {
      console.error('Error cleaning up old uploads:', cleanupError);
    } else {
      console.log('✅ Old uploads cleaned up');
    }

    // Task 3: Update usage counts for new billing periods (reset monthly usage)
    console.log('Resetting monthly usage counts...');
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);

    // Only reset if it's the first day of the month
    if (new Date().getDate() === 1) {
      const { error: resetError } = await supabase
        .from('users')
        .update({ usage_count: 0 })
        .neq('usage_count', 0);

      if (resetError) {
        console.error('Error resetting usage counts:', resetError);
      } else {
        console.log('✅ Monthly usage counts reset');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scheduled tasks completed successfully',
        timestamp: new Date().toISOString(),
        tasks: [
          'check_expired_subscriptions',
          'cleanup_old_uploads',
          'reset_monthly_usage'
        ]
      }),
      {
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.error('Error in scheduled tasks:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to run scheduled tasks',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});