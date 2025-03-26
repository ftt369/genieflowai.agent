import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, Copy } from 'lucide-react';
import { usePromptStore } from '../../stores/prompt/promptStore';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/services';

interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export default function PromptManager() {
  const { user } = useAuth();
  const { prompts, setPrompts, addPrompt, updatePrompt, deletePrompt } = usePromptStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<Partial<Prompt> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Load prompts from Supabase
  useEffect(() => {
    if (user) {
      fetchPrompts();
    }
  }, [user]);
  
  async function fetchPrompts() {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching prompts:', error);
        return;
      }
      
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  }
  
  // Create or update a prompt
  async function handleSavePrompt() {
    if (!currentPrompt?.title || !currentPrompt?.content || !user) return;
    
    try {
      if (currentPrompt.id) {
        // Update existing prompt
        const { error } = await supabase
          .from('prompts')
          .update({
            title: currentPrompt.title,
            content: currentPrompt.content,
            tags: currentPrompt.tags || [],
            is_favorite: currentPrompt.is_favorite || false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentPrompt.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        updatePrompt(currentPrompt as Prompt);
      } else {
        // Create new prompt
        const newPrompt = {
          title: currentPrompt.title,
          content: currentPrompt.content,
          tags: currentPrompt.tags || [],
          is_favorite: currentPrompt.is_favorite || false,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        const { data, error } = await supabase
          .from('prompts')
          .insert(newPrompt)
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          addPrompt(data[0]);
        }
      }
      
      // Reset form
      setCurrentPrompt(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  }
  
  // Delete a prompt
  async function handleDeletePrompt(id: string) {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      deletePrompt(id);
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  }
  
  // Toggle favorite status
  async function toggleFavorite(prompt: Prompt) {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('prompts')
        .update({ is_favorite: !prompt.is_favorite })
        .eq('id', prompt.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      updatePrompt({
        ...prompt,
        is_favorite: !prompt.is_favorite
      });
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  }
  
  // Copy prompt to clipboard
  function copyToClipboard(content: string) {
    navigator.clipboard.writeText(content)
      .then(() => {
        // Show success message (could use toast notification)
        console.log('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }
  
  // Filter prompts based on search query, tags, and favorites
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || (prompt.tags && prompt.tags.includes(filterTag));
    const matchesFavorite = !showFavoritesOnly || prompt.is_favorite;
    
    return matchesSearch && matchesTag && matchesFavorite;
  });
  
  // Get all unique tags
  const allTags = Array.from(new Set(
    prompts.flatMap(prompt => prompt.tags || [])
  ));
  
  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold mb-4">Prompt Manager</h2>
        
        {/* Search and filters */}
        <div className="flex flex-col space-y-3 mb-4">
          <input
            type="text"
            placeholder="Search prompts..."
            className="w-full px-3 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-2 py-1 text-xs rounded-md ${!filterTag ? 'bg-indigo-600' : 'bg-gray-700'}`}
              onClick={() => setFilterTag(null)}
            >
              All
            </button>
            
            {allTags.map(tag => (
              <button
                key={tag}
                className={`px-2 py-1 text-xs rounded-md ${filterTag === tag ? 'bg-indigo-600' : 'bg-gray-700'}`}
                onClick={() => setFilterTag(tag === filterTag ? null : tag)}
              >
                #{tag}
              </button>
            ))}
            
            <button
              className={`ml-auto px-2 py-1 text-xs rounded-md ${showFavoritesOnly ? 'bg-yellow-600' : 'bg-gray-700'}`}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              Favorites
            </button>
          </div>
        </div>
        
        {/* New prompt button */}
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md"
          onClick={() => {
            setCurrentPrompt({ title: '', content: '', tags: [], is_favorite: false });
            setIsEditing(true);
          }}
        >
          <Plus size={16} />
          New Prompt
        </button>
      </div>
      
      {/* Prompt editor */}
      {isEditing && currentPrompt && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {currentPrompt.id ? 'Edit Prompt' : 'Create Prompt'}
            </h3>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => {
                setIsEditing(false);
                setCurrentPrompt(null);
              }}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={currentPrompt.title || ''}
                onChange={(e) => setCurrentPrompt({...currentPrompt, title: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                className="w-full h-32 px-3 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={currentPrompt.content || ''}
                onChange={(e) => setCurrentPrompt({...currentPrompt, content: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={(currentPrompt.tags || []).join(', ')}
                onChange={(e) => setCurrentPrompt({
                  ...currentPrompt, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="favorite"
                className="mr-2"
                checked={currentPrompt.is_favorite || false}
                onChange={(e) => setCurrentPrompt({...currentPrompt, is_favorite: e.target.checked})}
              />
              <label htmlFor="favorite" className="text-sm font-medium">Mark as favorite</label>
            </div>
            
            <div className="flex justify-end">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md"
                onClick={handleSavePrompt}
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Prompts list */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredPrompts.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {searchQuery || filterTag || showFavoritesOnly ? 
              'No matching prompts found.' : 
              'You have no saved prompts yet.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrompts.map(prompt => (
              <div key={prompt.id} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium">{prompt.title}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-gray-400 hover:text-yellow-500"
                      onClick={() => toggleFavorite(prompt)}
                      title={prompt.is_favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {prompt.is_favorite ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )}
                    </button>
                    <button
                      className="text-gray-400 hover:text-blue-500"
                      onClick={() => copyToClipboard(prompt.content)}
                      title="Copy prompt"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="text-gray-400 hover:text-green-500"
                      onClick={() => {
                        setCurrentPrompt(prompt);
                        setIsEditing(true);
                      }}
                      title="Edit prompt"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => handleDeletePrompt(prompt.id)}
                      title="Delete prompt"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">
                  {prompt.content.length > 150
                    ? `${prompt.content.substring(0, 150)}...`
                    : prompt.content}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {prompt.tags && prompt.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-gray-700 rounded-md cursor-pointer"
                      onClick={() => setFilterTag(tag === filterTag ? null : tag)}
                    >
                      #{tag}
                    </span>
                  ))}
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(prompt.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 