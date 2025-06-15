import { Link } from 'react-router-dom';
import { Check, Zap, Crown, ArrowRight, Image as Images } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const Pricing = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Scroll to top when component mounts or when switching billing cycles
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [billingCycle]);

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

  const plans = [
    {
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
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
      limitations: [
        'Limited to 150 words per description',
        'Basic AI model',
        'No batch processing'
      ],
      cta: 'Get Started Free',
      popular: false,
      current: user && getCurrentPlanFromUser() === 'free',
      batchSize: 1,
      planType: 'free'
    },
    {
      name: 'Starter',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99, // ~$8.33/month when billed yearly
      description: 'Great for small businesses',
      features: [
        '50 generations per month',
        'Advanced SEO optimization',
        '10 SEO tags per product',
        'Long-form descriptions (300 words)',
        'Batch upload: 2 images at once',
        'Priority processing',
        'Email support',
        'Advanced AI model'
      ],
      limitations: [],
      cta: 'Start Free Trial',
      popular: true,
      current: user && getCurrentPlanFromUser() === 'starter',
      batchSize: 2,
      planType: 'starter'
    },
    {
      name: 'Pro',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99, // ~$16.67/month when billed yearly
      description: 'For power users and agencies',
      features: [
        '200 generations per month',
        'Premium SEO optimization',
        '15 SEO tags per product',
        'Long-form descriptions (500 words)',
        'Batch upload: 10 images at once',
        'Priority processing',
        'Premium support',
        'Export to CSV',
        'Advanced analytics'
      ],
      limitations: [],
      cta: 'Start Free Trial',
      popular: false,
      current: user && getCurrentPlanFromUser() === 'pro',
      batchSize: 10,
      planType: 'pro'
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 0;
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getMonthlyEquivalent = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 0;
    return billingCycle === 'yearly' ? (plan.yearlyPrice / 12) : plan.monthlyPrice;
  };

  const getSavingsPercentage = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 0;
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };

  // Function to get the appropriate button text and action
  const getButtonConfig = (plan: typeof plans[0]) => {
    if (!user) {
      // Not logged in
      return {
        text: plan.planType === 'free' ? 'Get Started Free' : 'Sign Up & Subscribe',
        link: '/register',
        className: plan.popular ? 'btn-primary' : 'btn-outline'
      };
    }

    const currentPlan = getCurrentPlanFromUser();
    
    if (plan.current) {
      // Current plan
      return {
        text: 'Current Plan',
        link: '/subscription',
        className: 'btn-outline cursor-default',
        disabled: true
      };
    }

    if (plan.planType === 'free') {
      // Downgrade to free
      if (currentPlan !== 'free') {
        return {
          text: 'Downgrade to Free',
          link: '/subscription',
          className: 'btn-outline'
        };
      } else {
        return {
          text: 'Current Plan',
          link: '/subscription',
          className: 'btn-outline cursor-default',
          disabled: true
        };
      }
    }

    // Upgrade to paid plan
    if (currentPlan === 'free' || 
        (currentPlan === 'starter' && plan.planType === 'pro')) {
      return {
        text: `Upgrade to ${plan.name}`,
        link: '/plans',
        className: plan.popular ? 'btn-primary' : 'btn-outline'
      };
    }

    // Downgrade from higher plan
    return {
      text: `Switch to ${plan.name}`,
      link: '/plans',
      className: 'btn-outline'
    };
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
      question: "What's the difference between monthly and yearly billing?",
      answer: "Yearly billing offers significant savings (17% off) compared to monthly billing. You pay upfront for the full year and get the same features at a discounted rate."
    }
  ];

  const currentPlan = plans.find(plan => plan.current);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the plan that fits your business needs. All plans include our core AI-powered 
            description generation with different limits and batch processing capabilities.
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
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Current Plan Indicator */}
          {user && currentPlan && (
            <div className="flex justify-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-800 rounded-full text-sm font-medium">
                <Crown className="h-4 w-4 mr-2" />
                Currently on {currentPlan.name} Plan
              </div>
            </div>
          )}
        </div>

        {/* Batch Processing Feature Highlight */}
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-lg p-6 mb-12">
          <div className="flex items-center justify-center mb-4">
            <Images className="h-8 w-8 text-blue-800 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Batch Processing Available</h2>
          </div>
          <p className="text-center text-gray-700 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const buttonConfig = getButtonConfig(plan);
            
            return (
              <div 
                key={plan.name}
                className={`relative card hover:border-blue-500 transition-all duration-300 ${
                  plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''
                } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* Most Popular Badge - Positioned to avoid overlap */}
                {plan.popular && (
                  <div className={`absolute -top-4 ${plan.current ? 'left-4' : 'left-1/2 -translate-x-1/2'}`}>
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
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
                    {plan.monthlyPrice === 0 ? (
                      <span className="text-4xl font-bold text-gray-900">Free</span>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold text-gray-900">
                            ${getPrice(plan)}
                          </span>
                          <span className="text-gray-600 ml-1 text-sm">
                            /{billingCycle === 'monthly' ? 'month' : 'year'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && (
                          <div className="mt-1">
                            <span className="text-sm text-gray-500">
                              ${getMonthlyEquivalent(plan).toFixed(2)}/month when billed yearly
                            </span>
                            <div className="inline-flex items-center ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Save {getSavingsPercentage(plan)}%
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* Batch Processing Highlight */}
                  <div className={`border rounded-md p-3 mb-6 ${
                    plan.batchSize === 1 
                      ? 'bg-gray-50 border-gray-200' 
                      : plan.batchSize === 2 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-teal-50 border-teal-200'
                  }`}>
                    <div className={`flex items-center text-sm ${
                      plan.batchSize === 1 
                        ? 'text-gray-600' 
                        : plan.batchSize === 2 
                          ? 'text-blue-800' 
                          : 'text-teal-800'
                    }`}>
                      <Images className="h-4 w-4 mr-2" />
                      <span>
                        <strong>Batch Upload:</strong> {plan.batchSize} image{plan.batchSize > 1 ? 's' : ''} {plan.batchSize > 1 ? 'at once' : 'only'}
                      </span>
                    </div>
                  </div>

                  <Link 
                    to={buttonConfig.link}
                    className={`btn w-full mb-8 ${buttonConfig.className} ${
                      buttonConfig.disabled ? 'pointer-events-none opacity-75' : ''
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      {plan.current ? (
                        <Crown className="w-5 h-5 mr-2" />
                      ) : (
                        <Zap className="w-5 h-5 mr-2" />
                      )}
                      {buttonConfig.text}
                    </span>
                  </Link>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Features included:</h4>
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className={`text-gray-700 text-sm ${
                              feature.includes('Batch upload') ? 'font-medium text-blue-800' : ''
                            }`}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation) => (
                            <li key={limitation} className="text-gray-500 text-sm">
                              • {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison */}
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
                <tr>
                  <td className="py-3 px-4 text-gray-700">Billing Options</td>
                  <td className="py-3 px-4 text-center">-</td>
                  <td className="py-3 px-4 text-center">Monthly/Yearly</td>
                  <td className="py-3 px-4 text-center">Monthly/Yearly</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16" id="faq">
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

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-800 to-teal-600 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of businesses already using SEO Snap to create better product descriptions with powerful batch processing.
          </p>
          <Link to={user ? "/dashboard" : "/register"} className="btn bg-white text-blue-800 hover:bg-blue-50 inline-flex items-center">
            {user ? "Go to Dashboard" : "Start Your Free Trial"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;