import React, { useState, useEffect } from 'react';
import { Crown, Calendar, AlertTriangle, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Subscription } from '../types';
import { 
  getUserSubscription, 
  cancelSubscription, 
  reactivateSubscription,
  formatDate,
  getDaysUntilExpiry
} from '../services/subscriptionService';

interface SubscriptionManagerProps {
  userId: string;
  onSubscriptionChange?: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ 
  userId, 
  onSubscriptionChange 
}) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [userId]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const sub = await getUserSubscription(userId);
      setSubscription(sub);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const sub = await getUserSubscription(userId);
      setSubscription(sub);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh subscription');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      setActionLoading(true);
      const updatedSub = await cancelSubscription(subscription.id);
      setSubscription(updatedSub);
      onSubscriptionChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;
    
    try {
      setActionLoading(true);
      const updatedSub = await reactivateSubscription(subscription.id);
      setSubscription(updatedSub);
      onSubscriptionChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate subscription');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-800" />
          <span className="ml-2 text-gray-600">Loading subscription...</span>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-600 mb-4">No subscription found</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline flex items-center mx-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry(subscription.current_period_end);
  const isExpiringSoon = daysUntilExpiry <= 7;
  const isPremium = subscription.plan_type !== 'free';

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Current Subscription Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Subscription</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Refresh subscription data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Crown className={`h-5 w-5 ${isPremium ? 'text-blue-800' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${
              isPremium ? 'text-blue-800' : 'text-gray-600'
            }`}>
              {subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)} Plan
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="flex items-center mt-1">
              {subscription.status === 'active' ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
              )}
              <span className={`text-sm ${
                subscription.status === 'active' ? 'text-green-700' : 'text-red-700'
              }`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Billing Period</label>
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
              </span>
            </div>
          </div>
        </div>

        {/* Stripe Information */}
        {subscription.stripe_subscription_id && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Subscription Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Subscription ID:</span>
                <div className="font-mono text-xs text-gray-700 break-all">
                  {subscription.stripe_subscription_id}
                </div>
              </div>
              {subscription.stripe_price_id && (
                <div>
                  <span className="text-gray-500">Price ID:</span>
                  <div className="font-mono text-xs text-gray-700 break-all">
                    {subscription.stripe_price_id}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancellation Warning */}
        {subscription.cancel_at_period_end && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Subscription Canceled</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your subscription will end on {formatDate(subscription.current_period_end)}. 
                  You'll continue to have access to premium features until then.
                </p>
                {subscription.canceled_at && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Canceled on {formatDate(subscription.canceled_at)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expiry Warning */}
        {!subscription.cancel_at_period_end && isExpiringSoon && isPremium && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-orange-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-orange-800">Subscription Expiring Soon</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Your subscription expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} 
                  on {formatDate(subscription.current_period_end)}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {subscription.cancel_at_period_end ? (
            <button
              onClick={handleReactivateSubscription}
              disabled={actionLoading}
              className="btn btn-primary flex items-center space-x-2"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>Reactivate Subscription</span>
            </button>
          ) : isPremium ? (
            <button
              onClick={handleCancelSubscription}
              disabled={actionLoading}
              className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center space-x-2"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span>Cancel Subscription</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Plan Features */}
      <div className="card">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Plan Features</h4>
        <div className="space-y-2">
          {subscription.plan_type === 'free' && (
            <>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                5 generations per month
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Basic SEO optimization
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                5 SEO tags per product
              </div>
            </>
          )}
          
          {subscription.plan_type === 'starter' && (
            <>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                50 generations per month
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Advanced SEO optimization
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                10 SEO tags per product
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Long-form descriptions
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Batch upload: 2 images at once
              </div>
            </>
          )}
          
          {subscription.plan_type === 'pro' && (
            <>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                200 generations per month
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Premium SEO optimization
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                15 SEO tags per product
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Long-form descriptions
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Batch upload: 10 images at once
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                CSV export
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;