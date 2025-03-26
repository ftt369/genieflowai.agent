import { UUID } from './common';

/**
 * Subscription plan tiers
 */
export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

/**
 * Subscription billing periods
 */
export enum SubscriptionPeriod {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

/**
 * Subscription feature
 */
export type Feature = {
  id: string;
  name: string;
  description: string;
  type: 'limited' | 'boolean';
};

/**
 * Subscription feature
 */
export type SubscriptionFeature = Feature & {
  included: boolean;
  limit?: number;
  period?: SubscriptionPeriod;
};

/**
 * Subscription plan
 */
export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  tier: SubscriptionTier;
  stripe: {
    monthlyPriceId: string;
    yearlyPriceId: string;
  };
  price: {
    [SubscriptionPeriod.MONTHLY]: number;
    [SubscriptionPeriod.YEARLY]: number;
  };
  features: {
    [featureId: string]: SubscriptionFeature;
  };
};

/**
 * User subscription
 */
export type UserSubscription = {
  id?: string;
  userId: string;
  planId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  cancelAt?: number;
  canceledAt?: number;
  createdAt: number;
  updatedAt: number;
};

/**
 * Subscription status types
 */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

/**
 * Subscription usage
 */
export type SubscriptionUsage = {
  id?: string;
  userId: string;
  featureId: string;
  used: number;
  limit: number;
  period: SubscriptionPeriod;
  resetAt: number;
  updatedAt: number;
};

/**
 * Invoice
 */
export type Invoice = {
  id?: string;
  userId: string;
  subscriptionId: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  invoiceUrl?: string;
  pdfUrl?: string;
  createdAt: number;
};

/**
 * Payment method
 */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  isDefault: boolean;
  details: {
    brand?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cardholderName?: string;
  };
}

/**
 * Addon feature
 */
export interface AddonFeature {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  billingPeriod: SubscriptionPeriod;
  stripeProductId?: string;
  stripePriceId?: string;
} 