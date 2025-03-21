import React, { useState } from 'react';
import { NextPage } from 'next';
import LoginForm from '../components/auth/LoginForm';
import FileUploader from '../components/documents/FileUploader';
import KnowledgeBaseList from '../components/knowledge/KnowledgeBaseList';
import { useAuth } from '../contexts/AuthContext';

const DemoPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState<'auth' | 'storage' | 'database'>('auth');
  const { user, signOut } = useAuth();

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Supabase Features Demo</h1>
      
      {user && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 flex justify-between items-center">
          <p className="text-blue-800">
            Logged in as: <span className="font-semibold">{user.email}</span>
          </p>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('auth')}
              className={`pb-4 px-1 ${
                activeTab === 'auth'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Authentication
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`pb-4 px-1 ${
                activeTab === 'storage'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Storage
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`pb-4 px-1 ${
                activeTab === 'database'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Database
            </button>
          </nav>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'auth' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Supabase Authentication</h2>
            <p className="text-gray-600 mb-6">
              Sign in with email and password or using OAuth providers. The authentication state is managed through the AuthContext.
            </p>
            {!user ? (
              <LoginForm />
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-700 mb-4">
                  You are successfully authenticated!
                </p>
                <p className="text-gray-500">
                  User ID: {user.id}
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'storage' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Supabase Storage</h2>
            <p className="text-gray-600 mb-6">
              Upload, download, and manage files using Supabase Storage buckets with built-in permissions.
            </p>
            {!user ? (
              <p className="text-center py-8 bg-gray-50 rounded-lg">
                Please log in to test the storage functionality.
              </p>
            ) : (
              <FileUploader
                bucketName="documents"
                folderPath={`${user.id}/general`}
                allowedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
                maxSizeMB={5}
                onUploadComplete={(url) => {
                  console.log('File uploaded:', url);
                }}
              />
            )}
          </div>
        )}
        
        {activeTab === 'database' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Supabase Database</h2>
            <p className="text-gray-600 mb-6">
              Create, read, update, and delete records in the Postgres database with real-time subscriptions.
            </p>
            {!user ? (
              <p className="text-center py-8 bg-gray-50 rounded-lg">
                Please log in to test the database functionality.
              </p>
            ) : (
              <KnowledgeBaseList />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPage; 