-- Users table extension for Stripe customer IDs
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Subscription plans table (reference only, actual plans defined in code)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL,
  price INTEGER NOT NULL,
  period TEXT NOT NULL,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  price_id TEXT,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
ON user_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id
ON user_subscriptions(stripe_subscription_id);

-- Subscription usage table
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  limit INTEGER,
  period TEXT NOT NULL, -- Format: YYYY-MM
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, feature_id, period)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id
ON subscription_usage(user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_period
ON subscription_usage(period);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  billing_reason TEXT,
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_user_id
ON invoices(user_id);

CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id
ON invoices(subscription_id);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE,
  type TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  details JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id
ON payment_methods(user_id);

-- RLS Policies
-- Enable row level security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- User can only see their own subscriptions
CREATE POLICY user_subscriptions_policy
ON user_subscriptions
FOR ALL
USING (user_id = auth.uid());

-- User can only see their own usage
CREATE POLICY subscription_usage_policy
ON subscription_usage
FOR ALL
USING (user_id = auth.uid());

-- User can only see their own invoices
CREATE POLICY invoices_policy
ON invoices
FOR ALL
USING (user_id = auth.uid());

-- User can only see their own payment methods
CREATE POLICY payment_methods_policy
ON payment_methods
FOR ALL
USING (user_id = auth.uid());

-- Service Role Functions (for webhook handling)
-- Function to create or update user subscription
CREATE OR REPLACE FUNCTION create_or_update_subscription(
  p_user_id UUID,
  p_plan_id TEXT,
  p_stripe_subscription_id TEXT,
  p_status TEXT,
  p_current_period_start TIMESTAMP WITH TIME ZONE,
  p_current_period_end TIMESTAMP WITH TIME ZONE,
  p_cancel_at TIMESTAMP WITH TIME ZONE,
  p_canceled_at TIMESTAMP WITH TIME ZONE,
  p_trial_start TIMESTAMP WITH TIME ZONE,
  p_trial_end TIMESTAMP WITH TIME ZONE,
  p_price_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_id UUID;
BEGIN
  -- Try to find existing subscription
  SELECT id INTO v_subscription_id
  FROM user_subscriptions
  WHERE stripe_subscription_id = p_stripe_subscription_id;
  
  IF v_subscription_id IS NULL THEN
    -- Insert new subscription
    INSERT INTO user_subscriptions (
      user_id,
      plan_id,
      stripe_subscription_id,
      status,
      current_period_start,
      current_period_end,
      cancel_at,
      canceled_at,
      trial_start,
      trial_end,
      price_id,
      next_payment_date,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      p_plan_id,
      p_stripe_subscription_id,
      p_status,
      p_current_period_start,
      p_current_period_end,
      p_cancel_at,
      p_canceled_at,
      p_trial_start,
      p_trial_end,
      p_price_id,
      p_current_period_end,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_subscription_id;
  ELSE
    -- Update existing subscription
    UPDATE user_subscriptions
    SET
      plan_id = p_plan_id,
      status = p_status,
      current_period_start = p_current_period_start,
      current_period_end = p_current_period_end,
      cancel_at = p_cancel_at,
      canceled_at = p_canceled_at,
      trial_start = p_trial_start,
      trial_end = p_trial_end,
      price_id = p_price_id,
      next_payment_date = p_current_period_end,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = v_subscription_id;
  END IF;
  
  RETURN v_subscription_id;
END;
$$; 