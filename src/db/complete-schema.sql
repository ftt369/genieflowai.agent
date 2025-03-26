-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users table extension for Stripe customer IDs
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  role TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up row level security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT NOT NULL DEFAULT 'light',
  language TEXT NOT NULL DEFAULT 'en',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up row level security for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Modes Table
CREATE TABLE IF NOT EXISTS modes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up row level security for modes
ALTER TABLE modes ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column for modes
CREATE TRIGGER update_modes_updated_at
BEFORE UPDATE ON modes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Knowledge Bases Table
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up row level security for knowledge_bases
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column for knowledge_bases
CREATE TRIGGER update_knowledge_bases_updated_at
BEFORE UPDATE ON knowledge_bases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Knowledge Documents Table
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id UUID REFERENCES knowledge_bases(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  file_path TEXT,
  embeddings_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up row level security for knowledge_documents
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column for knowledge_documents
CREATE TRIGGER update_knowledge_documents_updated_at
BEFORE UPDATE ON knowledge_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Workers Comp Documents Table
CREATE TABLE IF NOT EXISTS workers_comp_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up row level security for workers_comp_documents
ALTER TABLE workers_comp_documents ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column for workers_comp_documents
CREATE TRIGGER update_workers_comp_documents_updated_at
BEFORE UPDATE ON workers_comp_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up row level security for prompts
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column for prompts
CREATE TRIGGER update_prompts_updated_at
BEFORE UPDATE ON prompts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

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

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "New users can create their profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "New users can create their preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Modes policies
CREATE POLICY "Users can view their own modes"
  ON modes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own modes"
  ON modes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own modes"
  ON modes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own modes"
  ON modes FOR DELETE
  USING (auth.uid() = user_id);

-- Knowledge bases policies
CREATE POLICY "Users can view their own knowledge bases"
  ON knowledge_bases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge bases"
  ON knowledge_bases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own knowledge bases"
  ON knowledge_bases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge bases"
  ON knowledge_bases FOR DELETE
  USING (auth.uid() = user_id);

-- Knowledge documents policies
CREATE POLICY "Users can view their own knowledge documents"
  ON knowledge_documents FOR SELECT
  USING (
    auth.uid() IN (
      SELECT kb.user_id
      FROM knowledge_bases kb
      WHERE kb.id = knowledge_base_id
    )
  );

CREATE POLICY "Users can update their own knowledge documents"
  ON knowledge_documents FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT kb.user_id
      FROM knowledge_bases kb
      WHERE kb.id = knowledge_base_id
    )
  );

CREATE POLICY "Users can insert their own knowledge documents"
  ON knowledge_documents FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT kb.user_id
      FROM knowledge_bases kb
      WHERE kb.id = knowledge_base_id
    )
  );

CREATE POLICY "Users can delete their own knowledge documents"
  ON knowledge_documents FOR DELETE
  USING (
    auth.uid() IN (
      SELECT kb.user_id
      FROM knowledge_bases kb
      WHERE kb.id = knowledge_base_id
    )
  );

-- Workers comp documents policies
CREATE POLICY "Users can view their own workers comp documents"
  ON workers_comp_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own workers comp documents"
  ON workers_comp_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workers comp documents"
  ON workers_comp_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workers comp documents"
  ON workers_comp_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Prompts policies
CREATE POLICY "Users can view their own prompts"
  ON prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prompts"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
  ON prompts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts"
  ON prompts FOR DELETE
  USING (auth.uid() = user_id);

-- User subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR ALL
  USING (user_id = auth.uid());

-- Subscription usage policies
CREATE POLICY "Users can view their own usage"
  ON subscription_usage FOR ALL
  USING (user_id = auth.uid());

-- Invoices policies
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR ALL
  USING (user_id = auth.uid());

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods"
  ON payment_methods FOR ALL
  USING (user_id = auth.uid()); 