import React, { useState } from 'react';
import { useThemeStore } from '@/stores/theme/themeStore';
import { useModelStore } from '@/stores/model/modelStore';
import { useModeStore } from '@/stores/model/modeStore';
import { useUserPreferencesStore } from '@/stores/ui/userPreferencesStore';
import { X, Info, Cpu, Brain, MessageSquare, Clock, BrainCog } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AiSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiSettings({ isOpen, onClose }: AiSettingsProps) {
  const { profile } = useThemeStore();
  const { modelService, setModel } = useModelStore();
  const { activeMode, setMode } = useModeStore();
  const { showThinking, setShowThinking } = useUserPreferencesStore();
  
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [responseStyle, setResponseStyle] = useState('balanced');
  
  const isSpiralStyle = profile === 'spiral';
  
  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemperature(parseFloat(e.target.value));
  };
  
  const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxTokens(parseInt(e.target.value, 10));
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className={cn(
        "bg-background rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto",
        "border border-border",
        isSpiralStyle ? "p-6" : "p-4"
      )}>
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className={cn(
            "font-semibold",
            isSpiralStyle ? "text-2xl" : "text-xl"
          )}>
            AI Assistant Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-6 py-4">
          {/* Thinking Mode Toggle (NEW) */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCog className="w-5 h-5 text-primary" />
                <h3 className="font-medium">AI Thinking Process</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showThinking}
                  onChange={() => setShowThinking(!showThinking)}
                  className="sr-only peer" 
                />
                <div className={cn(
                  "w-11 h-6 rounded-full transition-colors",
                  "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                  "after:bg-white after:rounded-full after:h-5 after:w-5",
                  "after:transition-transform",
                  "peer-checked:after:translate-x-full",
                  "peer-checked:bg-primary",
                  "bg-gray-200 dark:bg-gray-700"
                )}></div>
              </label>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Show the AI's thinking process before displaying the final answer. This helps you understand how the AI reaches its conclusions.
            </p>
          </div>
          
          {/* Model Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Model</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['gpt-3.5-turbo', 'gpt-4', 'claude-3'].map((model) => (
                <button
                  key={model}
                  onClick={() => setModel(model)}
                  className={cn(
                    "py-2 px-3 rounded-lg border text-sm",
                    modelService.model === model
                      ? "bg-primary/10 border-primary/50 text-primary font-medium"
                      : "border-border hover:border-primary/30 hover:bg-primary/5"
                  )}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mode Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Mode</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['creative', 'balanced', 'precise'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMode(mode)}
                  className={cn(
                    "py-2 px-3 rounded-lg border text-sm capitalize",
                    activeMode === mode
                      ? "bg-primary/10 border-primary/50 text-primary font-medium"
                      : "border-border hover:border-primary/30 hover:bg-primary/5"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
          {/* Response Style */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Response Style</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['concise', 'balanced', 'detailed'].map((style) => (
                <button
                  key={style}
                  onClick={() => setResponseStyle(style)}
                  className={cn(
                    "py-2 px-3 rounded-lg border text-sm capitalize",
                    responseStyle === style
                      ? "bg-primary/10 border-primary/50 text-primary font-medium"
                      : "border-border hover:border-primary/30 hover:bg-primary/5"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          
          {/* Memory Toggle */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Contextual Memory</h3>
            </div>
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={memoryEnabled}
                  onChange={() => setMemoryEnabled(!memoryEnabled)}
                />
                <div className={cn(
                  "relative w-11 h-6 bg-muted rounded-full peer",
                  "peer-checked:after:translate-x-full peer-checked:after:border-white",
                  "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                  "after:bg-white after:border-gray-300 after:border after:rounded-full",
                  "after:h-5 after:w-5 after:transition-all",
                  "peer-checked:bg-primary"
                )}></div>
                <span className="ml-3 text-sm font-medium">
                  {memoryEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
              <div className="ml-2 text-muted-foreground">
                <Info className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, the AI will remember key points from your previous messages in this conversation.
            </p>
          </div>
          
          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Temperature</h3>
              <span className="text-sm">{temperature.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={handleTemperatureChange}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
          
          {/* Max Tokens Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Max Response Length</h3>
              <span className="text-sm">{maxTokens} tokens</span>
            </div>
            <input
              type="range"
              min="256"
              max="4096"
              step="256"
              value={maxTokens}
              onChange={handleMaxTokensChange}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Shorter</span>
              <span>Longer</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="pt-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className={cn(
              "px-4 py-2 rounded-lg",
              isSpiralStyle
                ? "bg-primary text-white"
                : "bg-primary/90 text-primary-foreground"
            )}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
} 