import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Users, TrendingDown, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HealthMetric {
  metric: string;
  count: number;
  details: any;
}

const SubscriptionHealthMonitor: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: healthError } = await supabase
        .rpc('get_subscription_health_report');

      if (healthError) {
        throw new Error(healthError.message);
      }

      setHealthData(data || []);
      setLastChecked(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const runExpiryCheck = async () => {
    try {
      setLoading(true);
      const { data, error: checkError } = await supabase
        .rpc('check_expired_subscriptions');

      if (checkError) {
        throw new Error(checkError.message);
      }

      // Reload health data after running check
      await loadHealthData();
      
      alert(`Expiry check completed! Processed: ${data?.[0]?.processed_count || 0}, Errors: ${data?.[0]?.error_count || 0}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run expiry check');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadHealthData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getMetricIcon = (metric: string, count: number) => {
    switch (metric) {
      case 'overdue_subscriptions':
        return count > 0 ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inconsistent_user_states':
        return count > 0 ? <AlertTriangle className="h-5 w-5 text-orange-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'expiring_soon':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'subscription_distribution':
        return <Users className="h-5 w-5 text-blue-500" />;
      default:
        return <TrendingDown className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMetricTitle = (metric: string) => {
    switch (metric) {
      case 'overdue_subscriptions':
        return 'Overdue Subscriptions';
      case 'inconsistent_user_states':
        return 'Inconsistent User States';
      case 'expiring_soon':
        return 'Expiring Soon (7 days)';
      case 'subscription_distribution':
        return 'Subscription Distribution';
      default:
        return metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getMetricDescription = (metric: string, count: number) => {
    switch (metric) {
      case 'overdue_subscriptions':
        return count === 0 ? 'All subscriptions are up to date' : `${count} subscriptions need immediate attention`;
      case 'inconsistent_user_states':
        return count === 0 ? 'All user states are consistent' : `${count} users have mismatched subscription data`;
      case 'expiring_soon':
        return `${count} subscriptions expiring in the next 7 days`;
      case 'subscription_distribution':
        return 'Current active subscription breakdown';
      default:
        return `${count} items found`;
    }
  };

  if (loading && !healthData.length) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-800 mr-2" />
          <span className="text-gray-600">Loading subscription health data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Health Monitor</h2>
          {lastChecked && (
            <p className="text-sm text-gray-600">
              Last checked: {lastChecked.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadHealthData}
            disabled={loading}
            className="btn btn-outline flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={runExpiryCheck}
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Run Expiry Check
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {healthData.map((metric) => (
          <div key={metric.metric} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getMetricIcon(metric.metric, metric.count)}
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getMetricTitle(metric.metric)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getMetricDescription(metric.metric, metric.count)}
                  </p>
                </div>
              </div>
              <span className={`text-2xl font-bold ${
                metric.metric === 'overdue_subscriptions' && metric.count > 0 ? 'text-red-600' :
                metric.metric === 'inconsistent_user_states' && metric.count > 0 ? 'text-orange-600' :
                'text-gray-900'
              }`}>
                {metric.count}
              </span>
            </div>

            {/* Show distribution details for subscription_distribution */}
            {metric.metric === 'subscription_distribution' && metric.details && (
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Free:</span>
                  <span className="font-medium">{metric.details.free || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Starter:</span>
                  <span className="font-medium">{metric.details.starter || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pro:</span>
                  <span className="font-medium">{metric.details.pro || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expired:</span>
                  <span className="font-medium">{metric.details.expired || 0}</span>
                </div>
              </div>
            )}

            {/* Show critical issues */}
            {(metric.metric === 'overdue_subscriptions' || metric.metric === 'inconsistent_user_states') && 
             metric.count > 0 && metric.details && Array.isArray(metric.details) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <h4 className="text-sm font-medium text-red-800 mb-2">Issues Found:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {metric.details.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="text-xs text-red-700">
                      {item.user_email} - {item.plan_type || 'Unknown plan'}
                      {item.days_overdue && ` (${Math.floor(item.days_overdue)} days overdue)`}
                    </div>
                  ))}
                  {metric.details.length > 5 && (
                    <div className="text-xs text-red-600 font-medium">
                      ... and {metric.details.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show expiring soon details */}
            {metric.metric === 'expiring_soon' && metric.count > 0 && metric.details && Array.isArray(metric.details) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Expiring Soon:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {metric.details.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="text-xs text-yellow-700">
                      {item.user_email} - {item.plan_type} ({Math.floor(item.days_until_expiry)} days)
                    </div>
                  ))}
                  {metric.details.length > 5 && (
                    <div className="text-xs text-yellow-600 font-medium">
                      ... and {metric.details.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overall Health Status */}
      <div className="card">
        <div className="flex items-center justify-center py-6">
          {healthData.some(m => m.metric === 'overdue_subscriptions' && m.count > 0) ||
           healthData.some(m => m.metric === 'inconsistent_user_states' && m.count > 0) ? (
            <div className="flex items-center text-red-600">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <span className="text-lg font-semibold">System Requires Attention</span>
            </div>
          ) : (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-6 w-6 mr-2" />
              <span className="text-lg font-semibold">All Systems Healthy</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionHealthMonitor;