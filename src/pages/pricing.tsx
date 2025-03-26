import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionPeriod, SubscriptionTier } from '../types/subscription';
import { monthlyPlans, yearlyPlans } from '../data/subscriptionPlans';
import Layout from '../components/layout/Layout';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<SubscriptionPeriod>(SubscriptionPeriod.MONTHLY);

  const plans = billingPeriod === SubscriptionPeriod.MONTHLY ? monthlyPlans : yearlyPlans;

  const handlePlanSelect = (planId: string) => {
    if (user) {
      router.push(`/checkout?planId=${planId}`);
    } else {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/checkout?planId=${planId}`)}`);
    }
  };

  const getTierDescription = (tier: SubscriptionTier): string => {
    switch (tier) {
      case SubscriptionTier.FREE:
        return 'For individuals getting started with AI assistants';
      case SubscriptionTier.BASIC:
        return 'For individuals who need more capacity and features';
      case SubscriptionTier.PRO:
        return 'For professionals who need advanced features and team collaboration';
      case SubscriptionTier.ENTERPRISE:
        return 'For organizations that need maximum capacity and premium features';
      default:
        return '';
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-b from-indigo-50 to-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Choose the Right Plan for Your Needs
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with our free plan or upgrade to access more features, capacity, and capabilities.
              All plans include a 14-day money-back guarantee.
            </p>

            {/* Billing period toggle */}
            <div className="flex items-center justify-center mt-8">
              <span className={`mr-3 text-base ${billingPeriod === SubscriptionPeriod.MONTHLY ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                type="button"
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  ${billingPeriod === SubscriptionPeriod.YEARLY ? 'bg-indigo-600' : 'bg-gray-200'}
                `}
                onClick={() => setBillingPeriod(billingPeriod === SubscriptionPeriod.MONTHLY ? SubscriptionPeriod.YEARLY : SubscriptionPeriod.MONTHLY)}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                    transition duration-200 ease-in-out
                    ${billingPeriod === SubscriptionPeriod.YEARLY ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
              <span className={`ml-3 text-base ${billingPeriod === SubscriptionPeriod.YEARLY ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                Yearly <span className="text-green-600 font-semibold">(Save 20%)</span>
              </span>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`
                  flex flex-col rounded-lg shadow-md overflow-hidden
                  ${plan.tier === SubscriptionTier.PRO ? 'border-2 border-indigo-500' : 'border border-gray-200'}
                `}
              >
                {/* Add a popular tag manually for Pro plan */}
                {plan.tier === SubscriptionTier.PRO && (
                  <div className="bg-indigo-500 text-white text-center text-sm uppercase font-bold py-1">
                    Most Popular
                  </div>
                )}
                
                <div className="bg-white px-6 py-8">
                  <h3 className={`text-xl font-semibold mb-1 ${plan.tier === SubscriptionTier.PRO ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {getTierDescription(plan.tier)}
                  </p>
                  
                  <div className="flex items-end mb-4">
                    <span className="text-4xl font-bold text-gray-900">${(plan.price / 100).toFixed(2)}</span>
                    <span className="text-gray-500 ml-1">/{billingPeriod.toLowerCase()}</span>
                  </div>
                  
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`
                      w-full py-3 rounded-lg transition-colors text-center font-medium
                      ${plan.tier === SubscriptionTier.FREE ? 
                        'bg-gray-100 text-gray-800 hover:bg-gray-200' : 
                        'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                      }
                    `}
                  >
                    {plan.tier === SubscriptionTier.FREE ? 'Get Started' : 'Select Plan'}
                  </button>
                </div>
                
                <div className="px-6 py-6 border-t border-gray-100">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature.id} className="flex items-start">
                        <div className="mr-3 mt-1">
                          {feature.included ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${plan.tier === SubscriptionTier.PRO ? 'text-indigo-600' : 'text-green-500'}`} viewBox="0 0 20 20" fill="currentColor">
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
                              {feature.limit === Infinity ? 'Unlimited' : feature.limit.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-lg mb-2">Can I upgrade or downgrade my plan later?</h3>
                <p className="text-gray-600">Yes, you can change your subscription plan at any time. When upgrading, you'll be charged the prorated difference for the remainder of your billing cycle. When downgrading, the change will take effect at the start of your next billing cycle.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-lg mb-2">Is there a free trial?</h3>
                <p className="text-gray-600">All paid plans include a 14-day free trial. You can cancel anytime during this period and won't be charged.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. Enterprise plans can also pay via invoice.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-lg mb-2">How secure is my payment information?</h3>
                <p className="text-gray-600">We use Stripe for payment processing, which is PCI compliant and uses industry-standard encryption to protect your payment information. We never store your full credit card details on our servers.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">Still have questions about our pricing?</p>
            <button
              onClick={() => router.push('/contact')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 