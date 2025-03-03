import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  WorkflowTemplate, 
  WorkflowStep, 
  WorkflowExecution, 
  Document, 
  WorkflowContext 
} from '../types/workflow';

interface WorkflowState {
  templates: WorkflowTemplate[];
  activeTemplateId: string | null;
  executions: WorkflowExecution[];
  activeExecutionId: string | null;
  documents: Document[];
  context: WorkflowContext | null;

  // Template management
  createTemplate: (name: string, description: string, category: string) => WorkflowTemplate;
  updateTemplate: (id: string, updates: Partial<Omit<WorkflowTemplate, 'id'>>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => WorkflowTemplate;
  setActiveTemplate: (id: string | null) => void;
  getActiveTemplate: () => WorkflowTemplate | null;

  // Step management
  addStep: (templateId: string, step: Omit<WorkflowStep, 'id' | 'order' | 'status'>) => WorkflowStep;
  updateStep: (templateId: string, stepId: string, updates: Partial<WorkflowStep>) => void;
  removeStep: (templateId: string, stepId: string) => void;
  reorderSteps: (templateId: string, stepIds: string[]) => void;

  // Document management
  addDocument: (document: Omit<Document, 'id'>) => Document;
  removeDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;

  // Workflow execution
  startExecution: (templateId: string) => Promise<WorkflowExecution>;
  stopExecution: (executionId: string) => void;
  resumeExecution: (executionId: string) => Promise<void>;
  getExecutionStatus: (executionId: string) => WorkflowExecution | null;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  templates: [],
  activeTemplateId: null,
  executions: [],
  activeExecutionId: null,
  documents: [],
  context: null,

  // Template management
  createTemplate: (name, description, category) => {
    const newTemplate: WorkflowTemplate = {
      id: uuidv4(),
      name,
      description,
      category,
      steps: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      templates: [...state.templates, newTemplate],
      activeTemplateId: newTemplate.id,
    }));

    return newTemplate;
  },

  updateTemplate: (id, updates) => {
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === id
          ? { ...template, ...updates, updatedAt: new Date() }
          : template
      ),
    }));
  },

  deleteTemplate: (id) => {
    set((state) => ({
      templates: state.templates.filter((template) => template.id !== id),
      activeTemplateId: state.activeTemplateId === id ? null : state.activeTemplateId,
    }));
  },

  duplicateTemplate: (id) => {
    const template = get().templates.find((t) => t.id === id);
    if (!template) throw new Error('Template not found');

    const newTemplate: WorkflowTemplate = {
      ...template,
      id: uuidv4(),
      name: `${template.name} (Copy)`,
      steps: template.steps.map((step) => ({ ...step, id: uuidv4() })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      templates: [...state.templates, newTemplate],
    }));

    return newTemplate;
  },

  setActiveTemplate: (id) => {
    set({ activeTemplateId: id });
  },

  getActiveTemplate: () => {
    const { templates, activeTemplateId } = get();
    return activeTemplateId ? templates.find((t) => t.id === activeTemplateId) || null : null;
  },

  // Step management
  addStep: (templateId, step) => {
    const newStep: WorkflowStep = {
      ...step,
      id: uuidv4(),
      order: get().templates.find((t) => t.id === templateId)?.steps.length || 0,
      status: 'pending',
    };

    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === templateId
          ? {
              ...template,
              steps: [...template.steps, newStep],
              updatedAt: new Date(),
            }
          : template
      ),
    }));

    return newStep;
  },

  updateStep: (templateId, stepId, updates) => {
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === templateId
          ? {
              ...template,
              steps: template.steps.map((step) =>
                step.id === stepId ? { ...step, ...updates } : step
              ),
              updatedAt: new Date(),
            }
          : template
      ),
    }));
  },

  removeStep: (templateId, stepId) => {
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === templateId
          ? {
              ...template,
              steps: template.steps.filter((step) => step.id !== stepId),
              updatedAt: new Date(),
            }
          : template
      ),
    }));
  },

  reorderSteps: (templateId, stepIds) => {
    set((state) => {
      const template = state.templates.find((t) => t.id === templateId);
      if (!template) return state;

      const stepsMap = new Map(template.steps.map((step) => [step.id, step]));
      const reorderedSteps = stepIds
        .map((id, index) => {
          const step = stepsMap.get(id);
          return step ? { ...step, order: index } : null;
        })
        .filter((step): step is WorkflowStep => step !== null);

      return {
        templates: state.templates.map((t) =>
          t.id === templateId
            ? { ...t, steps: reorderedSteps, updatedAt: new Date() }
            : t
        ),
      };
    });
  },

  // Document management
  addDocument: (document) => {
    const newDocument: Document = {
      ...document,
      id: uuidv4(),
    };

    set((state) => ({
      documents: [...state.documents, newDocument],
    }));

    return newDocument;
  },

  removeDocument: (id) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    }));
  },

  updateDocument: (id, updates) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    }));
  },

  // Workflow execution
  startExecution: async (templateId) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) throw new Error('Template not found');

    const execution: WorkflowExecution = {
      id: uuidv4(),
      templateId,
      status: 'running',
      currentStepId: template.steps[0]?.id || null,
      results: {},
      startedAt: new Date(),
    };

    set((state) => ({
      executions: [...state.executions, execution],
      activeExecutionId: execution.id,
      context: {
        documents: [...state.documents],
        variables: {},
        history: [],
      },
    }));

    // Start executing the workflow
    try {
      await executeWorkflow(execution.id);
      return execution;
    } catch (err) {
      const error = err as Error;
      set((state) => ({
        executions: state.executions.map((e) =>
          e.id === execution.id
            ? { ...e, status: 'error', error: error.message }
            : e
        ),
      }));
      throw error;
    }
  },

  stopExecution: (executionId) => {
    set((state) => ({
      executions: state.executions.map((execution) =>
        execution.id === executionId
          ? { ...execution, status: 'error', error: 'Execution stopped by user' }
          : execution
      ),
    }));
  },

  resumeExecution: async (executionId) => {
    const execution = get().executions.find((e) => e.id === executionId);
    if (!execution) throw new Error('Execution not found');

    set((state) => ({
      executions: state.executions.map((e) =>
        e.id === executionId ? { ...e, status: 'running' } : e
      ),
    }));

    try {
      await executeWorkflow(executionId);
    } catch (err) {
      const error = err as Error;
      set((state) => ({
        executions: state.executions.map((e) =>
          e.id === executionId
            ? { ...e, status: 'error', error: error.message }
            : e
        ),
      }));
      throw error;
    }
  },

  getExecutionStatus: (executionId) => {
    return get().executions.find((e) => e.id === executionId) || null;
  },
}));

