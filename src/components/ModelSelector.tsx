import React from 'react';
import { useModelStore } from '../stores/modelStore';
import type { ModelType } from '../stores/modelStore';

const models: { id: ModelType; name: string; description: string }[] = [
  { id: 'gemini', name: 'Gemini Pro', description: 'Google AI Model' },
  { id: 'gpt4', name: 'GPT-4', description: 'OpenAI Model' },
];

export default function ModelSelector() {
  const { activeModel, setActiveModel } = useModelStore();

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveModel(event.target.value as ModelType);
  };

  const selectedModel = models.find(m => m.id === activeModel);

  return (
    <div className="flex items-center gap-2">
      <select
        value={activeModel}
        onChange={handleModelChange}
        className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id} className="bg-gray-800">
            {model.name}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-400">
        {selectedModel?.description}
      </span>
    </div>
  );
} 