import React from 'react';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import PromptManager from '../components/prompt/PromptManager';
import { PremiumFeatureGuard } from '../components/PremiumFeatureGuard';

export default function PromptsPage() {
  const { user, isLoading } = useAuth();

  return (
    <>
      <Head>
        <title>Prompt Manager | GenieAgent</title>
        <meta name="description" content="Manage your AI prompts and templates" />
      </Head>

      <main className="flex flex-col h-full bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Prompt Manager</h1>
          <p className="text-gray-400">Create, organize, and share your AI prompts</p>
        </div>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : !user ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <p className="text-xl text-gray-400 mb-4">Sign in to manage your prompts</p>
              <button
                onClick={() => window.location.href = '/auth/signin?callbackUrl=/prompts'}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Sign In
              </button>
            </div>
          ) : (
            <PremiumFeatureGuard featureId="custom_personas">
              <PromptManager />
            </PremiumFeatureGuard>
          )}
        </div>
      </main>
    </>
  );
} 