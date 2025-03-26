# Supabase Database Setup

## Setting up Tables

Since we're having issues with the API key for programmatic table creation, you'll need to create the database tables manually using the Supabase SQL editor.

1. Go to your [Supabase Dashboard](https://app.supabase.io/)
2. Navigate to your project
3. Go to the SQL Editor section
4. Run the following SQL to create the necessary tables:

```sql
-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL,
  price NUMERIC NOT NULL,
  period TEXT NOT NULL,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up row level security for prompts
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for prompts
CREATE POLICY "Users can view their own prompts"
  ON prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prompts"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
  ON prompts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts"
  ON prompts FOR DELETE
  USING (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up row level security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

## Seeding Subscription Plans

After creating the tables, you can seed the subscription plans by running:

```bash
npm run db:simple-seed
```

This will add the subscription plans to your database.

## Checking Database Connection

To test your database connection, you can run:

```bash
npm run db:test-connection
```

This will verify that your application can connect to the Supabase database.

## Troubleshooting

If you're experiencing issues with the Supabase service role key, try using the anon key instead for operations that don't require admin privileges.

The scripts in this project are configured to use the anon key for database operations due to issues with the service role key.

To update your Supabase credentials or get fresh API keys:

1. Go to your [Supabase Dashboard](https://app.supabase.io/)
2. Navigate to your project
3. Go to Settings > API
4. Copy the URL, anon key, and service role key
5. Update your `.env.local` file with these values 