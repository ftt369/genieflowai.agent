# GenieAgent Final Setup Guide

This guide provides the final steps to complete your GenieAgent application setup after the database initialization.

## Steps Overview

1. Test the core database functionality
2. Set up user authentication flow
3. Configure subscription management
4. Implement knowledge base features
5. Run the application
6. (Optional) Deploy to production

## 1. Testing Core Database Functionality

The database tables have been created, and you should test that they are working correctly:

```bash
# Verify all database tables exist
npm run db:verify
```

Expected output: All 12 tables should show as verified, with subscription plans displayed.

## 2. Setting Up User Authentication

Test the authentication flow with Supabase:

```bash
# First, update the test credentials in src/scripts/test-auth-flow.js
# Then run the auth test
npm run test:auth
```

### Important Auth Configuration Steps:

1. In the Supabase dashboard, go to Authentication > Settings
2. Configure Email Auth:
   - Enable "Email Signup"
   - Enable "Email Confirmation" for secure signup
   - Configure redirect URLs for your domain

3. (Optional) Set up OAuth Providers:
   - Go to Authentication > Providers
   - Configure Google, GitHub, or other providers
   - Add the correct redirect URLs

## 3. Subscription Management

Test the subscription management functionality:

```bash
# First, update the test credentials in src/scripts/test-subscription-features.js
# Then run the subscription test
npm run test:subscriptions
```

### Subscription Integration Steps:

1. If using Stripe:
   - Add your Stripe keys to `.env.local`:
     ```
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
     ```
   - Set up webhook endpoint (or use Stripe CLI for local testing)

2. Connect subscription components:
   - Check `src/components/StripeCheckoutButton.tsx`
   - Check `src/components/CustomerPortalButton.tsx`
   - Ensure `src/components/PremiumFeatureGuard.tsx` is properly configured

## 4. Knowledge Base Features

Test the knowledge base functionality:

```bash
# First, update the test credentials in src/scripts/test-knowledge-base.js
# Then run the knowledge base test
npm run test:kb
```

### Knowledge Base Integration Steps:

1. Configure document storage:
   - In Supabase dashboard, go to Storage and create a bucket called 'documents'
   - Set up appropriate bucket policies

2. Integration components:
   - Check `src/components/knowledge/KnowledgeBaseManager.tsx`
   - Check `src/components/documents/DocumentUpload.tsx`
   - Ensure proper error handling and loading states

## 5. Running the Application

Start the application:

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Check these key routes:

- `/` - Home page
- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/dashboard` - Main dashboard
- `/profile` - User profile settings
- `/pricing` - Subscription plans

## 6. Production Deployment (Optional)

For deploying to production:

1. Update all environment variables for production:
   - Supabase URL and keys
   - Stripe keys (if applicable)
   - API keys

2. Build the application:
   ```bash
   npm run build
   ```

3. Deploy to your preferred platform:
   - Vercel (recommended for Next.js applications)
   - Netlify
   - AWS
   - Google Cloud
   - Azure

## Troubleshooting

### Authentication Issues
- Verify your Supabase authentication keys in `.env.local`
- Check that email templates are configured in Supabase
- Ensure redirect URLs are correctly set up

### Database Connection Issues
- Confirm that your Supabase URL and key are correct
- Check if the IP address has access to the Supabase project
- Verify that the tables have been correctly created

### Permission Errors
- Ensure that the RLS policies are configured correctly
- Check user roles and permissions in Supabase

### Subscription Integration Issues
- Verify your Stripe API keys
- Ensure webhook endpoints are correctly configured
- Check that the subscription plans match between Stripe and your database

## New Feature: Thinking Mode

A new "Thinking Mode" feature has been implemented that allows users to see how the AI thinks through problems step by step. This feature enhances transparency and builds trust by showing the reasoning process that leads to the AI's conclusions.

### Feature Components
- **Thinking Mode API**: A new API integration with OpenAI that formats responses with separated thinking and answer sections
- **ThinkingMode Component**: Displays the AI's reasoning process with a typing animation
- **User Preference Store**: Stores user preferences for showing/hiding the thinking process
- **Demo Page**: A dedicated page at `/thinking-demo` showcasing the feature

### Configuration
The thinking mode feature requires:
1. An OpenAI API key set in the environment variables as `NEXT_PUBLIC_OPENAI_API_KEY`
2. The ThinkingMode component properly initialized in the ChatWithThinking component
3. The user preferences store to manage the thinking mode toggle

### Testing
To test the thinking mode:
1. Visit the `/thinking-demo` page
2. Toggle the "Show Thinking Process" button to enable/disable the feature
3. Ask a complex question to see the AI's reasoning process
4. Verify that the typing animation works correctly and that the final answer is displayed after the thinking process completes

This new feature significantly enhances the user experience by providing educational value and building trust through transparency.

## Final Checklist

Before considering your GenieAgent application complete, ensure all the following are working:

- [ ] User authentication (sign-up, login, password reset)
- [ ] Subscription management and payments
- [ ] Knowledge base document upload and querying
- [ ] Chat functionality with context-aware responses
- [ ] Workers' compensation document generation
- [ ] Thinking mode feature with toggle functionality
- [ ] User preference settings
- [ ] Responsive UI across different devices

Congratulations on completing the GenieAgent application setup! Your AI assistant is now ready to provide intelligent responses, manage documents, process subscriptions, and show its thinking process to users. 