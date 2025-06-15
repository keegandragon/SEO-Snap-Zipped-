import React, { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { createCheckoutSession } from '../services/stripeService';
import { useAuth } from '../context/AuthContext';

interface StripeCheckoutProps {
  planType: 'starter' | 'pro';
  priceId: string;
  planName: string;
  price: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  planType,
  priceId,
  planName,
  price,
  onSuccess,
  onError
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      onError?.('Please log in to subscribe');
      return;
    }

    setLoading(true);
    
    try {
      const { url } = await createCheckoutSession(priceId, user.id, planType);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
      onSuccess?.();
    } catch (error) {
      console.error('Checkout error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="btn btn-primary w-full flex items-center justify-center space-x-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Starting checkout...</span>
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          <span>Subscribe to {planName} - ${price}/month</span>
        </>
      )}
    </button>
  );
};

export default StripeCheckout;