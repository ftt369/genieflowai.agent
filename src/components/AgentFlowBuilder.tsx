import React, { useState, ChangeEvent } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useFlowStore } from '../store/flowStore';
import { AgentStep } from '../types';
import AgentStepItem from './AgentStepItem';
import { Plus, Play, Save, X, Loader2 } from 'lucide-react';

type StepType = AgentStep['type'];

const stepTypes = [
  { type: 'research' as StepType, name: 'Research', description: 'Search for information on a topic' },
  { type: 'summarize' as StepType, name: 'Summarize', description: 'Create a concise summary' },
  { type: 'extract' as StepType, name: 'Extract', description: 'Pull out specific information' },
  { type: 'analyze' as StepType, name: 'Analyze', description: 'Perform detailed analysis' },
  { type: 'custom' as StepType, name: 'Custom', description: 'Create a custom step' }
] as const;

export default function AgentFlowBuilder() {
  const { 
    flows, 
    activeFlowId, 
    createFlow, 
    getActiveFlow, 
    addStep, 
    reorderSteps,
    runFlow,
    setActiveFlow
  } = useFlowStore();
  
  const [isCreatingFlow, setIsCreatingFlow] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDescription, setNewFlowDescription] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  const activeFlow = getActiveFlow();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && activeFlow) {
      const oldIndex = activeFlow.steps.findIndex(step => step.id === active.id);
      const newIndex = activeFlow.steps.findIndex(step => step.id === over.id);
      
      const newOrder = arrayMove(
        activeFlow.steps.map(step => step.id),
        oldIndex,
        newIndex
      );
      
      reorderSteps(activeFlow.id, newOrder);
    }
  };
  
  const handleCreateFlow = () => {
    if (newFlowName.trim()) {
      createFlow(newFlowName, newFlowDescription);
      setIsCreatingFlow(false);
      setNewFlowName('');
      setNewFlowDescription('');
    }
  };
  
  const handleAddStep = (type: StepType) => {
    if (!activeFlow) return;
    
    const stepType = stepTypes.find(t => t.type === type);
    if (!stepType) return;
    
    addStep(activeFlow.id, {
      type: stepType.type,
      name: stepType.name,
      description: stepType.description,
      prompt: '',
      order: activeFlow.steps.length
    });
  };
  
  const handleRunFlow = async () => {
    if (!activeFlow) return;
    
    setIsRunning(true);
    try {
      await runFlow(activeFlow.id);
    } finally {
      setIsRunning(false);
    }
  };
  
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewFlowName(e.target.value);
  };
  
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewFlowDescription(e.target.value);
  };
  
  if (!activeFlow && !isCreatingFlow) {
    return (
      <div className="bg-gray-100 dark:bg-[#2C2C2C] rounded-xl p-6 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agent Flow Builder</h2>
        
        {flows.length > 0 ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">Select an existing flow or create a new one</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {flows.map(flow => (
                <button
                  key={flow.id}
                  onClick={() => setActiveFlow(flow.id)}
                  className="bg-white dark:bg-[#3C3C3C] p-4 rounded-lg hover:shadow-md transition-shadow text-left"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">{flow.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{flow.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">{flow.steps.length} steps</span>
                    <span className="text-xs text-gray-400">
                      {new Date(flow.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-gray-200 dark:bg-[#3C3C3C] rounded-full p-4 inline-flex mb-4">
              <Play className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No agent flows yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Create your first agent flow to automate research tasks
            </p>
          </div>
        )}
        
        <button
          onClick={() => setIsCreatingFlow(true)}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Create New Flow</span>
        </button>
      </div>
    );
  }
  
  if (isCreatingFlow) {
    return (
      <div className="bg-gray-100 dark:bg-[#2C2C2C] rounded-xl p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Flow</h2>
          <button 
            onClick={() => setIsCreatingFlow(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="flowName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Flow Name
            </label>
            <input
              id="flowName"
              type="text"
              value={newFlowName}
              onChange={handleNameChange}
              className="w-full px-4 py-2 bg-white dark:bg-[#3C3C3C] border border-gray-200 dark:border-[#4C4C4C] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="e.g., Research Assistant"
            />
          </div>
          
          <div>
            <label htmlFor="flowDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="flowDescription"
              value={newFlowDescription}
              onChange={handleDescriptionChange}
              className="w-full px-4 py-2 bg-white dark:bg-[#3C3C3C] border border-gray-200 dark:border-[#4C4C4C] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="What does this flow do?"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsCreatingFlow(false)}
              className="px-4 py-2 border border-gray-300 dark:border-[#4C4C4C] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3C3C3C] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFlow}
              disabled={!newFlowName.trim()}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                newFlowName.trim() 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
              }`}
            >
              Create Flow
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 dark:bg-[#2C2C2C] rounded-xl p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{activeFlow?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{activeFlow?.description}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-gray-200 dark:bg-[#3C3C3C] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#4C4C4C] transition-colors">
            <Save size={18} />
          </button>
          <button 
            onClick={handleRunFlow}
            disabled={isRunning || activeFlow?.steps.length === 0}
            className={`p-2 rounded-lg text-white transition-colors ${
              isRunning || activeFlow?.steps.length === 0
                ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isRunning ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Steps</h3>
        <div className="flex flex-wrap gap-2">
          {stepTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => handleAddStep(type.type)}
              className="px-3 py-1.5 bg-white dark:bg-[#3C3C3C] border border-gray-200 dark:border-[#4C4C4C] rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#4C4C4C] transition-colors"
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Flow Steps</h3>
        
        {activeFlow?.steps.length === 0 ? (
          <div className="bg-white dark:bg-[#3C3C3C] border border-dashed border-gray-300 dark:border-[#4C4C4C] rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No steps added yet. Add steps to build your agent flow.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeFlow?.steps.map(step => step.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {activeFlow?.steps.map((step) => (
                  <AgentStepItem key={step.id} step={step} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}