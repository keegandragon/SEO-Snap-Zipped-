import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, ChevronDown, Check, Settings } from 'lucide-react';
import { UserType } from '../types';

interface UsageIndicatorProps {
  user: UserType;
}

const UsageIndicator: React.FC<UsageIndicatorProps> = ({ user }) => {
  const { usageCount, usageLimit, isPremium } = user;
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  
  const usagePercentage = Math.min((usageCount / usageLimit) * 100, 100);
  const remaining = Math.max(usageLimit - usageCount, 0);
  
  let statusColor = 'bg-green-500';
  if (usagePercentage >= 80) {
    statusColor = 'bg-red-500';
  } else if (usagePercentage >= 60) {
    statusColor = 'bg-yellow-500';
  }

  const plans = [
    { name: 'Free', limit: 5, features: ['Basic SEO', '5 tags'], isPremium: false },
    { name: 'Starter', limit: 50, features: ['Advanced SEO', '10 tags', 'Long-form content'], isPremium: true },
    { name: 'Pro', limit: 200, features: ['Premium SEO', '15 tags', 'API access'], isPremium: true }
  ];

  const getCurrentPlan = () => {
    if (!isPremium && usageLimit === 5) return plans[0]; // Free
    if (isPremium && usageLimit === 50) return plans[1]; // Starter
    if (isPremium && usageLimit === 200) return plans[2]; // Pro
    return plans[0]; // Default to Free
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Description Generations</h3>
        <div className="relative">
          <button
            onClick={() => setShowPlanMenu(!showPlanMenu)}
            className={`flex items-center space-x-1 text-sm ${
              isPremium ? 'text-blue-800' : 'text-gray-600'
            } hover:text-blue-700 transition-colors`}
          >
            <Crown className={`h-4 w-4 ${isPremium ? 'text-blue-800' : ''}`} />
            <span>{currentPlan.name} Plan</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {showPlanMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`px-4 py-3 text-sm ${
                      currentPlan.name === plan.name
                        ? 'bg-blue-50 text-blue-800'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{plan.name}</span>
                      {currentPlan.name === plan.name && (
                        <Check className="h-4 w-4 text-blue-800" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {plan.limit} generations/month
                    </div>
                    <div className="text-xs text-gray-500">
                      {plan.features.join(' • ')}
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                  <Link
                    to="/plans"
                    className="w-full btn btn-primary text-xs py-2 flex items-center justify-center"
                    onClick={() => setShowPlanMenu(false)}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Manage Subscription
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div 
          className={`h-2.5 rounded-full ${statusColor} transition-all duration-300 ease-in-out`}
          style={{ width: `${usagePercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">
          {usageCount} of {usageLimit} used
        </span>
        <span className={remaining === 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
          {remaining} remaining
        </span>
      </div>
      
      {!isPremium && remaining === 0 && (
        <div className="mt-2">
          <div className="text-xs text-red-600 mb-2">
            You've reached your monthly limit. Upgrade for more generations!
          </div>
          <Link
            to="/plans"
            className="btn btn-primary w-full text-xs py-1"
          >
            Upgrade Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default UsageIndicator;