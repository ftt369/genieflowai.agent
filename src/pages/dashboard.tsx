import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import SubscriptionUsage from '../components/SubscriptionUsage';
import { getCurrentSubscription } from '../services/subscription';
import { UserSubscription } from '../types/subscription';

export default function Dashboard() {
  const { user, loading: userLoading } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    // Fetch subscription data if user is logged in
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    if (!user) return;
    
    setSubscriptionLoading(true);
    try {
      const { subscription: userSubscription } = await getCurrentSubscription(user.id);
      setSubscription(userSubscription);
    } catch (err) {
      console.error('Error fetching subscription data:', err);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* First column - User stats */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Welcome, {user?.email}</h2>
              
              {/* Dashboard stats/metrics here */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Recent Activity</h3>
                  {/* Activity metrics here */}
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Quick Stats</h3>
                  {/* Quick stats here */}
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Recent Conversations</h3>
                {/* Recent conversations list here */}
              </div>
            </div>
          </div>
          
          {/* Second column - Subscription & quick actions */}
          <div>
            {/* Subscription status */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Subscription</h2>
              
              {subscriptionLoading ? (
                <div className="animate-pulse p-4">
                  <div className="h-4 bg-gray-700 rounded w-1/4 mb-6"></div>
                  <div className="h-6 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
                </div>
              ) : subscription ? (
                <div>
                  <div className="mb-4">
                    <span className="text-primary-400 font-semibold">
                      {subscription.planId.includes('free') 
                        ? 'Free Plan' 
                        : subscription.planId.includes('basic') 
                          ? 'Basic Plan' 
                          : subscription.planId.includes('pro') 
                            ? 'Professional Plan' 
                            : 'Enterprise Plan'}
                    </span>
                    <p className="text-gray-400 text-sm mt-1">
                      {subscription.status === 'active' 
                        ? 'Your subscription is active' 
                        : subscription.status === 'trialing' 
                          ? 'Your subscription is in trial' 
                          : subscription.status === 'past_due' 
                            ? 'Your payment is past due' 
                            : 'Subscription inactive'}
                    </p>
                  </div>
                  
                  {subscription.trialEnd && new Date(subscription.trialEnd) > new Date() && (
                    <div className="mb-4 text-sm bg-blue-900 text-blue-300 p-3 rounded-md">
                      Trial ends on {new Date(subscription.trialEnd).toLocaleDateString()}
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <button 
                      onClick={() => window.location.href = '/account/billing'} 
                      className="text-primary-400 text-sm hover:text-primary-300"
                    >
                      Manage subscription →
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-4">No active subscription</p>
                  <button 
                    onClick={() => window.location.href = '/pricing'} 
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
                  >
                    View Plans
                  </button>
                </div>
              )}
            </div>
            
            {/* Usage metrics */}
            {user && subscription && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <SubscriptionUsage userId={user.id} />
              </div>
            )}
            
            {/* Quick actions */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
              <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg text-center"
                  onClick={() => window.location.href = '/chat/new'}
                >
                  New Chat
                </button>
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg text-center"
                  onClick={() => window.location.href = '/knowledge'}
                >
                  Knowledge Base
                </button>
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg text-center"
                  onClick={() => window.location.href = '/agents'}
                >
                  Agents
                </button>
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg text-center"
                  onClick={() => window.location.href = '/settings'}
                >
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 