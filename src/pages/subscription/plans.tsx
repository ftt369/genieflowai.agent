import { useState } from 'react';
import { useRouter } from 'next/router';
import { monthlyPlans, yearlyPlans } from '../../data/subscriptionPlans';
import { SubscriptionPeriod, SubscriptionPlan, SubscriptionTier } from '../../types/subscription';
import { createCheckoutSession } from '../../services/subscription';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/layout/Layout';
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';

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

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DisplayPlan | null>(null);
  
  // Default to monthly plans
  const [billingPeriod, setBillingPeriod] = useState<SubscriptionPeriod>(SubscriptionPeriod.MONTHLY);
  const plans = billingPeriod === SubscriptionPeriod.MONTHLY ? monthlyPlans : yearlyPlans;

  const handleSelectPlan = async (plan: DisplayPlan) => {
    if (!user) {
      router.push('/auth/signin?redirect=/subscription/plans');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan);

    try {
      // Create checkout session
      const { url, error } = await createCheckoutSession(user.id, plan.id);

      if (error) {
        console.error('Error creating checkout session:', error);
        alert('Error creating checkout session. Please try again.');
        return;
      }

      if (url) {
        // Redirect to checkout
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Error selecting plan. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select the plan that best fits your needs. All plans include access to core features.
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="bg-card border rounded-lg p-1">
            <div className="grid grid-cols-2 gap-1">
              <button 
                className={`px-4 py-2 rounded-md ${billingPeriod === SubscriptionPeriod.MONTHLY 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-muted'}`}
                onClick={() => setBillingPeriod(SubscriptionPeriod.MONTHLY)}
              >
                Monthly
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${billingPeriod === SubscriptionPeriod.YEARLY 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-muted'}`}
                onClick={() => setBillingPeriod(SubscriptionPeriod.YEARLY)}
              >
                Yearly (Save 20%)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto mt-8">
          {plans.map((plan) => {
            const isPro = plan.tier === SubscriptionTier.PRO;
            
            return (
              <div key={plan.id} className={`
                rounded-lg border overflow-hidden
                ${isPro ? 'border-primary shadow-lg scale-105 md:scale-105 z-10' : 'border-border shadow'} 
                transition-all
              `}>
                {isPro && (
                  <div className="bg-primary text-primary-foreground text-xs font-semibold text-center py-1">
                    MOST POPULAR
                  </div>
                )}
                
                <div className={`p-6 ${isPro ? 'bg-primary/5' : 'bg-card'}`}>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      ${(plan.price / 100).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">/{billingPeriod === SubscriptionPeriod.MONTHLY ? 'month' : 'year'}</span>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature.id} className="flex items-start">
                        <div className="mr-2 mt-1">
                          {feature.included ? (
                            <CheckIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <span className="h-5 w-5 block text-center text-muted-foreground">-</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{feature.name}</p>
                          {feature.limit && feature.included && (
                            <p className="text-xs text-muted-foreground">
                              {feature.limit.toLocaleString()} {feature.description.toLowerCase()}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 border-t">
                  <button
                    className={`w-full px-4 py-2 rounded-md flex items-center justify-center ${
                      isPro 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                    }`}
                    disabled={loading}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {loading && selectedPlan && selectedPlan.id === plan.id ? (
                      <span className="mr-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    ) : (
                      "Select Plan"
                    )}
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Enterprise Solutions</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Need a custom solution for your enterprise? Contact our sales team for custom pricing
            and features tailored to your organization's needs.
          </p>
          <button 
            className="px-6 py-3 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground"
            onClick={() => router.push('/contact')}
          >
            Contact Sales
          </button>
        </div>
      </div>
    </Layout>
  );
} 