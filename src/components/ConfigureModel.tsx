import React, { useState } from 'react';
import { useModelStore } from '../stores/modelStore';
import { modelServiceFactory } from '../services/modelService';
import { ExternalLink } from 'lucide-react';

interface ConfigureModelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigureModel({ isOpen, onClose }: ConfigureModelProps) {
  const { activeModel, modelConfigs, updateModelConfig } = useModelStore();
  const [apiKey, setApiKey] = useState(modelConfigs[activeModel]?.apiKey || '');
  const [temperature, setTemperature] = useState(
    modelConfigs[activeModel]?.temperature || 0.7
  );
  const [maxTokens, setMaxTokens] = useState(
    modelConfigs[activeModel]?.maxTokens || 1000
  );

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }

    updateModelConfig(activeModel, {
      apiKey,
      temperature,
      maxTokens,
    });
    modelServiceFactory.updateConfig(activeModel, {
      apiKey,
      temperature,
      maxTokens,
    });
    onClose();
  };

  const getApiKeyLink = () => {
    switch (activeModel) {
      case 'gemini':
        return 'https://makersuite.google.com/app/apikey';
      default:
        return '#';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-white/10 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Configure {activeModel}</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">
                API Key
              </label>
              <a
                href={getApiKeyLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Enter your API key"
            />
            {activeModel === 'gemini' && (
              <p className="mt-1 text-xs text-white/60">
                Get your API key from Google AI Studio. Make sure to enable the Gemini API in your Google Cloud Console.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Temperature ({temperature})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="mt-1 text-xs text-white/60">
              Lower values make responses more focused and deterministic. Higher values make responses more creative and varied.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Max Tokens
            </label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Enter max tokens"
            />
            <p className="mt-1 text-xs text-white/60">
              Maximum number of tokens to generate in the response. 1 token ≈ 4 characters.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 