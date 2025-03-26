import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { UserSubscription, PaymentMethod, Invoice } from '../../types/subscription';
import { getCurrentSubscription, createCustomerPortalSession, getUserPaymentMethods, getUserInvoices } from '../../services/subscription';
import Layout from '../../components/layout/Layout';

export default function BillingPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for success parameter in URL
  const { success } = router.query;
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        router.replace('/account/billing', undefined, { shallow: true });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [success, router]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/signin?callbackUrl=/account/billing');
      return;
    }

    if (!userLoading && user) {
      fetchBillingData();
    }
  }, [user, userLoading, router]);

  const fetchBillingData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      // Get current subscription
      const { subscription: currentSub, error: subError } = await getCurrentSubscription(user.id);
      
      if (subError) throw subError;
      setSubscription(currentSub);

      // Get payment methods
      const methods = await getUserPaymentMethods(user.id);
      setPaymentMethods(methods);

      // Get invoices
      const userInvoices = await getUserInvoices(user.id);
      setInvoices(userInvoices);
    } catch (err: any) {
      console.error('Error fetching billing data:', err);
      setError(err.message || 'Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!user) return;
    
    try {
      const { url, error } = await createCustomerPortalSession(user.id);
      
      if (error) throw error;
      
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      console.error('Error creating portal session:', err);
      setError(err.message || 'Failed to open billing portal');
    }
  };

  const handleChangePlan = () => {
    router.push('/pricing');
  };

  if (userLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl text-white">
        <h1 className="text-3xl font-bold mb-6">Billing & Subscription</h1>

        {showSuccess && (
          <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded-md mb-6">
            Your subscription has been updated successfully.
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-700 mb-8">
          <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
            <h2 className="text-xl font-semibold">Subscription Details</h2>
          </div>
          
          <div className="p-6">
            {subscription ? (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {subscription.planId.includes('free') 
                        ? 'Free Plan' 
                        : subscription.planId.includes('basic') 
                          ? 'Basic Plan' 
                          : subscription.planId.includes('pro') 
                            ? 'Professional Plan' 
                            : 'Enterprise Plan'}
                    </h3>
                    <p className="text-gray-400">
                      {subscription.status === 'active' 
                        ? 'Your subscription is active.' 
                        : subscription.status === 'trialing' 
                          ? 'Your subscription is in trial period.' 
                          : subscription.status === 'past_due' 
                            ? 'Your payment is past due.' 
                            : subscription.status === 'canceled' 
                              ? 'Your subscription is canceled.' 
                              : 'Your subscription is incomplete.'}
                    </p>
                    <p className="text-gray-400 mt-1">
                      Next billing date: {subscription.nextPaymentDate 
                        ? new Date(subscription.nextPaymentDate).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleChangePlan}
                      className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Change Plan
                    </button>
                    <button
                      onClick={handleManageBilling}
                      className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                    >
                      Manage Billing
                    </button>
                  </div>
                </div>
                
                {subscription.cancelAt && (
                  <div className="bg-orange-900 border border-orange-700 text-orange-300 px-4 py-3 rounded-md mb-4">
                    Your subscription is scheduled to be canceled on {new Date(subscription.cancelAt).toLocaleDateString()}.
                    You will still have access until this date.
                  </div>
                )}
                
                {subscription.trialEnd && new Date(subscription.trialEnd) > new Date() && (
                  <div className="bg-blue-900 border border-blue-700 text-blue-300 px-4 py-3 rounded-md">
                    Your trial period ends on {new Date(subscription.trialEnd).toLocaleDateString()}.
                    You will be charged after this date unless you cancel.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">You don't have an active subscription.</p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                >
                  View Plans
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-700 mb-8">
          <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
            <h2 className="text-xl font-semibold">Payment Methods</h2>
          </div>
          
          <div className="p-6">
            {paymentMethods.length > 0 ? (
              <div>
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between border-b border-gray-700 last:border-b-0 py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center">
                      {method.type === 'card' && (
                        <div className="mr-4">
                          {method.details.brand === 'visa' && (
                            <div className="bg-blue-600 text-white font-bold rounded px-2 py-1">VISA</div>
                          )}
                          {method.details.brand === 'mastercard' && (
                            <div className="bg-red-600 text-white font-bold rounded px-2 py-1">MC</div>
                          )}
                          {method.details.brand === 'amex' && (
                            <div className="bg-blue-800 text-white font-bold rounded px-2 py-1">AMEX</div>
                          )}
                          {!['visa', 'mastercard', 'amex'].includes(method.details.brand || '') && (
                            <div className="bg-gray-600 text-white font-bold rounded px-2 py-1">CARD</div>
                          )}
                        </div>
                      )}
                      
                      <div>
                        <p className="font-medium">
                          {method.type === 'card' 
                            ? `${method.details.brand?.toUpperCase()} **** ${method.details.last4}` 
                            : method.type === 'paypal' 
                              ? 'PayPal' 
                              : 'Bank Account'}
                        </p>
                        {method.type === 'card' && method.details.expiryMonth && method.details.expiryYear && (
                          <p className="text-gray-400 text-sm">
                            Expires {method.details.expiryMonth}/{method.details.expiryYear}
                          </p>
                        )}
                        {method.isDefault && (
                          <p className="text-xs text-primary-400 font-medium mt-1">Default</p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleManageBilling}
                      className="text-gray-400 hover:text-primary-400"
                    >
                      Update
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={handleManageBilling}
                  className="mt-4 text-primary-400 font-medium text-sm hover:text-primary-300"
                >
                  + Add Payment Method
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">No payment methods on file.</p>
                <button
                  onClick={handleManageBilling}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Add Payment Method
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-700">
          <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
            <h2 className="text-xl font-semibold">Billing History</h2>
          </div>
          
          <div className="p-6">
            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 font-semibold text-gray-400 text-sm">Date</th>
                      <th className="text-left py-2 font-semibold text-gray-400 text-sm">Description</th>
                      <th className="text-left py-2 font-semibold text-gray-400 text-sm">Amount</th>
                      <th className="text-left py-2 font-semibold text-gray-400 text-sm">Status</th>
                      <th className="text-left py-2 font-semibold text-gray-400 text-sm"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-700 last:border-b-0">
                        <td className="py-3 text-sm">
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-sm">
                          {invoice.billingReason === 'subscription_create' 
                            ? 'Subscription Created' 
                            : invoice.billingReason === 'subscription_cycle'
                              ? 'Subscription Renewal'
                              : 'Payment'}
                        </td>
                        <td className="py-3 text-sm">
                          ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                        </td>
                        <td className="py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid' 
                              ? 'bg-green-900 text-green-300' 
                              : invoice.status === 'open'
                                ? 'bg-blue-900 text-blue-300'
                                : invoice.status === 'void'
                                  ? 'bg-gray-700 text-gray-300'
                                  : 'bg-red-900 text-red-300'
                          }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 text-sm">
                          {invoice.pdfUrl && (
                            <a 
                              href={invoice.pdfUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-400 hover:text-primary-300"
                            >
                              Download
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400">No billing history available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 