// Helper function to execute workflow steps
async function executeWorkflow(executionId: string) {
  const store = useWorkflowStore.getState();
  const execution = store.executions.find((e) => e.id === executionId);
  if (!execution) throw new Error('Execution not found');

  const template = store.templates.find((t) => t.id === execution.templateId);
  if (!template) throw new Error('Template not found');

  for (const step of template.steps) {
    if (execution.status !== 'running') break;

    store.updateStep(template.id, step.id, { status: 'running' });

    try {
      // Execute the step based on its type
      const result = await executeStep(step, store.context!);
      
      store.updateStep(template.id, step.id, { 
        status: 'completed',
        result 
      });

      // Update execution context with step results
      store.context!.variables[step.id] = result;
      store.context!.history.push({
        stepId: step.id,
        action: 'complete',
        timestamp: new Date(),
        details: result
      });

    } catch (err) {
      const error = err as Error;
      store.updateStep(template.id, step.id, {
        status: 'error',
        error: error.message
      });
      throw error;
    }
  }

  // Mark execution as completed
  store.executions = store.executions.map((e) =>
    e.id === executionId
      ? { ...e, status: 'completed', completedAt: new Date() }
      : e
  );
}

// Helper function to execute a single step
async function executeStep(step: WorkflowStep, context: WorkflowContext) {
  // This would be replaced with actual implementation for each step type
  switch (step.type) {
    case 'document_input':
      // Handle document processing
      break;
    case 'summarize':
      // Handle summarization
      break;
    case 'research':
      // Handle research
      break;
    case 'analyze':
      // Handle analysis
      break;
    case 'write':
      // Handle writing
      break;
    case 'verify':
      // Handle verification
      break;
    case 'proofread':
      // Handle proofreading
      break;
    case 'export':
      // Handle export
      break;
    case 'custom':
      // Handle custom step
      break;
    default:
      throw new Error(`Unknown step type: ${step.type}`);
  }

  // Simulate step execution
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { message: `Executed ${step.type} step` };
} 