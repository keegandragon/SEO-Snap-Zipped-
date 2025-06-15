import { supabase } from '../lib/supabase';
import { Subscription } from '../types';

export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  // If no subscription found, return null
  if (!data || data.length === 0) {
    return null;
  }

  // Return the most recent subscription
  return data[0];
};

export const cancelSubscription = async (subscriptionId: string): Promise<Subscription> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: true,
      canceled_at: new Date().toISOString()
    })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const reactivateSubscription = async (subscriptionId: string): Promise<Subscription> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: false,
      canceled_at: null
    })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const upgradeSubscription = async (
  subscriptionId: string, 
  newPlanType: 'starter' | 'pro'
): Promise<Subscription> => {
  const now = new Date();
  const nextPeriodEnd = new Date(now);
  nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      plan_type: newPlanType,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: nextPeriodEnd.toISOString(),
      cancel_at_period_end: false,
      canceled_at: null
    })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Update user's premium status and usage limit
  const usageLimit = newPlanType === 'starter' ? 50 : 200;
  
  const { error: userError } = await supabase
    .from('users')
    .update({
      is_premium: true,
      usage_limit: usageLimit
    })
    .eq('subscription_id', subscriptionId);

  if (userError) throw new Error(userError.message);

  return data;
};

export const checkExpiredSubscriptions = async (): Promise<void> => {
  const { error } = await supabase.rpc('check_expired_subscriptions');
  if (error) throw new Error(error.message);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getDaysUntilExpiry = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};