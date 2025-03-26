# GenieAgent Documentation

Welcome to the GenieAgent documentation. Here you'll find everything you need to set up, configure, and use the GenieAgent application.

## Overview

GenieAgent is a full-featured AI assistant application that provides:

- Intelligent chat capabilities with context-aware responses
- Knowledge base integration for document-based question answering
- Document management for storing and retrieving important files
- Workers' compensation document generation
- **NEW! Thinking Mode** - See how the AI thinks through problems step by step

## Setup Guides

- [Database Setup](./DB_SETUP.md) - Instructions for setting up the Supabase database
- [Database Summary](./DB_SUMMARY.md) - Overview of the database structure and tables
- [Final Setup](./FINAL_SETUP.md) - Final steps to complete after database initialization
- [Features Guide](./FEATURES.md) - Detailed list of available features

## Testing Scripts

GenieAgent provides several test scripts to verify different components:

- `npm run db:verify` - Verifies all database tables are set up correctly
- `npm run test:auth` - Tests the authentication flow with Supabase
- `npm run test:subscriptions` - Tests subscription management functionality
- `npm run test:kb` - Tests knowledge base document storage and queries

## New Features

### Thinking Mode

The new Thinking Mode feature provides transparency into the AI's reasoning process. Instead of just seeing the final answers, users can now watch how the AI thinks through problems step by step.

**Benefits:**
- Builds trust by showing how conclusions are reached
- Educational value in understanding complex problem-solving
- Can be toggled on/off based on user preference

**Try it out:** Visit `/thinking-demo` to experience the thinking mode feature.

## Deployment Checklist

Before deploying to production, ensure:

- [x] Database tables are verified (`npm run db:verify`)
- [x] Environment variables are configured in `.env.local`
- [x] Authentication is properly set up with Supabase
- [x] Subscription plans are loaded in the database
- [x] Knowledge base integration is functional
- [x] All tests pass successfully
- [x] Thinking mode feature is working as expected

## Application Architecture

GenieAgent uses the following technology stack:

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js with Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI API
- **Storage**: Supabase Storage
- **Payments**: Stripe

## Support

If you encounter any issues or have questions:

- Check the troubleshooting section in the [Final Setup](./FINAL_SETUP.md) document
- Verify the [Database Summary](./DB_SUMMARY.md) for database-related questions
- Review the [Features Guide](./FEATURES.md) for feature-specific documentation 