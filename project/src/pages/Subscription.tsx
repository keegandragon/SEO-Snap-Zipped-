import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SubscriptionManager from '../components/SubscriptionManager';

const Subscription = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to manage your subscription.</p>
          <Link to="/login" className="btn btn-primary">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            to="/dashboard" 
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600 mt-1">Manage your SEO Snap subscription and billing</p>
          </div>
        </div>

        {/* Subscription Manager */}
        <SubscriptionManager 
          userId={user.id}
          onSubscriptionChange={() => {
            // Optionally refresh user data or show success message
            console.log('Subscription updated');
          }}
        />

        {/* Help Section */}
        <div className="card mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Cancellation Policy:</strong> You can cancel your subscription at any time. 
              When you cancel, you'll continue to have access to premium features until the end 
              of your current billing period.
            </p>
            <p>
              <strong>Billing:</strong> Subscriptions are billed monthly. Your next billing date 
              is shown in your subscription details above.
            </p>
            <p>
              <strong>Refunds:</strong> We offer prorated refunds for unused portions of your 
              subscription. Contact support for assistance.
            </p>
            <p>
              <strong>Questions?</strong> Contact our support team at{' '}
              <a href="mailto:support@seosnap.com" className="text-blue-800 hover:text-blue-700">
                support@seosnap.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;