import { SubscriptionPlan, SubscriptionTier, SubscriptionPeriod, Feature } from '../types/subscription';

// Define available features
export const FEATURES: Record<string, Feature> = {
  CHAT_MESSAGES: {
    id: 'chat_messages',
    name: 'Chat Messages',
    description: 'Number of AI chat messages per month',
    type: 'limited',
  },
  PREMIUM_MODELS: {
    id: 'premium_models',
    name: 'Premium AI Models',
    description: 'Access to premium AI models like GPT-4',
    type: 'boolean',
  },
  PRIORITY_ACCESS: {
    id: 'priority_access',
    name: 'Priority Access',
    description: 'Priority access during high traffic periods',
    type: 'boolean',
  },
  CUSTOM_PERSONAS: {
    id: 'custom_personas',
    name: 'Custom Personas',
    description: 'Create and save custom AI personas',
    type: 'boolean',
  },
  FILE_UPLOADS: {
    id: 'file_uploads',
    name: 'File Uploads',
    description: 'Upload files to analyze with AI',
    type: 'limited',
  },
  API_ACCESS: {
    id: 'api_access',
    name: 'API Access',
    description: 'Access to the API to integrate with your applications',
    type: 'boolean',
  },
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic access with limited features',
    tier: SubscriptionTier.FREE,
    stripe: {
      monthlyPriceId: '', // Free has no Stripe price
      yearlyPriceId: '',
    },
    price: {
      [SubscriptionPeriod.MONTHLY]: 0,
      [SubscriptionPeriod.YEARLY]: 0,
    },
    features: {
      [FEATURES.CHAT_MESSAGES.id]: {
        ...FEATURES.CHAT_MESSAGES,
        included: true,
        limit: 20,
        period: SubscriptionPeriod.MONTHLY,
      },
      [FEATURES.PREMIUM_MODELS.id]: {
        ...FEATURES.PREMIUM_MODELS,
        included: false,
      },
      [FEATURES.PRIORITY_ACCESS.id]: {
        ...FEATURES.PRIORITY_ACCESS,
        included: false,
      },
      [FEATURES.CUSTOM_PERSONAS.id]: {
        ...FEATURES.CUSTOM_PERSONAS,
        included: false,
      },
      [FEATURES.FILE_UPLOADS.id]: {
        ...FEATURES.FILE_UPLOADS,
        included: false,
      },
      [FEATURES.API_ACCESS.id]: {
        ...FEATURES.API_ACCESS,
        included: false,
      },
    },
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for casual users',
    tier: SubscriptionTier.BASIC,
    stripe: {
      monthlyPriceId: 'price_basic_monthly', // Replace with actual Stripe price ID
      yearlyPriceId: 'price_basic_yearly',   // Replace with actual Stripe price ID
    },
    price: {
      [SubscriptionPeriod.MONTHLY]: 9.99,
      [SubscriptionPeriod.YEARLY]: 99.99,
    },
    features: {
      [FEATURES.CHAT_MESSAGES.id]: {
        ...FEATURES.CHAT_MESSAGES,
        included: true,
        limit: 100,
        period: SubscriptionPeriod.MONTHLY,
      },
      [FEATURES.PREMIUM_MODELS.id]: {
        ...FEATURES.PREMIUM_MODELS,
        included: false,
      },
      [FEATURES.PRIORITY_ACCESS.id]: {
        ...FEATURES.PRIORITY_ACCESS,
        included: false,
      },
      [FEATURES.CUSTOM_PERSONAS.id]: {
        ...FEATURES.CUSTOM_PERSONAS,
        included: true,
      },
      [FEATURES.FILE_UPLOADS.id]: {
        ...FEATURES.FILE_UPLOADS,
        included: true,
        limit: 5,
        period: SubscriptionPeriod.MONTHLY,
      },
      [FEATURES.API_ACCESS.id]: {
        ...FEATURES.API_ACCESS,
        included: false,
      },
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Ideal for power users and professionals',
    tier: SubscriptionTier.PRO,
    stripe: {
      monthlyPriceId: 'price_pro_monthly', // Replace with actual Stripe price ID
      yearlyPriceId: 'price_pro_yearly',   // Replace with actual Stripe price ID
    },
    price: {
      [SubscriptionPeriod.MONTHLY]: 29.99,
      [SubscriptionPeriod.YEARLY]: 299.99,
    },
    features: {
      [FEATURES.CHAT_MESSAGES.id]: {
        ...FEATURES.CHAT_MESSAGES,
        included: true,
        limit: 500,
        period: SubscriptionPeriod.MONTHLY,
      },
      [FEATURES.PREMIUM_MODELS.id]: {
        ...FEATURES.PREMIUM_MODELS,
        included: true,
      },
      [FEATURES.PRIORITY_ACCESS.id]: {
        ...FEATURES.PRIORITY_ACCESS,
        included: true,
      },
      [FEATURES.CUSTOM_PERSONAS.id]: {
        ...FEATURES.CUSTOM_PERSONAS,
        included: true,
      },
      [FEATURES.FILE_UPLOADS.id]: {
        ...FEATURES.FILE_UPLOADS,
        included: true,
        limit: 20,
        period: SubscriptionPeriod.MONTHLY,
      },
      [FEATURES.API_ACCESS.id]: {
        ...FEATURES.API_ACCESS,
        included: false,
      },
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Maximum features for organizations',
    tier: SubscriptionTier.ENTERPRISE,
    stripe: {
      monthlyPriceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
      yearlyPriceId: 'price_enterprise_yearly',   // Replace with actual Stripe price ID
    },
    price: {
      [SubscriptionPeriod.MONTHLY]: 99.99,
      [SubscriptionPeriod.YEARLY]: 999.99,
    },
    features: {
      [FEATURES.CHAT_MESSAGES.id]: {
        ...FEATURES.CHAT_MESSAGES,
        included: true,
        limit: 5000,
        period: SubscriptionPeriod.MONTHLY,
      },
      [FEATURES.PREMIUM_MODELS.id]: {
        ...FEATURES.PREMIUM_MODELS,
        included: true,
      },
      [FEATURES.PRIORITY_ACCESS.id]: {
        ...FEATURES.PRIORITY_ACCESS,
        included: true,
      },
      [FEATURES.CUSTOM_PERSONAS.id]: {
        ...FEATURES.CUSTOM_PERSONAS,
        included: true,
      },
      [FEATURES.FILE_UPLOADS.id]: {
        ...FEATURES.FILE_UPLOADS,
        included: true,
        limit: 100,
        period: SubscriptionPeriod.MONTHLY,
      },
      [FEATURES.API_ACCESS.id]: {
        ...FEATURES.API_ACCESS,
        included: true,
      },
    },
  },
];

// Helper functions
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
}

export function getPlanByTier(tier: SubscriptionTier): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.tier === tier);
}

export function getDefaultPlan(): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[0]; // Free plan
}

export function getFeatureLimitByPlan(planId: string, featureId: string): number | null {
  const plan = getPlanById(planId);
  if (!plan) return null;

  const feature = plan.features[featureId];
  if (!feature || !feature.included) return null;

  return 'limit' in feature ? feature.limit : null;
}

export function hasFeatureAccess(planId: string, featureId: string): boolean {
  const plan = getPlanById(planId);
  if (!plan) return false;

  const feature = plan.features[featureId];
  return feature ? feature.included : false;
} 