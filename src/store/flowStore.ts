import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface AgentStep {
  id: string;
  type: 'research' | 'summarize' | 'extract' | 'analyze' | 'custom';
  name: string;
  description: string;
  prompt: string;
  order: number;
  config?: Record<string, unknown>;
}

export interface AgentFlow {
  id: string;
  name: string;
  description: string;
  steps: AgentStep[];
  createdAt: Date;
  updatedAt: Date;
}

interface FlowState {
  flows: AgentFlow[];
  activeFlowId: string | null;
  setActiveFlow: (id: string | null) => void;
  createFlow: (name: string, description: string) => AgentFlow;
  getActiveFlow: () => AgentFlow | null;
  addStep: (flowId: string, step: Omit<AgentStep, 'id'>) => void;
  removeStep: (flowId: string, stepId: string) => void;
  updateStep: (flowId: string, stepId: string, updates: Partial<AgentStep>) => void;
  reorderSteps: (flowId: string, newOrder: string[]) => void;
  runFlow: (flowId: string) => Promise<void>;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  flows: [],
  activeFlowId: null,

  setActiveFlow: (id) => set({ activeFlowId: id }),

  createFlow: (name, description) => {
    const newFlow: AgentFlow = {
      id: uuidv4(),
      name,
      description,
      steps: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      flows: [...state.flows, newFlow],
      activeFlowId: newFlow.id,
    }));

    return newFlow;
  },

  getActiveFlow: () => {
    const { flows, activeFlowId } = get();
    return flows.find((flow) => flow.id === activeFlowId) || null;
  },

  addStep: (flowId, stepData) => {
    const newStep: AgentStep = {
      id: uuidv4(),
      ...stepData,
      order: get().flows.find(f => f.id === flowId)?.steps.length || 0,
    };

    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              steps: [...flow.steps, newStep],
              updatedAt: new Date(),
            }
          : flow
      ),
    }));
  },

  removeStep: (flowId, stepId) => {
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              steps: flow.steps.filter((step) => step.id !== stepId),
              updatedAt: new Date(),
            }
          : flow
      ),
    }));
  },

  updateStep: (flowId, stepId, updates) => {
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              steps: flow.steps.map((step) =>
                step.id === stepId ? { ...step, ...updates } : step
              ),
              updatedAt: new Date(),
            }
          : flow
      ),
    }));
  },

  reorderSteps: (flowId, newOrder) => {
    set((state) => ({
      flows: state.flows.map((flow) => {
        if (flow.id !== flowId) return flow;

        const reorderedSteps = newOrder
          .map((id) => flow.steps.find((step) => step.id === id))
          .filter((step): step is AgentStep => step !== undefined);

        return {
          ...flow,
          steps: reorderedSteps,
          updatedAt: new Date(),
        };
      }),
    }));
  },

  runFlow: async (flowId) => {
    const flow = get().flows.find((f) => f.id === flowId);
    if (!flow) return;

    // TODO: Implement actual flow execution logic
    for (const step of flow.steps) {
      console.log(`Executing step: ${step.name}`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate step execution
    }
  },
})); 