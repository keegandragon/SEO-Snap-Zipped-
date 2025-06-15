console.log('--- create-checkout-session function file started loading ---');

import Stripe from 'https://esm.sh/stripe@16.0.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json'
};

Deno.serve(async (req) => {
  console.log('--- Edge function handler invoked ---');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log('Processing POST request...');
    
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY environment variable not found');
      return new Response(
        JSON.stringify({ 
          error: 'Stripe configuration missing - STRIPE_SECRET_KEY not found',
          success: false
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    console.log('Initializing Stripe with key prefix:', stripeSecretKey.substring(0, 7) + '...');
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const requestBody = await req.json();
    console.log('Request body received:', { 
      priceId: requestBody.priceId || 'missing',
      userId: requestBody.userId ? '[REDACTED]' : 'missing',
      planType: requestBody.planType || 'missing'
    });

    const { priceId, userId, planType, successUrl, cancelUrl } = requestBody;

    if (!priceId || !userId || !planType) {
      const missingFields = [];
      if (!priceId) missingFields.push('priceId');
      if (!userId) missingFields.push('userId');
      if (!planType) missingFields.push('planType');
      
      console.error('Missing required parameters:', missingFields);
      return new Response(
        JSON.stringify({ 
          error: `Missing required parameters: ${missingFields.join(', ')}`,
          success: false
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Create or retrieve customer with simplified logic
    let customer;
    try {
      console.log('Searching for existing customer with user_id:', userId);
      
      // Try to find existing customer by metadata
      const customers = await stripe.customers.list({
        metadata: { user_id: userId },
        limit: 1,
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log('Using existing customer:', customer.id);
      } else {
        // Create new customer with minimal required data
        console.log('Creating new customer for user_id:', userId);
        customer = await stripe.customers.create({
          metadata: { user_id: userId },
        });
        console.log('Created new customer:', customer.id);
      }
    } catch (stripeError) {
      console.error('Stripe customer operation failed:', {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code,
        statusCode: stripeError.statusCode,
        requestId: stripeError.requestId
      });
      
      return new Response(
        JSON.stringify({ 
          error: `Stripe customer error: ${stripeError.message}`,
          type: stripeError.type,
          code: stripeError.code,
          success: false
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Create checkout session
    try {
      console.log('Creating checkout session for customer:', customer.id);
      
      const sessionParams = {
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl || `${req.headers.get('origin') || 'http://localhost:5173'}/dashboard?success=true`,
        cancel_url: cancelUrl || `${req.headers.get('origin') || 'http://localhost:5173'}/plans?canceled=true`,
        subscription_data: {
          metadata: {
            user_id: userId,
            plan_type: planType,
          },
        },
      };

      console.log('Checkout session parameters:', {
        customer: customer.id,
        priceId,
        mode: 'subscription',
        success_url: sessionParams.success_url,
        cancel_url: sessionParams.cancel_url
      });

      const session = await stripe.checkout.sessions.create(sessionParams);

      console.log('Checkout session created successfully:', session.id);

      return new Response(
        JSON.stringify({ 
          url: session.url,
          sessionId: session.id,
          success: true
        }),
        {
          headers: corsHeaders,
        }
      );

    } catch (stripeError) {
      console.error('Stripe checkout session creation failed:', {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code,
        statusCode: stripeError.statusCode,
        requestId: stripeError.requestId
      });
      
      return new Response(
        JSON.stringify({ 
          error: `Checkout session error: ${stripeError.message}`,
          type: stripeError.type,
          code: stripeError.code,
          success: false
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

  } catch (error) {
    console.error('Edge function error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(
      JSON.stringify({ 
        error: `Function error: ${error.message}`,
        success: false
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});