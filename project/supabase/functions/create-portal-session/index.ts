import Stripe from 'npm:stripe@14.15.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const { customerId, returnUrl } = await req.json();

    if (!customerId || !returnUrl) {
      throw new Error('Missing required parameters');
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.error('Error creating portal session:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create portal session',
        success: false
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});