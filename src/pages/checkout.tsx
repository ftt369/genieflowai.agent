import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../hooks/useAuth';
import { getPlanById } from '../data/subscriptionPlans';
import { SubscriptionPeriod, SubscriptionPlan, SubscriptionTier } from '../types/subscription';
import { createCheckoutSession } from '../services/subscription';
import Layout from '../components/layout/Layout';

// Define the type that matches the actual structure of our plans from subscriptionPlans.ts
type DisplayPlan = {
  id: string;
  name: string;
  description: string;
  tier: SubscriptionTier;
  period: SubscriptionPeriod;
  price: number;
  features: any[];
  stripe: {
    monthlyPriceId: string;
    yearlyPriceId: string;
  };
};

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function CheckoutPage() {
  const router = useRouter();
  const { planId } = router.query;
  const { user, loading: userLoading } = useAuth();

  const [plan, setPlan] = useState<DisplayPlan | null>(null);
  const [addons, setAddons] = useState<string[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) return;

    const selectedPlan = getPlanById(planId as string) as unknown as DisplayPlan;
    if (selectedPlan) {
      setPlan(selectedPlan);
      setIsYearly(selectedPlan.period === SubscriptionPeriod.YEARLY);
    } else {
      setError('Invalid subscription plan');
    }
  }, [planId]);

  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!userLoading && !user) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/checkout?planId=${planId}`)}`);
    }
  }, [user, userLoading, router, planId]);

  const handlePeriodToggle = () => {
    if (!plan) return;
    
    // Toggle between monthly and yearly plans
    const newPeriod = isYearly ? SubscriptionPeriod.MONTHLY : SubscriptionPeriod.YEARLY;
    
    // Extract base plan ID without period
    const basePlanId = plan.id.split('-')[0];
    
    // Construct new plan ID
    const newPlanId = `${basePlanId}-${newPeriod.toLowerCase()}`;
    
    const newPlan = getPlanById(newPlanId) as unknown as DisplayPlan;
    if (newPlan) {
      setPlan(newPlan);
      setIsYearly(!isYearly);
    }
  };

  const handleCheckout = async () => {
    if (!user || !plan) return;

    setLoading(true);
    setError(null);

    try {
      const { url, error: sessionError } = await createCheckoutSession(user.id, plan.id, addons);

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      if (url) {
        window.location.href = url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!plan) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Plan not found</h1>
            <p className="text-gray-500 mb-6">The subscription plan you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/pricing')}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Complete Your Subscription</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">{plan.name} Plan</h3>
                    <p className="text-gray-500 text-sm">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(plan.price / 100).toFixed(2)}</p>
                    <p className="text-gray-500 text-sm">/{plan.period.toLowerCase()}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Billing Period</span>
                    <div className="flex items-center">
                      <span className={`mr-2 ${!isYearly ? 'font-semibold' : 'text-gray-500'}`}>Monthly</span>
                      <button
                        type="button"
                        className={`
                          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                          ${isYearly ? 'bg-primary-500' : 'bg-gray-200'}
                        `}
                        onClick={handlePeriodToggle}
                      >
                        <span
                          className={`
                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                            transition duration-200 ease-in-out
                            ${isYearly ? 'translate-x-5' : 'translate-x-0'}
                          `}
                        />
                      </button>
                      <span className={`ml-2 ${isYearly ? 'font-semibold' : 'text-gray-500'}`}>Yearly (Save 20%)</span>
                    </div>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${(plan.price / 100).toFixed(2)} /{plan.period.toLowerCase()}</span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mt-2">
                    {plan.period === SubscriptionPeriod.YEARLY 
                      ? 'Billed annually. Next payment will be in 12 months.' 
                      : 'Billed monthly. Next payment will be in 30 days.'}
                  </p>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-70"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
                
                <p className="text-center text-gray-500 text-sm mt-4">
                  You will be redirected to Stripe to complete your payment securely.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Plan Features</h2>
              </div>
              
              <div className="p-6">
                <ul className="space-y-4">
                  {plan.features.map((feature: any) => (
                    <li key={feature.id} className="flex items-start">
                      <div className="mr-3 mt-1">
                        {feature.included ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{feature.name}</p>
                        {feature.limit && feature.included && (
                          <p className="text-sm text-gray-500">
                            {feature.limit.toLocaleString()} {feature.description.toLowerCase()}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Satisfaction Guaranteed</h3>
              <p className="text-blue-700 text-sm">
                All plans come with a 14-day free trial. Cancel anytime during your trial 
                period and you won't be charged.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">Have questions about our plans?</p>
          <button
            onClick={() => router.push('/contact')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </Layout>
  );
} 