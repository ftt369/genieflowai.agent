import React, { useState } from 'react';
import { 
  Plus, 
  Save, 
  Play, 
  Copy, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  FileText,
  Search,
  Edit3,
  CheckCircle,
  AlertCircle,
  FileOutput
} from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { WorkflowStep, WorkflowTemplate } from '../types/workflow';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const stepTypeIcons = {
  document_input: FileText,
  summarize: Edit3,
  research: Search,
  analyze: Search,
  write: Edit3,
  verify: CheckCircle,
  proofread: AlertCircle,
  export: FileOutput,
  custom: Edit3,
} as const;

const stepTypeColors = {
  document_input: 'bg-purple-500',
  summarize: 'bg-blue-500',
  research: 'bg-green-500',
  analyze: 'bg-yellow-500',
  write: 'bg-pink-500',
  verify: 'bg-cyan-500',
  proofread: 'bg-orange-500',
  export: 'bg-red-500',
  custom: 'bg-gray-500',
} as const;

interface SortableStepProps {
  step: WorkflowStep;
  index: number;
  onReorder: (stepId: string, direction: 'up' | 'down') => void;
  onRemove: (stepId: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

function SortableStep({ step, index, onReorder, onRemove, isFirst, isLast }: SortableStepProps) {
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

  const Icon = stepTypeIcons[step.type];

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="bg-white dark:bg-[#2C2C2C] rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded ${stepTypeColors[step.type]}`}>
            <Icon size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {step.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReorder(step.id, 'up');
            }}
            disabled={isFirst}
            className={`p-1 ${
              isFirst
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <ArrowUp size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReorder(step.id, 'down');
            }}
            disabled={isLast}
            className={`p-1 ${
              isLast
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <ArrowDown size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(step.id);
            }}
            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowBuilder() {
  const { 
    templates,
    activeTemplateId,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    setActiveTemplate,
    getActiveTemplate,
    addStep,
    updateStep,
    removeStep,
    reorderSteps,
    startExecution
  } = useWorkflowStore();

  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('');
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [newStep, setNewStep] = useState<Partial<WorkflowStep>>({
    type: 'document_input',
    name: '',
    description: '',
    config: {}
  });

  const activeTemplate = getActiveTemplate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateTemplate = () => {
    if (newTemplateName.trim()) {
      createTemplate(newTemplateName, newTemplateDescription, newTemplateCategory);
      setShowNewTemplateModal(false);
      setNewTemplateName('');
      setNewTemplateDescription('');
      setNewTemplateCategory('');
    }
  };

  const handleAddStep = () => {
    if (activeTemplate && newStep.name && newStep.type) {
      addStep(activeTemplate.id, newStep as Omit<WorkflowStep, 'id' | 'order' | 'status'>);
      setShowAddStepModal(false);
      setNewStep({
        type: 'document_input',
        name: '',
        description: '',
        config: {}
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && activeTemplate) {
      const oldIndex = activeTemplate.steps.findIndex((step) => step.id === active.id);
      const newIndex = activeTemplate.steps.findIndex((step) => step.id === over?.id);
      
      const newSteps = arrayMove(activeTemplate.steps, oldIndex, newIndex);
      const stepIds = newSteps.map(step => step.id);
      reorderSteps(activeTemplate.id, stepIds);
    }
  };

  const handleReorderStep = (stepId: string, direction: 'up' | 'down') => {
    if (!activeTemplate) return;

    const currentIndex = activeTemplate.steps.findIndex(s => s.id === stepId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < activeTemplate.steps.length) {
      const newStepIds = Array.from(activeTemplate.steps.map(s => s.id));
      [newStepIds[currentIndex], newStepIds[newIndex]] = [newStepIds[newIndex], newStepIds[currentIndex]];
      reorderSteps(activeTemplate.id, newStepIds);
    }
  };

  if (!activeTemplate) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Workflow Templates</h2>
          <button
            onClick={() => setShowNewTemplateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>New Template</span>
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-[#2C2C2C] rounded-full p-4 inline-flex mb-4">
              <FileText className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              No workflow templates yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Create your first template to start building agent workflows
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-[#2C2C2C] rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => duplicateTemplate(template.id)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {template.steps.map((step, index) => {
                    const Icon = stepTypeIcons[step.type];
                    return (
                      <div
                        key={step.id}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                      >
                        <div className={`p-1 rounded ${stepTypeColors[step.type]}`}>
                          <Icon size={12} className="text-white" />
                        </div>
                        <span>{step.name}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {template.steps.length} steps
                  </span>
                  <button
                    onClick={() => setActiveTemplate(template.id)}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {activeTemplate.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeTemplate.description}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTemplate(null)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => startExecution(activeTemplate.id)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Play size={18} />
              <span>Run Workflow</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowAddStepModal(true)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all w-full justify-center"
          >
            <Plus size={18} />
            <span>Add Step</span>
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activeTemplate.steps.map(step => step.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {activeTemplate.steps.map((step, index) => (
                <SortableStep
                  key={step.id}
                  step={step}
                  index={index}
                  onReorder={handleReorderStep}
                  onRemove={(stepId) => removeStep(activeTemplate.id, stepId)}
                  isFirst={index === 0}
                  isLast={index === activeTemplate.steps.length - 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* New Template Modal */}
      {showNewTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-xl p-6 w-96">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New Template
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#3C3C3C] rounded-lg"
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#3C3C3C] rounded-lg"
                  placeholder="Enter template description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#3C3C3C] rounded-lg"
                  placeholder="e.g., Legal, Research, Content"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNewTemplateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3C3C3C] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Step Modal */}
      {showAddStepModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-xl p-6 w-96">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add Workflow Step
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Step Type
                </label>
                <select
                  value={newStep.type}
                  onChange={(e) => setNewStep({ ...newStep, type: e.target.value as WorkflowStep['type'] })}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#3C3C3C] rounded-lg"
                >
                  <option value="document_input">Document Input</option>
                  <option value="summarize">Summarize</option>
                  <option value="research">Research</option>
                  <option value="analyze">Analyze</option>
                  <option value="write">Write</option>
                  <option value="verify">Verify</option>
                  <option value="proofread">Proofread</option>
                  <option value="export">Export</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Step Name
                </label>
                <input
                  type="text"
                  value={newStep.name}
                  onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#3C3C3C] rounded-lg"
                  placeholder="Enter step name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newStep.description}
                  onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#3C3C3C] rounded-lg"
                  placeholder="Enter step description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddStepModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3C3C3C] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStep}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Add Step
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 