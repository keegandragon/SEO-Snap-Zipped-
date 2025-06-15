import Stripe from 'npm:stripe@14.15.0';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

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
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });

    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('Missing Stripe signature');
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log('Processing webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, stripe, session);
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(supabase, invoice);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Webhook processing failed',
        success: false
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});

async function handleCheckoutCompleted(supabase: any, stripe: Stripe, session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id || session.client_reference_id;
  const planType = session.metadata?.plan_type;
  
  if (!userId || !planType) {
    console.error('Missing user_id or plan_type in session metadata');
    return;
  }

  console.log(`Processing checkout completion for user ${userId}, plan: ${planType}`);

  // Handle subscription creation
  if (session.mode === 'subscription' && session.subscription) {
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;
    
    // Get the full subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price']
    });
    
    // Extract price ID from the subscription
    const priceId = stripeSubscription.items.data[0]?.price?.id;
    
    // Update user's subscription in database
    const usageLimit = planType === 'starter' ? 50 : planType === 'pro' ? 200 : 5;
    
    const { error: userError } = await supabase
      .from('users')
      .update({
        is_premium: planType !== 'free',
        usage_limit: usageLimit,
        stripe_customer_id: customerId,
      })
      .eq('id', userId);

    if (userError) {
      console.error('Error updating user:', userError);
    }

    // Create or update subscription record with complete information
    const { data: existingSub, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching existing subscription:', fetchError);
    }

    const subscriptionData = {
      user_id: userId,
      plan_type: planType,
      status: 'active',
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      canceled_at: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : null,
    };

    if (existingSub) {
      // Update existing subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existingSub.id);

      if (subError) {
        console.error('Error updating subscription:', subError);
      }
    } else {
      // Create new subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData);

      if (subError) {
        console.error('Error creating subscription:', subError);
      }
    }

    console.log(`Subscription processed for user ${userId}, plan: ${planType}, price: ${priceId}`);
  }
  
  // Handle one-time payments
  else if (session.mode === 'payment' && session.payment_intent) {
    console.log(`One-time payment processed for user ${userId}`);
    // Add any one-time payment logic here if needed
  }
}

async function handleSubscriptionUpdated(supabase: any, subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  const planType = subscription.metadata?.plan_type;
  
  if (!userId) {
    console.error('Missing user_id in subscription metadata');
    return;
  }

  const status = subscription.status === 'active' ? 'active' : 
                subscription.status === 'canceled' ? 'canceled' : 'expired';

  // Extract price ID from the subscription
  const priceId = subscription.items.data[0]?.price?.id;

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status,
      stripe_price_id: priceId,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      stripe_subscription_id: subscription.id,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating subscription:', error);
  }

  // Update user premium status based on subscription status
  if (status === 'active' && planType) {
    const usageLimit = planType === 'starter' ? 50 : planType === 'pro' ? 200 : 5;
    
    const { error: userError } = await supabase
      .from('users')
      .update({
        is_premium: planType !== 'free',
        usage_limit: usageLimit,
      })
      .eq('id', userId);

    if (userError) {
      console.error('Error updating user premium status:', userError);
    }
  }

  console.log(`Subscription updated for user ${userId}, status: ${status}, price: ${priceId}`);
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  
  if (!userId) {
    console.error('Missing user_id in subscription metadata');
    return;
  }

  // Revert user to free plan
  const { error: userError } = await supabase
    .from('users')
    .update({
      is_premium: false,
      usage_limit: 5,
    })
    .eq('id', userId);

  if (userError) {
    console.error('Error updating user to free plan:', userError);
  }

  // Update subscription status
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      plan_type: 'free',
      canceled_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (subError) {
    console.error('Error updating subscription status:', subError);
  }

  console.log(`Subscription deleted for user ${userId}, reverted to free plan`);
}

async function handlePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  console.log(`Payment succeeded for invoice ${invoice.id}`);
  
  // Get subscription info from invoice
  if (invoice.subscription) {
    const subscriptionId = invoice.subscription as string;
    
    // Update subscription status to active if it was past due
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Error updating subscription after payment success:', error);
    }
  }
}

async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice ${invoice.id}`);
  
  // Get subscription info from invoice
  if (invoice.subscription) {
    const subscriptionId = invoice.subscription as string;
    
    // You might want to update subscription status or send notifications
    // For now, just log the failure
    console.log(`Payment failed for subscription ${subscriptionId}`);
  }
}