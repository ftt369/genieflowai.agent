# Supabase Integration for GenieAgent

## Introduction

[Supabase](https://supabase.io) is an open-source Firebase alternative that provides all the backend services needed for building a modern web application. This document outlines how Supabase is integrated into the GenieAgent application, including setup instructions, database schema, security configuration, and storage bucket setup.

## Setup Instructions

### 1. Create a Supabase Project

1. Sign up for Supabase at [app.supabase.io](https://app.supabase.io)
2. Create a new project and note your project URL and API keys
3. Configure your project settings as needed

### 2. Environment Variables

Copy the `.env.example` file to `.env.local` and update it with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Schema Setup

Execute the following SQL commands in the Supabase SQL editor to create the necessary tables:

#### Profiles Table

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up row level security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### User Preferences Table

```sql
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT NOT NULL DEFAULT 'light',
  language TEXT NOT NULL DEFAULT 'en',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up row level security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### Modes Table

```sql
CREATE TABLE public.modes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up row level security
ALTER TABLE public.modes ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_modes_updated_at
BEFORE UPDATE ON public.modes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### Knowledge Bases Table

```sql
CREATE TABLE public.knowledge_bases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up row level security
ALTER TABLE public.knowledge_bases ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_knowledge_bases_updated_at
BEFORE UPDATE ON public.knowledge_bases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### Knowledge Documents Table

```sql
CREATE TABLE public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id UUID REFERENCES public.knowledge_bases(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  file_path TEXT,
  embeddings_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up row level security
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_knowledge_documents_updated_at
BEFORE UPDATE ON public.knowledge_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### Workers Comp Documents Table

```sql
CREATE TABLE public.workers_comp_documents (
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

-- Set up row level security
ALTER TABLE public.workers_comp_documents ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_workers_comp_documents_updated_at
BEFORE UPDATE ON public.workers_comp_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### Updated At Function

```sql
-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4. Row Level Security (RLS) Policies

Set up RLS policies to ensure users can only access their own data:

#### Profiles Policies

```sql
-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow new users to create their profile
CREATE POLICY "New users can create their profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### User Preferences Policies

```sql
-- Allow users to view their own preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own preferences
CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow new users to create their preferences
CREATE POLICY "New users can create their preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### Modes Policies

```sql
-- Allow users to view their own modes
CREATE POLICY "Users can view their own modes"
  ON public.modes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own modes
CREATE POLICY "Users can update their own modes"
  ON public.modes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to create their own modes
CREATE POLICY "Users can create their own modes"
  ON public.modes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own modes
CREATE POLICY "Users can delete their own modes"
  ON public.modes
  FOR DELETE
  USING (auth.uid() = user_id);
```

#### Knowledge Bases Policies

```sql
-- Allow users to view their own knowledge bases
CREATE POLICY "Users can view their own knowledge bases"
  ON public.knowledge_bases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own knowledge bases
CREATE POLICY "Users can update their own knowledge bases"
  ON public.knowledge_bases
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to create their own knowledge bases
CREATE POLICY "Users can create their own knowledge bases"
  ON public.knowledge_bases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own knowledge bases
CREATE POLICY "Users can delete their own knowledge bases"
  ON public.knowledge_bases
  FOR DELETE
  USING (auth.uid() = user_id);
```

#### Knowledge Documents Policies

```sql
-- Allow users to view documents in their knowledge bases
CREATE POLICY "Users can view documents in their knowledge bases"
  ON public.knowledge_documents
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.knowledge_bases
    WHERE knowledge_bases.id = knowledge_documents.knowledge_base_id
    AND knowledge_bases.user_id = auth.uid()
  ));

-- Allow users to update documents in their knowledge bases
CREATE POLICY "Users can update documents in their knowledge bases"
  ON public.knowledge_documents
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.knowledge_bases
    WHERE knowledge_bases.id = knowledge_documents.knowledge_base_id
    AND knowledge_bases.user_id = auth.uid()
  ));

-- Allow users to create documents in their knowledge bases
CREATE POLICY "Users can create documents in their knowledge bases"
  ON public.knowledge_documents
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.knowledge_bases
    WHERE knowledge_bases.id = knowledge_documents.knowledge_base_id
    AND knowledge_bases.user_id = auth.uid()
  ));

-- Allow users to delete documents in their knowledge bases
CREATE POLICY "Users can delete documents in their knowledge bases"
  ON public.knowledge_documents
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.knowledge_bases
    WHERE knowledge_bases.id = knowledge_documents.knowledge_base_id
    AND knowledge_bases.user_id = auth.uid()
  ));
```

#### Workers Comp Documents Policies

```sql
-- Allow users to view their own workers comp documents
CREATE POLICY "Users can view their own workers comp documents"
  ON public.workers_comp_documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own workers comp documents
CREATE POLICY "Users can update their own workers comp documents"
  ON public.workers_comp_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to create their own workers comp documents
CREATE POLICY "Users can create their own workers comp documents"
  ON public.workers_comp_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own workers comp documents
CREATE POLICY "Users can delete their own workers comp documents"
  ON public.workers_comp_documents
  FOR DELETE
  USING (auth.uid() = user_id);
```

### 5. Storage Buckets Setup

Set up the following storage buckets:

#### User Avatars Bucket

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'User Avatars', true);

-- Set up RLS policy for avatars bucket
CREATE POLICY "Users can access their own avatars"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Documents Bucket

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'User Documents', false);

-- Set up RLS policy for documents bucket
CREATE POLICY "Users can access their own documents"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Workers Comp Documents Bucket

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('workers-comp', 'Workers Comp Documents', false);

-- Set up RLS policy for workers comp documents bucket
CREATE POLICY "Users can access their own workers comp documents"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'workers-comp'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## Using Supabase in the Application

### Authentication Example

Here's an example of a login component using Supabase authentication:

```tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const { success, error } = await signIn(email, password);
      if (!success) {
        setError(error?.message || 'Invalid email or password');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Sign In</button>
    </form>
  );
};

export default LoginForm;
```

### Database Operations Example

Here's an example of creating and retrieving knowledge bases:

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { KnowledgeBase } from '../types/database';

// Create a knowledge base
const createKnowledgeBase = async (name: string, description?: string) => {
  const { user } = useAuth();
  
  if (!user) return { success: false, error: { message: 'User not authenticated' } };
  
  const { data, error } = await supabase
    .from('knowledge_bases')
    .insert([
      {
        name,
        description,
        user_id: user.id
      }
    ])
    .select();
    
  return {
    success: !error,
    data,
    error
  };
};

// Get all knowledge bases for the current user
const getKnowledgeBases = async () => {
  const { user } = useAuth();
  
  if (!user) return { success: false, error: { message: 'User not authenticated' } };
  
  const { data, error } = await supabase
    .from('knowledge_bases')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  return {
    success: !error,
    data: data as KnowledgeBase[],
    error
  };
};
```

### File Storage Example

Here's an example of uploading a file to Supabase storage:

```tsx
import { useState } from 'react';
import { uploadFile } from '../services/storage';

const FileUploadExample = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    try {
      const filePath = `documents/${Date.now()}_${file.name}`;
      const url = await uploadFile('documents', filePath, file, file.type);
      
      if (url) {
        setFileUrl(url);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {fileUrl && (
        <div>
          <p>File uploaded successfully!</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            View File
          </a>
        </div>
      )}
    </div>
  );
};
```

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Supabase JavaScript Client](https://supabase.io/docs/reference/javascript/installing)
- [Supabase Auth Guides](https://supabase.io/docs/guides/auth)
- [Supabase Storage Guides](https://supabase.io/docs/guides/storage) 