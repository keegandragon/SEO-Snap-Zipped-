import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { createStripeCheckoutSession } from '../services/SubscriptionService';

const TestStripe = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Test 1: Check if Stripe tables exist and have data
  const testDatabaseTables = async () => {
    setLoading(true);
    addTestResult('🧪 Testing database tables...');
    
    try {
      // Test stripe_products table
      const { data: productsData, error: productsError } = await supabase
        .from('stripe_products')
        .select('*');
      
      if (productsError) {
        addTestResult(`❌ Error fetching products: ${productsError.message}`);
      } else {
        setProducts(productsData || []);
        addTestResult(`✅ Products table: Found ${productsData?.length || 0} products`);
      }

      // Test stripe_prices table
      const { data: pricesData, error: pricesError } = await supabase
        .from('stripe_prices')
        .select('*, product:stripe_products(*)');
      
      if (pricesError) {
        addTestResult(`❌ Error fetching prices: ${pricesError.message}`);
      } else {
        setPrices(pricesData || []);
        addTestResult(`✅ Prices table: Found ${pricesData?.length || 0} prices`);
      }

      // Test subscriptions table
      if (user) {
        const { data: subsData, error: subsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id);
        
        if (subsError) {
          addTestResult(`❌ Error fetching subscriptions: ${subsError.message}`);
        } else {
          setSubscriptions(subsData || []);
          addTestResult(`✅ Subscriptions table: Found ${subsData?.length || 0} subscriptions for current user`);
        }
      }

    } catch (err: any) {
      addTestResult(`❌ Database test failed: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Test Stripe checkout session creation (without actually redirecting)
  const testCheckoutSession = async (priceId: string) => {
    if (!user) {
      addTestResult('❌ User not logged in');
      return;
    }

    addTestResult(`🧪 Testing checkout session creation for price: ${priceId}`);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        addTestResult('❌ No valid session token');
        return;
      }

      // This will test the service but we'll catch the redirect
      const checkoutUrl = await createStripeCheckoutSession({
        priceId: priceId,
        userId: user.id,
        jwt: session.access_token,
        successUrl: `${window.location.origin}/test-stripe?test=success`,
        cancelUrl: `${window.location.origin}/test-stripe?test=cancel`,
      });

      if (checkoutUrl && checkoutUrl.includes('checkout.stripe.com')) {
        addTestResult(`✅ Checkout session created successfully: ${checkoutUrl.substring(0, 50)}...`);
      } else {
        addTestResult(`❌ Invalid checkout URL received: ${checkoutUrl}`);
      }
    } catch (err: any) {
      addTestResult(`❌ Checkout session test failed: ${err.message}`);
    }
  };

  // Test 3: Test Edge Function connectivity
  const testEdgeFunction = async () => {
    addTestResult('🧪 Testing Edge Function connectivity...');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        addTestResult('❌ No valid session token for Edge Function test');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: [{ price: 'test_price_id', quantity: 1 }],
          success_url: `${window.location.origin}/test`,
          cancel_url: `${window.location.origin}/test`,
          userId: user?.id || 'test_user',
        }),
      });

      if (response.ok) {
        addTestResult('✅ Edge Function is accessible');
      } else {
        const errorData = await response.json();
        addTestResult(`⚠️ Edge Function responded with error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      addTestResult(`❌ Edge Function connectivity test failed: ${err.message}`);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setTestResults([]);
    setError(null);
    
    addTestResult('🚀 Starting Stripe integration tests...');
    
    await testDatabaseTables();
    await testEdgeFunction();
    
    if (prices.length > 0) {
      await testCheckoutSession(prices[0].id);
    }
    
    addTestResult('✅ All tests completed!');
  };

  useEffect(() => {
    if (user) {
      testDatabaseTables();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Stripe Integration Test</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Please log in to test the Stripe integration.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Stripe Integration Test</h1>
        
        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </button>
            <button
              onClick={testDatabaseTables}
              disabled={loading}
              className="btn btn-outline"
            >
              Test Database
            </button>
            <button
              onClick={testEdgeFunction}
              disabled={loading}
              className="btn btn-outline"
            >
              Test Edge Function
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p>No tests run yet. Click "Run All Tests" to start.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Database Data Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Stripe Products ({products.length})</h3>
            <div className="space-y-2">
              {products.map((product) => (
                <div key={product.id} className="border rounded p-3">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.description}</div>
                  <div className="text-xs text-gray-500">ID: {product.id}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Prices */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Stripe Prices ({prices.length})</h3>
            <div className="space-y-2">
              {prices.map((price) => (
                <div key={price.id} className="border rounded p-3">
                  <div className="font-medium">
                    ${(price.unit_amount / 100).toFixed(2)} / {price.recurring_interval}
                  </div>
                  <div className="text-sm text-gray-600">
                    {price.product?.name} - {price.type}
                  </div>
                  <div className="text-xs text-gray-500">ID: {price.id}</div>
                  <button
                    onClick={() => testCheckoutSession(price.id)}
                    className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Test Checkout
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Subscriptions */}
        {subscriptions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Your Subscriptions ({subscriptions.length})</h3>
            <div className="space-y-2">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="border rounded p-3">
                  <div className="font-medium">{sub.plan_type} - {sub.status}</div>
                  <div className="text-sm text-gray-600">
                    {sub.current_period_start} to {sub.current_period_end}
                  </div>
                  {sub.stripe_subscription_id && (
                    <div className="text-xs text-gray-500">
                      Stripe ID: {sub.stripe_subscription_id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestStripe;