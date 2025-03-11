import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronUp, X, Edit2 } from 'lucide-react';
import { AgentStep } from '../types';
import { useAgentStore } from '../store/agentStore';

interface AgentStepItemProps {
  step: AgentStep;
}

export default function AgentStepItem({ step }: AgentStepItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(step.prompt || '');
  
  const { activeFlowId, updateStep, removeStep } = useAgentStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: step.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const handleSavePrompt = () => {
    if (activeFlowId) {
      updateStep(activeFlowId, step.id, { prompt: editedPrompt });
    }
    setIsEditing(false);
  };
  
  const handleRemoveStep = () => {
    if (activeFlowId) {
      removeStep(activeFlowId, step.id);
    }
  };
  
  const getStepIcon = () => {
    switch (step.type) {
      case 'research':
        return '🔍';
      case 'summarize':
        return '📝';
      case 'extract':
        return '✂️';
      case 'analyze':
        return '📊';
      case 'custom':
        return '🛠️';
      default:
        return '📋';
    }
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-[#3C3C3C] rounded-lg border border-gray-200 dark:border-[#4C4C4C] overflow-hidden"
    >
      <div className="flex items-center p-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <GripVertical size={18} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center">
            <span className="mr-2">{getStepIcon()}</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{step.name}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.description}</p>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleRemoveStep}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 pt-0 border-t border-gray-200 dark:border-[#4C4C4C]">
          {isEditing ? (
            <div>
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="w-full p-2 bg-gray-50 dark:bg-[#2C2C2C] border border-gray-200 dark:border-[#4C4C4C] rounded text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder={`Enter prompt for ${step.name}...`}
                rows={4}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#4C4C4C] rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrompt}
                  className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400">Prompt</h4>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              </div>
              {step.prompt ? (
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#2C2C2C] p-2 rounded">
                  {step.prompt}
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No prompt defined. Click edit to add one.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}