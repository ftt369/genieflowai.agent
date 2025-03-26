import { SubscriptionPeriod, SubscriptionPlan, SubscriptionTier, AddonFeature } from '../types/subscription';

// Monthly plans
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    tier: SubscriptionTier.FREE,
    name: 'Free',
    description: 'Basic features for personal use',
    stripe: {
      monthlyPriceId: '',
      yearlyPriceId: ''
    },
    price: {
      [SubscriptionPeriod.MONTHLY]: 0,
      [SubscriptionPeriod.YEARLY]: 0
    },
    features: {
      'chat-messages': {
        id: 'chat-messages',
        name: 'Chat Messages',
        description: 'Number of AI messages per month',
        type: 'limited',
        included: true,
        limit: 50
      },
      'knowledge-bases': {
        id: 'knowledge-bases',
        name: 'Knowledge Bases',
        description: 'Number of knowledge bases',
        type: 'limited',
        included: true,
        limit: 1
      },
      'file-storage': {
        id: 'file-storage',
        name: 'File Storage',
        description: 'Storage for documents and files',
        type: 'limited',
        included: true,
        limit: 100 // MB
      },
      'custom-agents': {
        id: 'custom-agents',
        name: 'Custom Agents',
        description: 'Create custom AI agents',
        type: 'boolean',
        included: false
      },
      'team-members': {
        id: 'team-members',
        name: 'Team Members',
        description: 'Collaborate with team members',
        type: 'boolean',
        included: false
      },
      'workflow-automation': {
        id: 'workflow-automation',
        name: 'Workflow Automation',
        description: 'Create automated workflows',
        type: 'boolean',
        included: false
      },
      'premium-models': {
        id: 'premium-models',
        name: 'Premium AI Models',
        description: 'Access to advanced AI models',
        type: 'boolean',
        included: false
      },
      'api-access': {
        id: 'api-access',
        name: 'API Access',
        description: 'Access to the GenieAgent API',
        type: 'boolean',
        included: false
      }
    }
  },
  {
    id: 'basic',
    tier: SubscriptionTier.BASIC,
    name: 'Basic',
    description: 'Essential features for professionals',
    stripe: {
      monthlyPriceId: 'price_monthly_basic',
      yearlyPriceId: 'price_yearly_basic'
    },
    price: {
      [SubscriptionPeriod.MONTHLY]: 1499, // $14.99
      [SubscriptionPeriod.YEARLY]: 14390 // $143.90, 20% off
    },
    features: {
      'chat-messages': {
        id: 'chat-messages',
        name: 'Chat Messages',
        description: 'Number of AI messages per month',
        type: 'limited',
        included: true,
        limit: 500
      },
      'knowledge-bases': {
        id: 'knowledge-bases',
        name: 'Knowledge Bases',
        description: 'Number of knowledge bases',
        type: 'limited',
        included: true,
        limit: 5
      },
      'file-storage': {
        id: 'file-storage',
        name: 'File Storage',
        description: 'Storage for documents and files',
        type: 'limited',
        included: true,
        limit: 1024 // 1GB
      },
      'custom-agents': {
        id: 'custom-agents',
        name: 'Custom Agents',
        description: 'Create custom AI agents',
        type: 'limited',
        included: true,
        limit: 3
      },
      'team-members': {
        id: 'team-members',
        name: 'Team Members',
        description: 'Collaborate with team members',
        type: 'boolean',
        included: false
      },
      'workflow-automation': {
        id: 'workflow-automation',
        name: 'Workflow Automation',
        description: 'Create automated workflows',
        type: 'limited',
        included: true,
        limit: 5
      },
      'premium-models': {
        id: 'premium-models',
        name: 'Premium AI Models',
        description: 'Access to advanced AI models',
        type: 'boolean',
        included: false
      },
      'api-access': {
        id: 'api-access',
        name: 'API Access',
        description: 'Access to the GenieAgent API',
        type: 'boolean',
        included: false
      }
    }
  },
  {
    id: 'pro',
    tier: SubscriptionTier.PRO,
    name: 'Professional',
    description: 'Advanced features for power users',
    stripe: {
      monthlyPriceId: 'price_monthly_pro',
      yearlyPriceId: 'price_yearly_pro'
    },
    price: {
      [SubscriptionPeriod.MONTHLY]: 2999, // $29.99
      [SubscriptionPeriod.YEARLY]: 28790 // $287.90, 20% off
    },
    features: {
      'chat-messages': {
        id: 'chat-messages',
        name: 'Chat Messages',
        description: 'Number of AI messages per month',
        type: 'limited',
        included: true,
        limit: 2000
      },
      'knowledge-bases': {
        id: 'knowledge-bases',
        name: 'Knowledge Bases',
        description: 'Number of knowledge bases',
        type: 'limited',
        included: true,
        limit: 20
      },
      'file-storage': {
        id: 'file-storage',
        name: 'File Storage',
        description: 'Storage for documents and files',
        type: 'limited',
        included: true,
        limit: 10240 // 10GB
      },
      'custom-agents': {
        id: 'custom-agents',
        name: 'Custom Agents',
        description: 'Create custom AI agents',
        type: 'limited',
        included: true,
        limit: 10
      },
      'team-members': {
        id: 'team-members',
        name: 'Team Members',
        description: 'Collaborate with team members',
        type: 'limited',
        included: true,
        limit: 3
      },
      'workflow-automation': {
        id: 'workflow-automation',
        name: 'Workflow Automation',
        description: 'Create automated workflows',
        type: 'limited',
        included: true,
        limit: 20
      },
      'premium-models': {
        id: 'premium-models',
        name: 'Premium AI Models',
        description: 'Access to advanced AI models',
        type: 'boolean',
        included: true
      },
      'api-access': {
        id: 'api-access',
        name: 'API Access',
        description: 'Access to the GenieAgent API',
        type: 'limited',
        included: true,
        limit: 1000 // API calls per month
      }
    }
  },
  {
    id: 'enterprise',
    tier: SubscriptionTier.ENTERPRISE,
    name: 'Enterprise',
    description: 'Custom solutions for organizations',
    stripe: {
      monthlyPriceId: 'price_monthly_enterprise',
      yearlyPriceId: 'price_yearly_enterprise'
    },
    price: {
      [SubscriptionPeriod.MONTHLY]: 9999, // $99.99
      [SubscriptionPeriod.YEARLY]: 95990 // $959.90, 20% off
    },
    features: {
      'chat-messages': {
        id: 'chat-messages',
        name: 'Chat Messages',
        description: 'Number of AI messages per month',
        type: 'limited',
        included: true,
        limit: 10000
      },
      'knowledge-bases': {
        id: 'knowledge-bases',
        name: 'Knowledge Bases',
        description: 'Number of knowledge bases',
        type: 'limited',
        included: true,
        limit: 100
      },
      'file-storage': {
        id: 'file-storage',
        name: 'File Storage',
        description: 'Storage for documents and files',
        type: 'limited',
        included: true,
        limit: 102400 // 100GB
      },
      'custom-agents': {
        id: 'custom-agents',
        name: 'Custom Agents',
        description: 'Create custom AI agents',
        type: 'limited',
        included: true,
        limit: 50
      },
      'team-members': {
        id: 'team-members',
        name: 'Team Members',
        description: 'Collaborate with team members',
        type: 'limited',
        included: true,
        limit: 10
      },
      'workflow-automation': {
        id: 'workflow-automation',
        name: 'Workflow Automation',
        description: 'Create automated workflows',
        type: 'limited',
        included: true,
        limit: 100
      },
      'premium-models': {
        id: 'premium-models',
        name: 'Premium AI Models',
        description: 'Access to advanced AI models',
        type: 'boolean',
        included: true
      },
      'api-access': {
        id: 'api-access',
        name: 'API Access',
        description: 'Access to the GenieAgent API',
        type: 'limited',
        included: true,
        limit: 10000 // API calls per month
      },
      'priority-support': {
        id: 'priority-support',
        name: 'Priority Support',
        description: 'Priority customer support',
        type: 'boolean',
        included: true
      },
      'custom-branding': {
        id: 'custom-branding',
        name: 'Custom Branding',
        description: 'Custom branding options',
        type: 'boolean',
        included: true
      },
      'advanced-analytics': {
        id: 'advanced-analytics',
        name: 'Advanced Analytics',
        description: 'Advanced analytics and reporting',
        type: 'boolean',
        included: true
      }
    }
  }
];

