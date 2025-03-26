import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../config/services';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { FEATURES } from '../../config/subscription-plans';

// Prompt template type definition
interface PromptTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string;
  system_prompt: string;
  temperature: number;
  custom_instructions: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Default prompt templates
const DEFAULT_TEMPLATES: Omit<PromptTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'General Assistant',
    description: 'A helpful assistant for general purposes',
    system_prompt: 'You are a helpful assistant ready to assist with various tasks.',
    temperature: 0.7,
    custom_instructions: '',
    is_default: true,
  },
  {
    name: 'Code Expert',
    description: 'Specialized in programming and technical help',
    system_prompt: 'You are a coding expert who provides detailed technical assistance and code examples.',
    temperature: 0.3,
    custom_instructions: 'Provide code snippets with explanations. Format code properly.',
    is_default: false,
  },
  {
    name: 'Creative Writer',
    description: 'Help with creative writing tasks',
    system_prompt: 'You are a creative writing assistant who helps with ideas, stories, and content.',
    temperature: 0.9,
    custom_instructions: 'Be imaginative and provide varied creative options.',
    is_default: false,
  },
];

export default function PromptManager() {
  const { user } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  
  // Check if user has access to custom prompts feature
  const { hasAccess: canCreateCustomPrompts } = useFeatureAccess(FEATURES.CUSTOM_PERSONAS.id);

  // Fetch user's prompt templates
  useEffect(() => {
    async function fetchTemplates() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch templates from Supabase
        const { data, error } = await supabase
          .from('prompt_templates')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // If user has no templates, initialize with defaults
        if (data.length === 0) {
          const defaultTemplates = await initializeDefaultTemplates(user.id);
          setTemplates(defaultTemplates);
        } else {
          setTemplates(data);
        }
      } catch (err: any) {
        console.error('Error fetching prompt templates:', err);
        setError(err.message || 'Failed to load prompt templates');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTemplates();
  }, [user]);
  
  // Initialize default templates for new users
  async function initializeDefaultTemplates(userId: string) {
    try {
      const templatesWithUserId = DEFAULT_TEMPLATES.map(template => ({
        ...template,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      
      const { data, error } = await supabase
        .from('prompt_templates')
        .insert(templatesWithUserId)
        .select();
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error initializing default templates:', err);
      return [];
    }
  }
  
  // Create or update a template
  async function saveTemplate(template: Partial<PromptTemplate> & { id?: string }) {
    if (!user) return;
    
    try {
      const isNew = !template.id;
      
      // Prepare template data
      const templateData = {
        ...template,
        user_id: user.id,
        updated_at: new Date().toISOString(),
        ...(isNew && { created_at: new Date().toISOString() }),
      };
      
      if (isNew) {
        // Create new template
        const { data, error } = await supabase
          .from('prompt_templates')
          .insert([templateData])
          .select()
          .single();
        
        if (error) throw error;
        
        setTemplates([data, ...templates]);
      } else {
        // Update existing template
        const { data, error } = await supabase
          .from('prompt_templates')
          .update(templateData)
          .eq('id', template.id)
          .select()
          .single();
        
        if (error) throw error;
        
        setTemplates(templates.map(t => t.id === data.id ? data : t));
      }
      
      setEditingTemplate(null);
      setShowForm(false);
    } catch (err: any) {
      console.error('Error saving template:', err);
      setError(err.message || 'Failed to save template');
    }
  }
  
  // Delete a template
  async function deleteTemplate(id: string) {
    if (!user) return;
    
    try {
      // Check if this is the last template
      if (templates.length <= 1) {
        setError('You must have at least one prompt template');
        return;
      }
      
      // Don't allow deleting the default template
      const templateToDelete = templates.find(t => t.id === id);
      if (templateToDelete?.is_default) {
        setError('You cannot delete the default template');
        return;
      }
      
      const { error } = await supabase
        .from('prompt_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('Error deleting template:', err);
      setError(err.message || 'Failed to delete template');
    }
  }
  
  // Set a template as default
  async function setDefaultTemplate(id: string) {
    if (!user) return;
    
    try {
      // First, unset all defaults
      await supabase
        .from('prompt_templates')
        .update({ is_default: false })
        .eq('user_id', user.id);
      
      // Then set the new default
      const { data, error } = await supabase
        .from('prompt_templates')
        .update({ is_default: true })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setTemplates(templates.map(t => ({
        ...t,
        is_default: t.id === id
      })));
    } catch (err: any) {
      console.error('Error setting default template:', err);
      setError(err.message || 'Failed to set default template');
    }
  }
  
  // Toggle template expansion
  function toggleExpand(id: string) {
    setExpandedTemplate(expandedTemplate === id ? null : id);
  }
  
  // Form for creating/editing templates
  function TemplateForm() {
    const [formData, setFormData] = useState<Partial<PromptTemplate>>(
      editingTemplate || {
        name: '',
        description: '',
        system_prompt: '',
        temperature: 0.7,
        custom_instructions: '',
        is_default: false,
      }
    );
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: name === 'temperature' ? parseFloat(value) : value,
      });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      saveTemplate(formData);
    };
    
    return (
      <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-white mb-4">
          {editingTemplate ? 'Edit Prompt Template' : 'Create New Prompt Template'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="system_prompt" className="block text-sm font-medium text-gray-300 mb-1">
              System Prompt
            </label>
            <textarea
              id="system_prompt"
              name="system_prompt"
              value={formData.system_prompt}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              This is the instruction given to the AI to define its behavior.
            </p>
          </div>
          
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-300 mb-1">
              Temperature: {formData.temperature}
            </label>
            <input
              type="range"
              id="temperature"
              name="temperature"
              min="0"
              max="1"
              step="0.1"
              value={formData.temperature}
              onChange={handleChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Precise (0.0)</span>
              <span>Balanced (0.5)</span>
              <span>Creative (1.0)</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="custom_instructions" className="block text-sm font-medium text-gray-300 mb-1">
              Custom Instructions
            </label>
            <textarea
              id="custom_instructions"
              name="custom_instructions"
              value={formData.custom_instructions}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Additional instructions to customize the AI's behavior.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setEditingTemplate(null);
              setShowForm(false);
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </form>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Template list item
  function TemplateItem({ template }: { template: PromptTemplate }) {
    const isExpanded = expandedTemplate === template.id;
    
    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden mb-4">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleExpand(template.id)}
        >
          <div className="flex items-center">
            <div>
              <h3 className="font-medium text-white">
                {template.name} 
                {template.is_default && (
                  <span className="ml-2 text-xs bg-indigo-700 text-white px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-400">{template.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isExpanded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTemplate(template);
                  setShowForm(true);
                }}
                className="p-1 text-gray-400 hover:text-white"
                title="Edit template"
              >
                <Edit size={16} />
              </button>
            )}
            {!template.is_default && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTemplate(template.id);
                }}
                className="p-1 text-gray-400 hover:text-red-500"
                title="Delete template"
              >
                <Trash size={16} />
              </button>
            )}
            {!template.is_default && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDefaultTemplate(template.id);
                }}
                className="p-1 text-gray-400 hover:text-indigo-500"
                title="Set as default"
              >
                <Save size={16} />
              </button>
            )}
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 pb-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-300">System Prompt</h4>
                <p className="text-sm bg-gray-700 p-2 rounded mt-1">{template.system_prompt}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-300">Temperature</h4>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${template.temperature * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-400">{template.temperature}</span>
                </div>
              </div>
              
              {template.custom_instructions && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300">Custom Instructions</h4>
                  <p className="text-sm bg-gray-700 p-2 rounded mt-1">{template.custom_instructions}</p>
                </div>
              )}
              
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    setEditingTemplate(template);
                    setShowForm(true);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    // Here you would implement applying the template to the current chat
                    // This would depend on your application's state management
                    console.log('Apply template:', template);
                  }}
                  className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                >
                  Apply to Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Prompt Templates</h2>
        
        {canCreateCustomPrompts && (
          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowForm(!showForm);
            }}
            className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showForm ? (
              <>
                <X size={18} className="mr-1" /> Cancel
              </>
            ) : (
              <>
                <Plus size={18} className="mr-1" /> New Template
              </>
            )}
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-400 hover:text-red-300"
          >
            <X size={18} />
          </button>
        </div>
      )}
      
      {!canCreateCustomPrompts && (
        <div className="bg-gray-800 border border-indigo-700 text-gray-300 px-4 py-3 rounded mb-4">
          <p>
            <span className="font-semibold text-indigo-400">Upgrade to Pro</span> to create and customize prompt templates.
          </p>
        </div>
      )}
      
      {showForm && <TemplateForm />}
      
      <div className="space-y-2">
        {templates.map(template => (
          <TemplateItem key={template.id} template={template} />
        ))}
      </div>
      
      {templates.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">No prompt templates found. Create your first template!</p>
        </div>
      )}
    </div>
  );
} 