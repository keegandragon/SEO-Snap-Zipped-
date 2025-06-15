import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Crown, AlertTriangle, X, Settings, Image as Images } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { createStripeCheckoutSession } from '../services/SubscriptionService';

interface StripePrice {
  id: string;
  product_id: string;
  active: boolean;
  currency: string;
  unit_amount: number | null;
  recurring_interval: 'day' | 'week' | 'month' | 'year' | null;
  recurring_interval_count: number | null;
  type: 'one_time' | 'recurring';
  product: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    metadata: { [key: string]: any } | null;
  };
}

const Plans = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [fetchedPlans, setFetchedPlans] = useState<StripePrice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    loadPlansAndSubscription();
  }, [user]);

  // Scroll to top when component mounts or when switching billing cycles
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [billingCycle]);

  const loadPlansAndSubscription = async () => {
    try {
      // Always fetch plans - this should be public information
      const { data: prices, error: pricesError } = await supabase
        .from('stripe_prices')
        .select('*, product:stripe_products(*)')
        .eq('active', true)
        .order('unit_amount', { ascending: true });

      if (pricesError) throw pricesError;
      setFetchedPlans(prices as StripePrice[]);

      // Only fetch subscription if user is logged in
      if (user) {
        const { data: sub, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (subError) throw subError;
        setSubscription(sub);
      }

    } catch (error: any) {
      console.error('Failed to load plans and subscription:', error);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      setCancelling(true);
      const { data: updatedSub, error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          canceled_at: new Date().toISOString()
        })
        .eq('id', subscription.id)
        .select()
        .single();

      if (error) throw error;
      
      setSubscription(updatedSub);
      setShowCancelModal(false);
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      setError('Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const handleCheckout = async (priceId: string, planType: string) => {
    // Require login for checkout
    if (!user || !user.id) {
      setCheckoutError('Please log in to subscribe or refresh your session.');
      return;
    }

    // Clear any previous checkout errors
    setCheckoutError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setCheckoutError('Please log in again to continue.');
        return;
      }

      const result = await createStripeCheckoutSession({
        priceId: priceId,
        userId: user.id,
        planType: planType,
        successUrl: `${window.location.origin}/dashboard?payment=success`,
        cancelUrl: `${window.location.origin}/plans?payment=cancelled`,
        jwt: session.access_token
      });

      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        setCheckoutError(result.error || 'Failed to start checkout process');
      }
    } catch (err: any) {
      console.error('Error in handleCheckout:', err.message);
      setCheckoutError(err.message || 'Failed to start checkout process');
    }
  };

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

  // Filter plans based on billing cycle and map to display format
  const plans = fetchedPlans
    .filter(price => price.recurring_interval === billingCycle.slice(0, -2)) // 'monthly' -> 'month', 'yearly' -> 'year'
    .map(price => {
      const displayPrice = price.unit_amount ? price.unit_amount / 100 : 0;
      const productName = price.product.name;
      
      let features: string[] = [];
      let planType = 'starter';

      if (productName.toLowerCase().includes('starter')) {
        planType = 'starter';
        features = [
          '50 generations per month', 
          'Advanced SEO optimization', 
          '10 SEO tags per product',
          'Long-form descriptions (300 words)', 
          'Batch upload: 2 images at once',
          'Priority processing'
        ];
      } else if (productName.toLowerCase().includes('pro')) {
        planType = 'pro';
        features = [
          '200 generations per month', 
          'Premium SEO optimization', 
          '15 SEO tags per product',
          'Long-form descriptions (500 words)', 
          'Batch upload: 10 images at once',
          'Priority processing',
          'Export to CSV',
          'Advanced analytics'
        ];
      }

      // Determine if this is the user's current plan based on their actual plan type
      const userCurrentPlan = getCurrentPlanFromUser();
      const isCurrent = user && userCurrentPlan === planType;

      return {
        name: productName,
        stripePriceId: price.id,
        price: displayPrice,
        description: price.product.description || '',
        features: features,
        popular: price.product.metadata?.popular === 'true',
        current: isCurrent,
        planType: planType as 'starter' | 'pro'
      };
    });

  // Add free plan - ONLY mark as current if user is actually on free plan
  const userCurrentPlan = getCurrentPlanFromUser();
  const freePlan = {
    name: 'Free',
    price: 0,
    description: 'Perfect for trying out our service',
    features: [
      '5 generations per month', 
      'Basic SEO optimization', 
      '5 SEO tags per product',
      'Short descriptions (150 words)',
      'Single image upload only',
      'Copy to clipboard', 
      'Email sharing', 
      'Community support'
    ],
    planType: 'free' as const,
    popular: false,
    current: user && userCurrentPlan === 'free', // Only current if user is actually on free plan
    stripePriceId: null
  };

  const finalPlans = [freePlan, ...plans];

  const getCurrentPlan = () => {
    return finalPlans.find(plan => plan.current);
  };

  const currentPlan = getCurrentPlan();
  const isSubscribed = subscription && subscription.status === 'active' && subscription.plan_type !== 'free';

  // Fixed savings percentage - we know it's 17% based on your pricing
  const getSavingsPercentage = () => {
    return 17; // Your yearly plans save 17%
  };

  // Calculate monthly equivalent for yearly plans
  const getMonthlyEquivalent = (yearlyPrice: number) => {
    return yearlyPrice / 12;
  };

  const faqs = [
    {
      question: "How does batch processing work?",
      answer: "With Starter and Pro plans, you can upload multiple images at once. Starter allows 2 images per batch, while Pro allows up to 10 images. Each image in the batch counts as one generation toward your monthly limit."
    },
    {
      question: "Can I change my plan at any time?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll get access to new features like batch processing right away."
    },
    {
      question: "What happens if I exceed my monthly limit?",
      answer: "If you reach your monthly generation limit, you can either upgrade your plan or wait until the next billing cycle. We'll never charge you overage fees."
    },
    {
      question: "Do you offer refunds?",
      answer: "All sales are final and no refunds are provided due to the subscription nature of our service. However, you can cancel your subscription at any time and continue to have access to premium features until the end of your current billing period."
    },
    {
      question: "How does the Free plan work?",
      answer: "The Free plan gives you 5 AI-generated product descriptions per month with basic SEO optimization and single image uploads. It's perfect for testing our service and small-scale needs."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. You can cancel your subscription at any time from your account settings. You'll continue to have access to premium features until the end of your current billing period, and you won't be charged for the next billing cycle."
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Generate SEO-optimized product descriptions with powerful batch processing features to grow your business faster.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg flex items-center">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save {getSavingsPercentage()}%
                </span>
              </button>
            </div>
          </div>

          {/* Current Plan Indicator - Centered */}
          {user && currentPlan && (
            <div className="flex justify-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-800 rounded-full text-sm font-medium">
                <Crown className="h-4 w-4 mr-2" />
                Currently on {currentPlan.name} Plan
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Checkout Error Display */}
        {checkoutError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Checkout Error</h3>
                <p className="text-red-700 mb-4">{checkoutError}</p>
                
                {checkoutError.includes('price ID') && (
                  <div className="bg-red-100 border border-red-300 rounded-md p-3 mb-4">
                    <p className="text-sm text-red-800 font-medium mb-2">This appears to be a configuration issue:</p>
                    <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
                      <li>The Stripe Price IDs in the database may be invalid or placeholder values</li>
                      <li>Real Stripe Price IDs start with "price_" followed by a long string</li>
                      <li>You can use the Stripe Debugger to identify and fix invalid Price IDs</li>
                    </ul>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setCheckoutError(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Dismiss
                  </button>
                  <Link
                    to="/stripe-debug"
                    className="btn btn-primary btn-sm inline-flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Open Stripe Debugger
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Batch Processing Feature Highlight */}
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <Images className="h-8 w-8 text-blue-800 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">New: Batch Processing</h2>
          </div>
          <p className="text-center text-gray-700 mb-4">
            Upload multiple product images at once and generate descriptions in batches for faster workflow!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Free Plan</h3>
              <p className="text-2xl font-bold text-gray-600">1</p>
              <p className="text-sm text-gray-500">image at a time</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-300 border-2">
              <h3 className="font-semibold text-blue-800 mb-2">Starter Plan</h3>
              <p className="text-2xl font-bold text-blue-800">2</p>
              <p className="text-sm text-blue-600">images per batch</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-teal-300 border-2">
              <h3 className="font-semibold text-teal-800 mb-2">Pro Plan</h3>
              <p className="text-2xl font-bold text-teal-800">10</p>
              <p className="text-sm text-teal-600">images per batch</p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {finalPlans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative card hover:border-blue-500 transition-all duration-300 ${
                plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''
              } ${plan.current ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Most Popular Badge - Positioned to avoid overlap */}
              {plan.popular && (
                <div className={`absolute -top-4 ${plan.current ? 'left-4' : 'left-1/2 -translate-x-1/2'}`}>
                  <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge - Centered when no popular badge */}
              {plan.current && (
                <div className={`absolute -top-4 ${plan.popular ? 'right-4' : 'left-1/2 -translate-x-1/2'}`}>
                  <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  {plan.name !== 'Free' && (
                    <Crown className="h-6 w-6 text-blue-800" />
                  )}
                </div>

                <div className="flex items-baseline mb-4 min-h-[4rem]">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold text-gray-900">Free</span>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600 ml-1 text-sm">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <div className="mt-1">
                          <span className="text-sm text-gray-500">
                            ${getMonthlyEquivalent(plan.price).toFixed(2)}/month when billed yearly
                          </span>
                          <div className="inline-flex items-center ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Save {getSavingsPercentage()}%
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-6">{plan.description}</p>

                {/* Batch Processing Highlight */}
                {plan.name === 'Free' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Images className="h-4 w-4 mr-2" />
                      <span>Single image upload only</span>
                    </div>
                  </div>
                )}
                {plan.name === 'Starter' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
                    <div className="flex items-center text-sm text-blue-800">
                      <Images className="h-4 w-4 mr-2" />
                      <span>Batch Upload: 2 images at once</span>
                    </div>
                  </div>
                )}
                {plan.name === 'Pro' && (
                  <div className="bg-teal-50 border border-teal-200 rounded-md p-3 mb-6">
                    <div className="flex items-center text-sm text-teal-800">
                      <Images className="h-4 w-4 mr-2" />
                      <span>Batch Upload: 10 images at once</span>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="mb-8">
                  {plan.current ? (
                    <div className="space-y-3">
                      <button className="btn w-full cursor-default bg-green-600 text-white hover:bg-green-600 border-green-600">
                        <Crown className="w-5 h-5 mr-2" />
                        Current Plan
                      </button>
                      
                      {/* Cancel Subscription Button for Premium Plans */}
                      {isSubscribed && plan.planType !== 'free' && !subscription?.cancel_at_period_end && (
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="btn w-full bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                        >
                          Cancel Subscription
                        </button>
                      )}
                      
                      {/* Show cancellation status */}
                      {subscription?.cancel_at_period_end && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                          <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">Subscription Canceled</p>
                              <p className="text-sm text-yellow-700 mt-1">
                                Access until {new Date(subscription.current_period_end).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Show different buttons based on login status */}
                      {!user ? (
                        // Not logged in - show login/register buttons
                        plan.price === 0 ? (
                          <Link to="/register" className="btn w-full bg-blue-600 text-white hover:bg-blue-700 border-blue-600">
                            <Zap className="w-5 h-5 mr-2" />
                            Get Started Free
                          </Link>
                        ) : (
                          <div className="space-y-2">
                            <Link to="/register" className={`btn w-full ${
                              plan.popular 
                                ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' 
                                : 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600'
                            }`}>
                              <Zap className="w-5 h-5 mr-2" />
                              Sign Up for {plan.name}
                            </Link>
                            <p className="text-xs text-gray-500 text-center">
                              Already have an account? <Link to="/login" className="text-blue-800 hover:text-blue-700">Sign in</Link>
                            </p>
                          </div>
                        )
                      ) : (
                        // Logged in - show upgrade buttons
                        <button
                          onClick={() => plan.stripePriceId ? handleCheckout(plan.stripePriceId, plan.planType) : null}
                          disabled={!plan.stripePriceId && plan.price !== 0}
                          className={`btn w-full ${
                            plan.popular 
                              ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' 
                              : 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600'
                          } ${!plan.stripePriceId && plan.price !== 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Zap className="w-5 h-5 mr-2" />
                          {plan.price === 0 ? 'Current Plan' : `Upgrade to ${plan.name}`}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="card mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Starter</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4 text-gray-700">Monthly Generations</td>
                  <td className="py-3 px-4 text-center">5</td>
                  <td className="py-3 px-4 text-center">50</td>
                  <td className="py-3 px-4 text-center">200</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="py-3 px-4 text-gray-700 font-medium">
                    <div className="flex items-center">
                      <Images className="h-4 w-4 mr-2 text-blue-600" />
                      Batch Upload (Images per batch)
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-medium">1</td>
                  <td className="py-3 px-4 text-center font-medium text-blue-800">2</td>
                  <td className="py-3 px-4 text-center font-medium text-teal-800">10</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">SEO Tags per Product</td>
                  <td className="py-3 px-4 text-center">5</td>
                  <td className="py-3 px-4 text-center">10</td>
                  <td className="py-3 px-4 text-center">15</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Max Description Length</td>
                  <td className="py-3 px-4 text-center">150 words</td>
                  <td className="py-3 px-4 text-center">300 words</td>
                  <td className="py-3 px-4 text-center">500 words</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">CSV Export</td>
                  <td className="py-3 px-4 text-center">❌</td>
                  <td className="py-3 px-4 text-center">❌</td>
                  <td className="py-3 px-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Priority Support</td>
                  <td className="py-3 px-4 text-center">❌</td>
                  <td className="py-3 px-4 text-center">✅</td>
                  <td className="py-3 px-4 text-center">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="card">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-outline">
                  Return to Dashboard
                </Link>
                <Link to="/stripe-debug" className="btn btn-outline inline-flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Stripe Debugger
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-start space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-gray-700 mb-2">
                    Are you sure you want to cancel your subscription?
                  </p>
                  <p className="text-sm text-gray-600">
                    You'll continue to have access until your current billing period ends.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn btn-outline flex-1"
                disabled={cancelling}
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;