// Export addon features
export const addonFeatures: AddonFeature[] = [
  {
    id: 'additional-storage',
    name: 'Additional Storage',
    description: 'Add 5GB of additional storage',
    price: 499, // $4.99
    billingPeriod: SubscriptionPeriod.MONTHLY
  },
  {
    id: 'additional-team-member',
    name: 'Additional Team Member',
    description: 'Add an additional team member',
    price: 999, // $9.99
    billingPeriod: SubscriptionPeriod.MONTHLY
  },
  {
    id: 'premium-support',
    name: 'Premium Support',
    description: 'Access to priority support',
    price: 1999, // $19.99
    billingPeriod: SubscriptionPeriod.MONTHLY
  },
  {
    id: 'additional-api',
    name: 'Additional API Calls',
    description: 'Add 1000 additional API calls',
    price: 999, // $9.99
    billingPeriod: SubscriptionPeriod.MONTHLY
  },
  {
    id: 'white-labeling',
    name: 'White Labeling',
    description: 'Remove GenieAgent branding',
    price: 4999, // $49.99
    billingPeriod: SubscriptionPeriod.MONTHLY
  }
];

// Helper function to get a plan by ID
export const getPlanById = (planId: string): any => {
  // First try to find in new format
  const directPlan = subscriptionPlans.find(plan => plan.id === planId);
  if (directPlan) return directPlan;
  
  // If not found, try the backward compatibility arrays
  return allSubscriptionPlans.find(plan => plan.id === planId);
};

// Helper functions to maintain backward compatibility
export const monthlyPlans = subscriptionPlans.map(plan => ({
  ...plan,
  id: `${plan.id}-monthly`,
  period: SubscriptionPeriod.MONTHLY,
  price: plan.price[SubscriptionPeriod.MONTHLY],
  features: Object.values(plan.features)
}));

export const yearlyPlans = subscriptionPlans.map(plan => ({
  ...plan,
  id: `${plan.id}-yearly`,
  period: SubscriptionPeriod.YEARLY,
  price: plan.price[SubscriptionPeriod.YEARLY],
  description: plan.tier === SubscriptionTier.FREE ? plan.description : `${plan.description} (Save 20%)`,
  features: Object.values(plan.features)
}));

// For backward compatibility
export const allSubscriptionPlans = [...monthlyPlans, ...yearlyPlans]; 