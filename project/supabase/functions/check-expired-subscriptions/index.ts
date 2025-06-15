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

    console.log('Starting expired subscription check...');

    // Call the SQL function to check and update expired subscriptions
    const { data, error } = await supabase.rpc('check_expired_subscriptions');

    if (error) {
      console.error('Error checking expired subscriptions:', error);
      throw error;
    }

    console.log('Expired subscription check completed successfully');

    // Get count of affected users for logging
    const { data: expiredCount, error: countError } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact' })
      .eq('status', 'expired');

    if (countError) {
      console.error('Error getting expired count:', countError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Expired subscriptions checked and updated',
        expiredSubscriptions: expiredCount || 0,
        timestamp: new Date().toISOString()
      }),
      {
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.error('Error in check-expired-subscriptions function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to check expired subscriptions',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});