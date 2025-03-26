// Test knowledge base features with Supabase
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const envPath = path.resolve(rootDir, '.env.local');

if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn(`Warning: ${envPath} file not found`);
  dotenv.config();
}

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase URL or Anon Key is missing from environment variables.');
  process.exit(1);
}

// Initialize Supabase client
console.log(`Connecting to Supabase at ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials - REPLACE THESE with test values
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123456!';

// Test creating a knowledge base
async function testCreateKnowledgeBase(userId) {
  console.log('\n🔹 Testing knowledge base creation...');
  
  if (!userId) {
    console.error('❌ Cannot create knowledge base: No user ID provided');
    return null;
  }
  
  try {
    const knowledgeBaseData = {
      user_id: userId,
      name: 'Test Knowledge Base',
      description: 'A test knowledge base for testing purposes',
    };
    
    const { data, error } = await supabase
      .from('knowledge_bases')
      .insert(knowledgeBaseData)
      .select();
    
    if (error) {
      console.error('❌ Knowledge base creation failed:', error.message);
      return null;
    } else {
      console.log('✅ Knowledge base created successfully!');
      console.log('Knowledge base:', data[0]);
      return data[0];
    }
  } catch (err) {
    console.error('❌ Error creating knowledge base:', err.message);
    return null;
  }
}

// Test adding a document to a knowledge base
async function testAddDocument(knowledgeBaseId) {
  console.log('\n🔹 Testing document addition...');
  
  if (!knowledgeBaseId) {
    console.error('❌ Cannot add document: No knowledge base ID provided');
    return null;
  }
  
  try {
    const documentData = {
      knowledge_base_id: knowledgeBaseId,
      title: 'Test Document',
      content: 'This is a test document with some content for testing purposes. It contains information about testing knowledge bases and documents in Supabase.',
      metadata: { tags: ['test', 'sample'], source: 'manual entry' },
    };
    
    const { data, error } = await supabase
      .from('knowledge_documents')
      .insert(documentData)
      .select();
    
    if (error) {
      console.error('❌ Document addition failed:', error.message);
      return null;
    } else {
      console.log('✅ Document added successfully!');
      console.log('Document:', data[0]);
      return data[0];
    }
  } catch (err) {
    console.error('❌ Error adding document:', err.message);
    return null;
  }
}

// Test retrieving documents from a knowledge base
async function testGetDocuments(knowledgeBaseId) {
  console.log('\n🔹 Testing document retrieval...');
  
  if (!knowledgeBaseId) {
    console.error('❌ Cannot retrieve documents: No knowledge base ID provided');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('knowledge_documents')
      .select('*')
      .eq('knowledge_base_id', knowledgeBaseId);
    
    if (error) {
      console.error('❌ Document retrieval failed:', error.message);
      return [];
    } else {
      console.log('✅ Documents retrieved successfully!');
      console.log(`Found ${data.length} documents:`);
      data.forEach(doc => {
        console.log(`- ${doc.title} (ID: ${doc.id})`);
      });
      return data;
    }
  } catch (err) {
    console.error('❌ Error retrieving documents:', err.message);
    return [];
  }
}

// Test updating a document
async function testUpdateDocument(documentId) {
  console.log('\n🔹 Testing document update...');
  
  if (!documentId) {
    console.error('❌ Cannot update document: No document ID provided');
    return false;
  }
  
  try {
    const updates = {
      title: 'Updated Test Document',
      content: 'This document has been updated with new content during testing.',
      metadata: { tags: ['test', 'sample', 'updated'], source: 'manual entry', updated: true }
    };
    
    const { data, error } = await supabase
      .from('knowledge_documents')
      .update(updates)
      .eq('id', documentId)
      .select();
    
    if (error) {
      console.error('❌ Document update failed:', error.message);
      return false;
    } else {
      console.log('✅ Document updated successfully!');
      console.log('Updated document:', data[0]);
      return true;
    }
  } catch (err) {
    console.error('❌ Error updating document:', err.message);
    return false;
  }
}

// Test deleting a document
async function testDeleteDocument(documentId) {
  console.log('\n🔹 Testing document deletion...');
  
  if (!documentId) {
    console.error('❌ Cannot delete document: No document ID provided');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('knowledge_documents')
      .delete()
      .eq('id', documentId);
    
    if (error) {
      console.error('❌ Document deletion failed:', error.message);
      return false;
    } else {
      console.log('✅ Document deleted successfully!');
      return true;
    }
  } catch (err) {
    console.error('❌ Error deleting document:', err.message);
    return false;
  }
}

// Test deleting a knowledge base
async function testDeleteKnowledgeBase(knowledgeBaseId) {
  console.log('\n🔹 Testing knowledge base deletion...');
  
  if (!knowledgeBaseId) {
    console.error('❌ Cannot delete knowledge base: No knowledge base ID provided');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('knowledge_bases')
      .delete()
      .eq('id', knowledgeBaseId);
    
    if (error) {
      console.error('❌ Knowledge base deletion failed:', error.message);
      return false;
    } else {
      console.log('✅ Knowledge base deleted successfully!');
      return true;
    }
  } catch (err) {
    console.error('❌ Error deleting knowledge base:', err.message);
    return false;
  }
}

// Sign in to get a user ID for testing
async function signIn() {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      console.error('❌ Signin failed:', error.message);
      return null;
    } else {
      console.log('✅ Signed in as test user');
      return data.user?.id;
    }
  } catch (err) {
    console.error('❌ Signin error:', err.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting knowledge base feature tests with Supabase...');
  
  // Sign in to get a user ID
  const userId = await signIn();
  
  if (userId) {
    // Create a knowledge base
    const knowledgeBase = await testCreateKnowledgeBase(userId);
    
    if (knowledgeBase) {
      // Add a document to the knowledge base
      const document = await testAddDocument(knowledgeBase.id);
      
      if (document) {
        // Retrieve documents from the knowledge base
        await testGetDocuments(knowledgeBase.id);
        
        // Update the document
        await testUpdateDocument(document.id);
        
        // Delete the document
        await testDeleteDocument(document.id);
      }
      
      // Delete the knowledge base
      await testDeleteKnowledgeBase(knowledgeBase.id);
    }
    
    // Sign out
    await supabase.auth.signOut();
  }
  
  console.log('\n🏁 Knowledge base feature testing complete!');
}

// Run the tests
runTests().catch(err => {
  console.error('Test suite error:', err);
}); 