import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SubscriptionHealthMonitor from '../components/SubscriptionHealthMonitor';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Simple admin check - in production, you'd have proper role-based access
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('support');

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to access the admin dashboard.</p>
          <Link to="/login" className="btn btn-primary">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            to="/dashboard" 
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-blue-800 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
        </div>

        {/* Admin Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-800 mr-2" />
            <div>
              <p className="text-blue-800 font-medium">Admin Access Granted</p>
              <p className="text-blue-600 text-sm">
                Logged in as: {user.name} ({user.email})
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Health Monitor */}
        <SubscriptionHealthMonitor />

        {/* Additional Admin Tools */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/stripe-debug" className="btn btn-outline w-full text-sm">
                Stripe Debugger
              </Link>
              <Link to="/test-stripe" className="btn btn-outline w-full text-sm">
                Test Stripe Integration
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">System Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className="font-medium">Production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Database:</span>
                <span className="font-medium text-green-600">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stripe:</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Documentation</h3>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-blue-800 hover:text-blue-700">
                Subscription Management Guide
              </a>
              <a href="#" className="block text-blue-800 hover:text-blue-700">
                Troubleshooting Guide
              </a>
              <a href="#" className="block text-blue-800 hover:text-blue-700">
                API Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;