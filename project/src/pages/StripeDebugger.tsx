import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const StripeDebugger = () => {
  const { user } = useAuth();
  const [databasePrices, setDatabasePrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Check database price IDs
  const checkDatabasePrices = async () => {
    setLoading(true);
    addResult('🔍 Checking database price IDs...');
    
    try {
      const { data: prices, error } = await supabase
        .from('stripe_prices')
        .select('*, product:stripe_products(*)')
        .eq('active', true);

      if (error) {
        addResult(`❌ Database error: ${error.message}`);
        return;
      }

      setDatabasePrices(prices || []);
      addResult(`✅ Found ${prices?.length || 0} prices in database`);
      
      prices?.forEach(price => {
        const isValidStripeId = price.id.startsWith('price_');
        addResult(`${isValidStripeId ? '✅' : '❌'} ${price.product.name} (${price.recurring_interval}): ${price.id}`);
        if (!isValidStripeId) {
          addResult(`   ⚠️  This doesn't look like a real Stripe Price ID`);
        }
      });

    } catch (err: any) {
      addResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test a specific price ID with Stripe
  const testPriceWithStripe = async (priceId: string) => {
    if (!user) {
      addResult('❌ Please log in to test Stripe integration');
      return;
    }

    addResult(`🧪 Testing price ID with Stripe: ${priceId}`);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        addResult('❌ No valid session token');
        return;
      }

      // Call our Edge Function to test the price
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          priceId: priceId,
          userId: user.id,
          planType: 'test',
          successUrl: `${window.location.origin}/test`,
          cancelUrl: `${window.location.origin}/test`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addResult(`✅ Price ID ${priceId} is valid - Stripe checkout URL created`);
      } else {
        const errorData = await response.json();
        addResult(`❌ Price ID ${priceId} failed: ${errorData.error}`);
        
        if (errorData.error?.includes('No such price')) {
          addResult(`   💡 This price ID doesn't exist in your Stripe account`);
        }
      }
    } catch (err: any) {
      addResult(`❌ Test failed: ${err.message}`);
    }
  };

  useEffect(() => {
    checkDatabasePrices();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Stripe Price ID Debugger</h1>
        
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">How to Check Your Stripe Price IDs</h2>
          <div className="space-y-2 text-blue-800">
            <p><strong>1. In Stripe Dashboard:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Go to <a href="https://dashboard.stripe.com/products" target="_blank" className="underline">Products → Products</a></li>
              <li>Click on your product (e.g., "Starter Plan")</li>
              <li>Look for the Price ID (starts with "price_")</li>
              <li>Copy the exact Price ID</li>
            </ul>
            
            <p className="mt-4"><strong>2. In Your Database:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Check the results below to see what's currently in your database</li>
              <li>Valid Stripe Price IDs start with "price_" (e.g., "price_1ABC123def456")</li>
              <li>Invalid IDs like "price_starter_monthly" are just placeholders</li>
            </ul>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={checkDatabasePrices}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Checking...' : 'Check Database Prices'}
            </button>
          </div>
        </div>

        {/* Database Prices Display */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Database Prices</h2>
          <div className="space-y-4">
            {databasePrices.map((price) => (
              <div key={price.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{price.product?.name}</h3>
                    <p className="text-sm text-gray-600">
                      ${(price.unit_amount / 100).toFixed(2)} / {price.recurring_interval}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    price.id.startsWith('price_') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {price.id.startsWith('price_') ? 'Valid Format' : 'Invalid Format'}
                  </span>
                </div>
                
                <div className="bg-gray-50 p-2 rounded font-mono text-sm mb-3">
                  <strong>Price ID:</strong> {price.id}
                </div>
                
                {user && (
                  <button
                    onClick={() => testPriceWithStripe(price.id)}
                    className="btn btn-outline btn-sm"
                  >
                    Test with Stripe
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p>No tests run yet. Click "Check Database Prices\" to start.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Fix Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">Quick Fix Instructions</h3>
          <div className="text-yellow-800 space-y-2">
            <p><strong>If you see invalid Price IDs above:</strong></p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Go to your <a href="https://dashboard.stripe.com/products" target="_blank" className="underline">Stripe Dashboard → Products</a></li>
              <li>Create products for "Starter Plan" and "Pro Plan" if they don't exist</li>
              <li>For each product, create monthly and yearly prices</li>
              <li>Copy the real Price IDs (they start with "price_")</li>
              <li>Update your database with the real Price IDs</li>
            </ol>
            
            <p className="mt-4"><strong>Example of real Stripe Price IDs:</strong></p>
            <ul className="list-disc pl-6 space-y-1 font-mono text-sm">
              <li>price_1ABC123def456 (Starter Monthly)</li>
              <li>price_1XYZ789ghi012 (Starter Yearly)</li>
              <li>price_1DEF456jkl345 (Pro Monthly)</li>
              <li>price_1GHI789mno678 (Pro Yearly)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeDebugger;