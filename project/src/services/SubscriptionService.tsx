// src/services/SubscriptionService.tsx

interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  planType: string;
  successUrl?: string;
  cancelUrl?: string;
  jwt: string; // The user's JWT/access token for authorization
}

interface CheckoutSessionResult {
  success: boolean;
  data?: {
    url: string;
  };
  error?: string;
}

/**
 * Initiates a Stripe Checkout Session for a given price.
 * Calls the Supabase Edge Function to create the session.
 * @param params - Contains priceId, userId, planType, successUrl, cancelUrl, jwt.
 * @returns The checkout session result with URL or error.
 */
export const createStripeCheckoutSession = async (params: CreateCheckoutSessionParams): Promise<CheckoutSessionResult> => {
  const { priceId, userId, planType, successUrl, cancelUrl, jwt } = params;

  // Use environment variable for Supabase URL - this should be automatically set to your project's URL
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  
  if (!SUPABASE_URL) {
    return {
      success: false,
      error: 'VITE_SUPABASE_URL environment variable is not set'
    };
  }
  
  // Construct the exact Edge Function URL
  const SUPABASE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-checkout-session`;

  console.log('Calling Edge Function at URL:', SUPABASE_FUNCTION_URL);
  console.log('Request payload:', { priceId, userId, planType, successUrl, cancelUrl });

  try {
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`, // Pass JWT for authentication in Edge Function
      },
      body: JSON.stringify({
        priceId: priceId, // Pass the Stripe Price ID directly
        userId: userId,
        planType: planType,
        successUrl: successUrl || `${window.location.origin}/dashboard?payment=success`,
        cancelUrl: cancelUrl || `${window.location.origin}/plans?payment=cancelled`,
      }),
    });

    console.log('Edge Function response status:', response.status);
    console.log('Edge Function response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Function error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      console.error('Error creating checkout session from Edge Function:', errorData);
      return {
        success: false,
        error: errorData.error || `Edge Function returned status ${response.status}`
      };
    }

    const data = await response.json();
    console.log('Edge Function success response:', data);
    
    if (data.url) {
      return {
        success: true,
        data: { url: data.url }
      };
    } else {
      return {
        success: false,
        error: 'No checkout URL received from Edge Function.'
      };
    }
  } catch (err: any) {
    console.error('Network or unexpected error in createStripeCheckoutSession:', err);
    
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error: Unable to connect to Edge Function. Please check your internet connection.'
      };
    }
    
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during checkout initiation.'
    };
  }
};