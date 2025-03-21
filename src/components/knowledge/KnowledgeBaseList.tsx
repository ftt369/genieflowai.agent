import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { KnowledgeBase, DatabaseChangePayload } from '../../types/database';

const KnowledgeBaseList: React.FC = () => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKbName, setNewKbName] = useState('');
  const [newKbDescription, setNewKbDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchKnowledgeBases();
    }
  }, [user]);

  const fetchKnowledgeBases = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('knowledge_bases')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setKnowledgeBases(data as KnowledgeBase[]);
    } catch (err) {
      console.error('Error fetching knowledge bases:', err);
      setError('Failed to load knowledge bases. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const createKnowledgeBase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKbName.trim()) {
      setError('Knowledge base name is required');
      return;
    }
    
    try {
      setIsCreating(true);
      setError(null);
      
      const newKnowledgeBase = {
        name: newKbName.trim(),
        description: newKbDescription.trim(),
        user_id: user?.id,
      };
      
      const { data, error } = await supabase
        .from('knowledge_bases')
        .insert([newKnowledgeBase])
        .select();
        
      if (error) {
        throw error;
      }
      
      // Reset form
      setNewKbName('');
      setNewKbDescription('');
      
      // Update the list with the new knowledge base
      setKnowledgeBases(prevKbs => [...(data as KnowledgeBase[]), ...prevKbs]);
      
    } catch (err) {
      console.error('Error creating knowledge base:', err);
      setError('Failed to create knowledge base. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  
  const deleteKnowledgeBase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge base? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      
      // First delete all associated documents (due to foreign key constraint)
      const { error: docError } = await supabase
        .from('knowledge_documents')
        .delete()
        .eq('knowledge_base_id', id);
        
      if (docError) {
        throw docError;
      }
      
      // Then delete the knowledge base
      const { error } = await supabase
        .from('knowledge_bases')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update the list by removing the deleted knowledge base
      setKnowledgeBases(prevKbs => prevKbs.filter(kb => kb.id !== id));
      
    } catch (err) {
      console.error('Error deleting knowledge base:', err);
      setError('Failed to delete knowledge base. Please try again.');
    }
  };

  // Real-time subscription to knowledge bases changes
  useEffect(() => {
    if (!user) return;
    
    const subscription = supabase
      .channel('knowledge_bases_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'knowledge_bases',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: DatabaseChangePayload<KnowledgeBase>) => {
          // Handle different change events
          if (payload.eventType === 'INSERT') {
            const newKb = payload.new as KnowledgeBase;
            setKnowledgeBases(prevKbs => {
              // Avoid duplicate inserts since we're already handling this in createKnowledgeBase
              if (!prevKbs.some(kb => kb.id === newKb.id)) {
                return [newKb, ...prevKbs];
              }
              return prevKbs;
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedKb = payload.new as KnowledgeBase;
            setKnowledgeBases(prevKbs => 
              prevKbs.map(kb => kb.id === updatedKb.id ? updatedKb : kb)
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedKb = payload.old as KnowledgeBase;
            setKnowledgeBases(prevKbs => 
              prevKbs.filter(kb => kb.id !== deletedKb.id)
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  if (!user) {
    return <p className="text-center text-gray-600">Please log in to view your knowledge bases.</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Knowledge Bases</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Create new knowledge base form */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Create New Knowledge Base</h3>
        <form onSubmit={createKnowledgeBase}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={newKbName}
              onChange={(e) => setNewKbName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={newKbDescription}
              onChange={(e) => setNewKbDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={isCreating || !newKbName.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Knowledge Base'}
          </button>
        </form>
      </div>
      
      {/* Knowledge bases list */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Loading knowledge bases...</p>
          </div>
        ) : knowledgeBases.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">You don't have any knowledge bases yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {knowledgeBases.map((kb) => (
              <li key={kb.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{kb.name}</h3>
                    {kb.description && (
                      <p className="mt-1 text-sm text-gray-600">{kb.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Created: {new Date(kb.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.location.href = `/knowledge/${kb.id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteKnowledgeBase(kb.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseList; 