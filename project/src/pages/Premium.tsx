import { Link } from 'react-router-dom';
import { Check, Zap, Crown, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Define types for the data fetched from Supabase
interface StripePrice {
  id: string; // Stripe Price ID (e.g., price_xyz)
  product_id: string;
  active: boolean;
  currency: string;
  unit_amount: number | null; // in cents
  recurring_interval: 'day' | 'week' | 'month' | 'year' | null;
  recurring_interval_count: number | null;
  type: 'one_time' | 'recurring';
  product: { // This comes from the `product:` select
    id: string; // Stripe Product ID (e.g., prod_xyz)
    name: string;
    description: string | null;
    image: string | null;
    metadata: { [key: string]: any } | null;
  };
}

const Premium = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedPlans, setFetchedPlans] = useState<StripePrice[]>([]);
  const [userSubscription, setUserSubscription] = useState<any | null>(null);

  // Fetch plans (products/prices) from Supabase
  useEffect(() => {
    const fetchPlansAndSubscription = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch active prices along with their associated product details
        const { data: prices, error: pricesError } = await supabase
          .from('stripe_prices')
          .select('*, product:stripe_products(*)') // Joins prices with products
          .eq('active', true) // Only fetch active prices
          .order('unit_amount', { ascending: true }); // Order by price for display

        if (pricesError) throw pricesError;

        setFetchedPlans(prices as StripePrice[]);

        // Fetch user's current subscription
        if (user) {
          const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

          if (subError) throw subError;
          setUserSubscription(subscription);
        }

      } catch (err: any) {
        console.error('Error fetching plans or subscription:', err.message);
        setError('Failed to load plans or subscription status. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlansAndSubscription();
  }, [user]);

  // Helper function to determine current plan based on user data
  const getCurrentPlanFromUser = () => {
    if (!user) return null;
    
    // Check user's current plan based on their usage limit and premium status
    if (!user.isPremium && user.usageLimit === 5) {
      return 'free';
    } else if (user.isPremium && user.usageLimit === 50) {
      return 'starter';
    } else if (user.isPremium && user.usageLimit === 200) {
      return 'pro';
    }
    
    return 'free'; // Default fallback
  };

  // Map fetched data to your existing plans structure
  const plans = fetchedPlans
    .filter(price => {
      // Filter based on the selected billing cycle
      return price.recurring_interval === (billingCycle === 'monthly' ? 'month' : 'year');
    })
    .map(price => {
      const displayPrice = price.unit_amount ? price.unit_amount / 100 : 0;
      let planName = price.product.name;
      let description = price.product.description || '';
      let features: string[] = [];

      // Feature mapping based on product name
      if (planName.toLowerCase().includes('starter')) {
        features = [
          '50 generations per month', 'Advanced SEO optimization', '10 SEO tags per product',
          'Long-form descriptions', 'Priority processing', 'Email support'
        ];
      } else if (planName.toLowerCase().includes('pro')) {
        features = [
          '200 generations per month', 'Premium SEO optimization', '15 SEO tags per product',
          'Long-form descriptions', 'Priority processing', 'Export to CSV'
        ];
      }

      // Determine if this is the user's current plan based on their actual plan type
      const userCurrentPlan = getCurrentPlanFromUser();
      let planType = 'starter';
      if (planName.toLowerCase().includes('pro')) {
        planType = 'pro';
      }
      const isCurrent = user && userCurrentPlan === planType;

      return {
        name: planName,
        stripePriceId: price.id,
        price: displayPrice,
        description: description,
        features: features,
        popular: price.product.metadata?.popular === 'true',
        current: isCurrent,
        isRecurring: price.type === 'recurring',
        planType: planType as 'starter' | 'pro'
      };
    });

  // Add the Free plan manually since it's not a Stripe product
  const userCurrentPlan = getCurrentPlanFromUser();
  const freePlan = {
    name: 'Free',
    price: 0,
    description: 'Perfect for trying out our service',
    features: [
      '5 generations per month', 'Basic SEO optimization', '5 SEO tags per product',
      'Copy to clipboard', 'Email sharing'
    ],
    planType: 'free' as const,
    popular: false,
    current: user && userCurrentPlan === 'free',
    isRecurring: false,
    stripePriceId: null
  };

  const finalPlans = [freePlan, ...plans];

  // Function to handle the actual checkout
  const handleCheckout = async (priceId: string | null) => {
    if (!user || !user.id) {
      alert('Please log in to subscribe or refresh your session.');
      return;
    }
    if (!priceId) {
        alert('Cannot initiate checkout for this plan.');
        return;
    }

    try {
      // Get the user's JWT token from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('Please log in again to continue.');
        return;
      }

      // Call the Supabase Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: priceId,
          userId: user.id,
          planType: priceId.includes('starter') ? 'starter' : 'pro',
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/plans?payment=cancelled`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Error in handleCheckout:', err.message);
      alert(err.message || 'Failed to start checkout process');
    }
  };

  // Calculate savings percentage for yearly plans
  const getSavingsPercentage = () => {
    return 17; // Your yearly plans save 17%
  };

  // Calculate monthly equivalent for yearly plans
  const getMonthlyEquivalent = (yearlyPrice: number) => {
    return yearlyPrice / 12;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Plans</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 btn btn-outline text-red-600 border-red-300 hover:bg-red-50"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlan = finalPlans.find(plan => plan.current);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">
          Our Premium Plans
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Unlock more features and boost your productivity with our premium offerings.
        </p>

        {/* Show current plan indicator */}
        {user && currentPlan && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-800 rounded-full text-sm font-medium">
              <Crown className="h-4 w-4 mr-2" />
              Currently on {currentPlan.name} Plan
            </div>
          </div>
        )}

        <div className="flex justify-center mb-12">
          <div className="bg-white p-2 rounded-full shadow-lg flex space-x-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`py-2 px-6 rounded-full text-lg font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`py-2 px-6 rounded-full text-lg font-medium transition-colors relative ${
                billingCycle === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Yearly 
              <span className="ml-2 text-green-300 font-bold">Save {getSavingsPercentage()}%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {finalPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-xl shadow-lg p-8 flex flex-col transition-all duration-300 ${
                plan.popular ? 'border-4 border-indigo-500 scale-105' : 'border border-gray-200'
              } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Popular
                </div>
              )}
              {plan.current && (
                <div className="absolute top-0 left-0 -mt-4 -ml-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Current
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h2>
              <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
              
              {/* Pricing Section - Fixed Height */}
              <div className="mb-8 min-h-[120px] flex flex-col justify-center">
                {plan.price === 0 ? (
                  <div className="text-center">
                    <span className="text-5xl font-extrabold text-gray-900">Free</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-extrabold text-gray-900">
                        ${plan.price.toFixed(2)}
                      </span>
                      <span className="text-gray-600 text-lg font-medium ml-1">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    
                    {billingCycle === 'yearly' && plan.price > 0 && (
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">
                          ${getMonthlyEquivalent(plan.price).toFixed(2)}/month when billed yearly
                        </div>
                        <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          Save {getSavingsPercentage()}%
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <ul className="space-y-4 flex-grow mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto">
                {plan.current ? (
                  <button
                    className="w-full bg-green-500 text-white py-3 px-6 rounded-lg text-lg font-semibold cursor-not-allowed opacity-75"
                    disabled
                  >
                    <Crown className="h-5 w-5 inline mr-2" />
                    Current Plan
                  </button>
                ) : plan.price === 0 ? (
                  <Link
                    to="/register"
                    className="w-full inline-flex justify-center items-center bg-gray-200 text-gray-800 py-3 px-6 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Get Started Free
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.stripePriceId)}
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                  >
                    <Zap className="h-5 w-5 inline mr-2" />
                    Choose {plan.name}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Premium;