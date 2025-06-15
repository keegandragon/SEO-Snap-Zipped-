import Stripe from 'npm:stripe@14.15.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    // Get all products
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    // Get all prices
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
    });

    return new Response(
      JSON.stringify({
        products: products.data,
        prices: prices.data,
      }),
      {
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch products',
        success: false
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});