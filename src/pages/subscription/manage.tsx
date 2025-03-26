import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { 
  getSubscriptionDetails, 
  getUserInvoices, 
  createPortalSession, 
  cancelSubscription,
  getFeatureUsage
} from '../../services/subscription';
import { SubscriptionPlan, UserSubscription, Invoice } from '../../types/subscription';
import { format } from 'date-fns';

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usageData, setUsageData] = useState<{[key: string]: number}>({});
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin?callbackUrl=/subscription/manage');
      return;
    }

    const fetchSubscriptionData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get subscription details
        const { subscription: sub, plan: currentPlan } = await getSubscriptionDetails(user.id);
        setSubscription(sub);
        setPlan(currentPlan);

        // Get invoices if subscription exists
        if (sub) {
          const invoiceData = await getUserInvoices(user.id);
          setInvoices(invoiceData);

          // Get usage data for each feature
          const usage: {[key: string]: number} = {};
          for (const feature of currentPlan.features) {
            if (feature.limit && feature.included) {
              const featureUsage = await getFeatureUsage(user.id, feature.id);
              usage[feature.id] = featureUsage;
            }
          }
          setUsageData(usage);
        }
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setError('Failed to load subscription data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user, router]);

  const handleManageBilling = async () => {
    if (!user || !subscription) return;

    setIsLoadingAction(true);
    try {
      const { url, error: portalError } = await createPortalSession(user.id);
      
      if (portalError) {
        throw new Error(portalError.message);
      }
      
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Error creating portal session:', err);
      setError('Failed to open customer portal. Please try again.');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;

    // Ask for confirmation
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.'
    );

    if (!confirmed) return;

    setIsLoadingAction(true);
    try {
      const { success, error: cancelError } = await cancelSubscription(
        subscription.stripeSubscriptionId || '',
        false // Cancel at period end
      );
      
      if (cancelError) {
        throw new Error(cancelError.message);
      }
      
      if (success) {
        // Refresh subscription data
        const { subscription: sub, plan: currentPlan } = await getSubscriptionDetails(user.id);
        setSubscription(sub);
        setPlan(currentPlan);
        
        alert('Your subscription has been canceled. You will have access until the end of your current billing period.');
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleChangePlan = () => {
    router.push('/subscription/plans');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading subscription information...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your subscription details
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-8">
            {error}
          </div>
        )}

        <div className="bg-card border rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
            
            {subscription ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium">{plan?.name}</h3>
                    <p className="text-muted-foreground">{plan?.description}</p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <span className="text-lg font-bold">${(plan?.price || 0) / 100}</span>
                    <span className="text-muted-foreground">/{plan?.period.toLowerCase()}</span>
                  </div>
                </div>

                <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">
                      {subscription.status === 'canceled' || (subscription.cancelAt && new Date(subscription.cancelAt) <= new Date())
                        ? 'Canceled'
                        : subscription.status === 'active' && subscription.cancelAt
                        ? 'Active (Cancels at period end)'
                        : subscription.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next billing date</p>
                    {subscription.currentPeriodEnd ? (
                      <p className="font-medium">
                        {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
                      </p>
                    ) : (
                      <p className="font-medium">N/A</p>
                    )}
                  </div>
                </div>

                {/* Feature usage section */}
                {plan && plan.features.some(f => f.limit && f.included) && (
                  <div className="border-t pt-4 mb-6">
                    <h4 className="font-medium mb-3">Usage</h4>
                    <div className="space-y-3">
                      {plan.features.filter(f => f.limit && f.included).map(feature => {
                        const used = usageData[feature.id] || 0;
                        const limit = feature.limit || 0;
                        const percentage = Math.min(Math.round((used / limit) * 100), 100);
                        
                        return (
                          <div key={feature.id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{feature.name}</span>
                              <span>
                                {used.toLocaleString()} / {limit.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${percentage > 90 ? 'bg-destructive' : 'bg-primary'}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    onClick={handleManageBilling}
                    disabled={isLoadingAction}
                  >
                    {isLoadingAction ? 'Loading...' : 'Manage Billing'}
                  </button>
                  <button
                    className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring/50"
                    onClick={handleChangePlan}
                    disabled={isLoadingAction}
                  >
                    Change Plan
                  </button>
                  {subscription.status === 'active' && !subscription.cancelAt && (
                    <button
                      className="px-4 py-2 border border-destructive text-destructive hover:bg-destructive/10 rounded-md focus:outline-none focus:ring-2 focus:ring-destructive/50"
                      onClick={handleCancelSubscription}
                      disabled={isLoadingAction}
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4">You don't have an active subscription.</p>
                <button
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none"
                  onClick={handleChangePlan}
                >
                  View Plans
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Invoices section */}
        {invoices.length > 0 && (
          <div className="bg-card border rounded-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Billing History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-3 font-medium">Date</th>
                      <th className="text-left pb-3 font-medium">Amount</th>
                      <th className="text-left pb-3 font-medium">Status</th>
                      <th className="text-left pb-3 font-medium">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="border-b last:border-b-0">
                        <td className="py-4">
                          {format(new Date(invoice.invoiceDate), 'MMMM d, yyyy')}
                        </td>
                        <td className="py-4">
                          {(invoice.amount / 100).toLocaleString('en-US', {
                            style: 'currency',
                            currency: invoice.currency.toUpperCase()
                          })}
                        </td>
                        <td className="py-4 capitalize">{invoice.status}</td>
                        <td className="py-4">
                          {invoice.pdfUrl ? (
                            <a
                              href={invoice.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Download
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 