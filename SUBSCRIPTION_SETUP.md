# Subscription System Setup

This document provides step-by-step instructions for setting up the subscription system in your application.

## Overview

The subscription system includes:

- Multi-tier subscription plans (Free, Basic, Pro, Enterprise)
- Usage-based feature limits (messages, uploads, etc.)
- Stripe integration for payment processing
- Customer portal for subscription management
- Webhook handling for subscription events

## Prerequisites

1. Stripe account
2. Supabase project
3. Node.js 16+ and npm/yarn

## Setup Steps

### 1. Database Setup

Run the following SQL in your Supabase SQL editor to create the necessary tables:

```sql
-- Users table extension for Stripe customer ID
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL,
  monthly_price NUMERIC NOT NULL,
  yearly_price NUMERIC NOT NULL,
  stripe_monthly_price_id TEXT,
  stripe_yearly_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription_features table
CREATE TABLE IF NOT EXISTS subscription_features (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create plan_features junction table
CREATE TABLE IF NOT EXISTS plan_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL REFERENCES subscription_features(id) ON DELETE CASCADE,
  included BOOLEAN NOT NULL DEFAULT false,
  limit INTEGER,
  period TEXT,
  UNIQUE(plan_id, feature_id)
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,
  current_period_start BIGINT NOT NULL,
  current_period_end BIGINT NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  cancel_at BIGINT,
  canceled_at BIGINT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Create subscription_usage table
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL REFERENCES subscription_features(id) ON DELETE CASCADE,
  used INTEGER NOT NULL DEFAULT 0,
  limit INTEGER NOT NULL,
  period TEXT NOT NULL,
  reset_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  UNIQUE(user_id, feature_id)
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  invoice_url TEXT,
  pdf_url TEXT,
  created_at BIGINT NOT NULL
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  details JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add Row Level Security policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- User can only view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- User can only view their own usage
CREATE POLICY "Users can view own usage"
  ON subscription_usage FOR SELECT
  USING (auth.uid() = user_id);

-- User can only view their own invoices
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

-- User can only view their own payment methods
CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

-- Service role function to create/update subscriptions
CREATE OR REPLACE FUNCTION create_or_update_subscription(
  _user_id UUID,
  _plan_id TEXT,
  _stripe_subscription_id TEXT,
  _status TEXT,
  _current_period_start BIGINT,
  _current_period_end BIGINT,
  _cancel_at_period_end BOOLEAN,
  _cancel_at BIGINT,
  _canceled_at BIGINT
) RETURNS UUID AS $$
DECLARE
  _subscription_id UUID;
BEGIN
  -- Try to find existing subscription for this user
  SELECT id INTO _subscription_id FROM user_subscriptions WHERE user_id = _user_id LIMIT 1;
  
  -- Insert or update subscription
  IF _subscription_id IS NULL THEN
    -- Create new subscription
    INSERT INTO user_subscriptions (
      user_id, plan_id, stripe_subscription_id, status,
      current_period_start, current_period_end, cancel_at_period_end,
      cancel_at, canceled_at, created_at, updated_at
    ) VALUES (
      _user_id, _plan_id, _stripe_subscription_id, _status,
      _current_period_start, _current_period_end, _cancel_at_period_end,
      _cancel_at, _canceled_at, extract(epoch from now()), extract(epoch from now())
    )
    RETURNING id INTO _subscription_id;
  ELSE
    -- Update existing subscription
    UPDATE user_subscriptions SET
      plan_id = _plan_id,
      stripe_subscription_id = _stripe_subscription_id,
      status = _status,
      current_period_start = _current_period_start,
      current_period_end = _current_period_end,
      cancel_at_period_end = _cancel_at_period_end,
      cancel_at = _cancel_at,
      canceled_at = _canceled_at,
      updated_at = extract(epoch from now())
    WHERE id = _subscription_id;
  END IF;
  
  RETURN _subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Environment Variables

Copy the variables from `.env.example` to your `.env.local` file and update them with your actual values:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Stripe Product and Price Setup

Run the seed script to create products and prices in Stripe:

```bash
npx ts-node src/scripts/seed-subscription-plans.ts
```

This script will create the subscription products and prices in Stripe and output the price IDs to update in your `subscription-plans.ts` configuration.

### 4. Webhook Setup

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli

2. Forward webhook events to your local server:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

3. Note the webhook signing secret provided and update your `.env.local` file.

4. In production, create a webhook endpoint in the Stripe dashboard pointing to:
   `https://your-domain.com/api/stripe/webhook`

### 5. Client Configuration

Update the client-side configuration to include your Stripe publishable key:

```typescript
// src/config/stripe.ts
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  billingPortalUrl: '/api/stripe/create-customer-portal-session',
  checkoutUrl: '/api/stripe/create-checkout-session',
};
```

### 6. Test the System

1. Create a test user account
2. Navigate to the pricing page
3. Select a subscription plan
4. Complete checkout using Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Requires Authentication: `4000 0025 0000 3155`
   - Decline: `4000 0000 0000 0002`

5. Test subscription management in the billing page

## Subscription System Components

### Front-end Components

- **Pricing Page**: Displays subscription plans
- **Checkout Page**: Processes payments with Stripe
- **Billing Page**: Manages existing subscriptions
- **Usage Component**: Displays feature usage
- **PremiumFeatureGuard**: Restricts access to premium features

### API Endpoints

- **create-checkout-session**: Creates Stripe checkout sessions
- **create-customer-portal-session**: Creates Stripe customer portal sessions
- **webhook**: Handles Stripe events
- **cancel-subscription**: Cancels an active subscription
- **update-subscription**: Changes subscription plan

### Services

- **subscription.ts**: Main service for subscription management
- **usage.ts**: Tracks and validates feature usage

## Troubleshooting

### Common Issues

1. **Webhook Errors**: Ensure your webhook secret is correctly set in `.env.local`
2. **Database Access Issues**: Check Supabase permissions and RLS policies
3. **Stripe API Errors**: Verify your API keys and ensure your account is properly configured
4. **Missing Customer ID**: Make sure the user has a Stripe customer ID stored in the database

### Support

For further assistance, refer to:
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Project GitHub Issues](https://github.com/your-repo/issues) 