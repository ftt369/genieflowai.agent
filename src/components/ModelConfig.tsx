import React, { useState } from 'react';
import { useModelStore } from '../stores/modelStore';
import { cn } from '../lib/utils';
import { Settings, Key, Sliders } from 'lucide-react';

interface ModelConfigProps {
  onClose?: () => void;
}

export default function ModelConfig({ onClose }: ModelConfigProps) {
  const { activeModel, getModelConfig, setModelConfig } = useModelStore();
  const config = getModelConfig(activeModel);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateApiKey = async (apiKey: string) => {
    if (!apiKey) {
      setValidationError('API key is required');
      return false;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      await model.generateContent('test');
      setValidationError(null);
      return true;
    } catch (error: any) {
      setValidationError(error.message || 'Invalid API key');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async (updates: { apiKey?: string; temperature?: number; maxTokens?: number }) => {
    if (updates.apiKey) {
      const isValid = await validateApiKey(updates.apiKey);
      if (!isValid) return;
    }
    setModelConfig(activeModel, updates);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <span>Model Configuration</span>
        </h3>
        <p className="text-sm text-white/70">
          Configure your model settings and API key
        </p>
      </div>

      <div className="space-y-4">
        {/* API Key Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span>API Key</span>
          </label>
          <input
            type="password"
            value={config.apiKey || ''}
            onChange={(e) => handleSave({ apiKey: e.target.value })}
            placeholder="Enter your Gemini API key"
            className={cn(
              "w-full p-2 rounded-lg",
              "bg-white/5 backdrop-blur-sm border border-white/10",
              "text-white placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-white/20",
              validationError && "border-red-500 focus:ring-red-500"
            )}
          />
          {validationError && (
            <p className="text-sm text-red-500">{validationError}</p>
          )}
          {isValidating && (
            <p className="text-sm text-white/50">Validating API key...</p>
          )}
          <p className="text-xs text-white/50">
            Get your API key from the{' '}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>

        {/* Temperature Control */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <span>Temperature</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature || 0.7}
            onChange={(e) => handleSave({ temperature: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/50">
            <span>Precise</span>
            <span>{config.temperature?.toFixed(1)}</span>
            <span>Creative</span>
          </div>
        </div>
      </div>
    </div>
  );
} 