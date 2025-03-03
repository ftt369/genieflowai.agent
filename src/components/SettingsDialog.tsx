import React, { useState, useEffect } from 'react';
import { useModelStore } from '../store/modelStore';
import { X, Check, AlertCircle } from 'lucide-react';
import { GeminiService } from '../services/gemini';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { models, updateModel } = useModelStore();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const [isTestingKey, setIsTestingKey] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (isOpen) {
      setApiKeys(Object.fromEntries(models.map(m => [m.id, m.apiKey || ''])));
      setTestResults({});
      setIsTestingKey({});
    }
  }, [isOpen, models]);

  const testApiKey = async (modelId: string, apiKey: string) => {
    if (!apiKey.trim()) return;
    
    setIsTestingKey(prev => ({ ...prev, [modelId]: true }));
    setTestResults(prev => ({ ...prev, [modelId]: null }));
    
    try {
      const model = models.find(m => m.id === modelId);
      if (model?.provider === 'google') {
        const gemini = new GeminiService({
          apiKey,
          model: model.model,
          temperature: 0.7
        });
        
        // Test the API key with a simple request
        await gemini.chat([{ role: 'user', content: 'Test connection' }]);
        setTestResults(prev => ({ ...prev, [modelId]: true }));
      }
    } catch (error) {
      console.error('API key test failed:', error);
      setTestResults(prev => ({ ...prev, [modelId]: false }));
    } finally {
      setIsTestingKey(prev => ({ ...prev, [modelId]: false }));
    }
  };
  
  const handleSave = () => {
    Object.entries(apiKeys).forEach(([modelId, apiKey]) => {
      if (apiKey && testResults[modelId]) {
        updateModel(modelId, { apiKey });
      }
    });
    onClose();
  };

  const handleKeyChange = (modelId: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [modelId]: value }));
    setTestResults(prev => ({ ...prev, [modelId]: null }));
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#2C2C2C] rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#3C3C3C]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            API Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-[#3C3C3C] rounded text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-4">
            {models.map((model) => (
              <div key={model.id} className="space-y-2">
                <label
                  htmlFor={`apiKey-${model.id}`}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {model.name} API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id={`apiKey-${model.id}`}
                    value={apiKeys[model.id] || ''}
                    onChange={(e) => handleKeyChange(model.id, e.target.value)}
                    className={`w-full px-3 py-2 bg-white dark:bg-[#3C3C3C] border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      testResults[model.id] === false
                        ? 'border-red-300 dark:border-red-500 focus:ring-red-500'
                        : testResults[model.id] === true
                        ? 'border-green-300 dark:border-green-500 focus:ring-green-500'
                        : 'border-gray-200 dark:border-[#4C4C4C] focus:ring-blue-500'
                    }`}
                    placeholder={`Enter ${model.name} API key`}
                  />
                  {apiKeys[model.id] && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {isTestingKey[model.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500" />
                      ) : (
                        <button
                          onClick={() => testApiKey(model.id, apiKeys[model.id])}
                          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Test
                        </button>
                      )}
                      {testResults[model.id] === true && (
                        <Check size={16} className="text-green-500" />
                      )}
                      {testResults[model.id] === false && (
                        <AlertCircle size={16} className="text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {testResults[model.id] === false && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    Invalid API key. Please check and try again.
                  </p>
                )}
                {model.provider === 'google' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get your API key from the{' '}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Google AI Studio
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-[#4C4C4C] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3C3C3C] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 