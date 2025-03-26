# GenieAgent Database Setup Guide

This guide will help you set up and configure the Supabase database for GenieAgent.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Supabase account and project

## Configuration

1. **Set up environment variables**

   Ensure your `.env.local` file contains the following Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   You can find these values in your Supabase dashboard under **Project Settings > API**.

2. **Database Schema**

   The database schema is defined in the following files:
   
   - `src/db/complete-schema.sql` - All tables and policies
   - `src/db/schema.sql` - Core subscription tables
   - `src/db/prompt-schema.sql` - Prompts-related tables

## Setup Steps

### Automatic Setup

Run the database setup script to create all required tables and set up security policies:

```bash
node src/scripts/setup-complete-database.js
```

This script will:
1. Connect to your Supabase instance using the service role key
2. Create an `exec_sql` function (required for schema execution)
3. Execute all SQL statements in the schema file
4. Report on the success or failure of each statement

### Manual Setup

If you prefer to set up the database manually:

1. Go to the SQL Editor in your Supabase Dashboard
2. Copy the contents of `src/db/complete-schema.sql`
3. Paste it into the SQL Editor
4. Execute the SQL statements

## Database Tables

The schema includes the following tables:

### Core Tables
- `profiles` - User profile information
- `user_preferences` - User settings and preferences
- `modes` - Assistant modes configuration

### Feature Tables
- `knowledge_bases` - Knowledge base collections
- `knowledge_documents` - Documents within knowledge bases
- `workers_comp_documents` - Workers compensation documents
- `prompts` - Saved prompts with tags and favorites

### Subscription Tables
- `subscription_plans` - Available subscription plans
- `user_subscriptions` - User subscription information
- `subscription_usage` - Feature usage tracking
- `invoices` - Billing invoices
- `payment_methods` - User payment methods

## Row Level Security (RLS)

All tables are secured with Row Level Security policies that ensure:
- Users can only access their own data
- Users cannot access data from other users
- Appropriate permissions are granted for SELECT, INSERT, UPDATE, and DELETE operations

## Troubleshooting

### Common Issues

1. **Missing Service Role Key**

   Error: `Error: Supabase URL and service role key are required.`
   
   Solution: Make sure your `.env.local` file includes the `SUPABASE_SERVICE_ROLE_KEY`.

2. **Permission Denied**

   Error: `Error executing SQL statement: permission denied for schema public`
   
   Solution: Ensure your service role key has the necessary permissions.

3. **exec_sql Function Error**

   If the database setup script cannot create the `exec_sql` function, you may need to:
   
   1. Go to the SQL Editor in Supabase
   2. Run the following SQL:
   
   ```sql
   CREATE OR REPLACE FUNCTION exec_sql(sql text)
   RETURNS void
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   BEGIN
     EXECUTE sql;
   END;
   $$;
   ```

## Further Development

When developing new features that require database changes:

1. Add new table definitions to `src/db/complete-schema.sql`
2. Add appropriate RLS policies
3. Run the setup script again to apply the changes
4. Update related TypeScript interfaces in your codebase 