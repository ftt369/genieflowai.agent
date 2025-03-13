import React, { useState } from 'react';
import { Plus, Trash2, Play, Pause, Settings } from 'lucide-react';
import { gemini } from '../services/gemini';

interface ResearchStep {
  id: string;
  type: 'search' | 'analyze' | 'summarize';
  query: string;
  results: string;
  isLoading: boolean;
}

interface BotChain {
  id: string;
  name: string;
  steps: ResearchStep[];
  isRunning: boolean;
}

// Add UUID generation function for browser compatibility
function generateUUID() {
  // Simple UUID generation that doesn't rely on crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function ResearchSidebar() {
  const [chains, setChains] = useState<BotChain[]>([]);
  const [activeChainId, setActiveChainId] = useState<string | null>(null);
  const [showNewChainInput, setShowNewChainInput] = useState(false);
  const [newChainName, setNewChainName] = useState('');

  const createChain = () => {
    if (!newChainName.trim()) return;

    const newChain: BotChain = {
      id: generateUUID(),
      name: newChainName.trim(),
      steps: [],
      isRunning: false
    };

    setChains(prev => [...prev, newChain]);
    setActiveChainId(newChain.id);
    setNewChainName('');
    setShowNewChainInput(false);
  };

  const addStep = (chainId: string, type: ResearchStep['type']) => {
    const newStep: ResearchStep = {
      id: generateUUID(),
      type,
      query: '',
      results: '',
      isLoading: false
    };

    setChains(prev =>
      prev.map(chain =>
        chain.id === chainId
          ? { ...chain, steps: [...chain.steps, newStep] }
          : chain
      )
    );
  };

  const deleteStep = (chainId: string, stepId: string) => {
    setChains(prev =>
      prev.map(chain =>
        chain.id === chainId
          ? { ...chain, steps: chain.steps.filter(step => step.id !== stepId) }
          : chain
      )
    );
  };

  const updateStep = (chainId: string, stepId: string, query: string) => {
    setChains(prev =>
      prev.map(chain =>
        chain.id === chainId
          ? {
              ...chain,
              steps: chain.steps.map(step =>
                step.id === stepId ? { ...step, query } : step
              )
            }
          : chain
      )
    );
  };

  const toggleChain = async (chainId: string) => {
    const chain = chains.find(c => c.id === chainId);
    if (!chain) return;

    setChains(prev =>
      prev.map(c =>
        c.id === chainId ? { ...c, isRunning: !c.isRunning } : c
      )
    );

    if (!chain.isRunning) {
      // Execute chain steps sequentially
      for (const step of chain.steps) {
        try {
          setChains(prev =>
            prev.map(c =>
              c.id === chainId
                ? {
                    ...c,
                    steps: c.steps.map(s =>
                      s.id === step.id ? { ...s, isLoading: true } : s
                    )
                  }
                : c
            )
          );

          let result = '';
          switch (step.type) {
            case 'search':
              result = await executeSearch(step.query);
              break;
            case 'analyze':
              result = await executeAnalysis(step.query);
              break;
            case 'summarize':
              result = await executeSummary(step.query);
              break;
          }

          setChains(prev =>
            prev.map(c =>
              c.id === chainId
                ? {
                    ...c,
                    steps: c.steps.map(s =>
                      s.id === step.id
                        ? { ...s, results: result, isLoading: false }
                        : s
                    )
                  }
                : c
            )
          );
        } catch (error: any) {
          setChains(prev =>
            prev.map(c =>
              c.id === chainId
                ? {
                    ...c,
                    steps: c.steps.map(s =>
                      s.id === step.id
                        ? {
                            ...s,
                            results: `Error: ${error.message}`,
                            isLoading: false
                          }
                        : s
                    ),
                    isRunning: false
                  }
                : c
            )
          );
          break;
        }
      }
    }
  };

  const executeSearch = async (query: string) => {
    const response = await gemini.chat([
      { role: 'user', content: `Search query: ${query}` }
    ]);
    return response.content;
  };

  const executeAnalysis = async (query: string) => {
    const response = await gemini.chat([
      { role: 'user', content: `Analyze this: ${query}` }
    ]);
    return response.content;
  };

  const executeSummary = async (query: string) => {
    const response = await gemini.chat([
      { role: 'user', content: `Summarize this: ${query}` }
    ]);
    return response.content;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Research Chains</h2>
        {showNewChainInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newChainName}
              onChange={(e) => setNewChainName(e.target.value)}
              placeholder="Chain name..."
              className="flex-1 px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={createChain}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewChainInput(true)}
            className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600"
          >
            <Plus className="w-4 h-4" />
            New Chain
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {chains.map((chain) => (
          <div
            key={chain.id}
            className={`border border-gray-200 dark:border-gray-700 rounded-lg ${
              chain.id === activeChainId ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {chain.name}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleChain(chain.id)}
                  className={`p-1 rounded ${
                    chain.isRunning
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-green-500 hover:text-green-600'
                  }`}
                >
                  {chain.isRunning ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setActiveChainId(chain.id)}
                  className="p-1 text-gray-500 hover:text-gray-600"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {chain.id === activeChainId && (
              <div className="p-4 space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => addStep(chain.id, 'search')}
                    className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Add Search
                  </button>
                  <button
                    onClick={() => addStep(chain.id, 'analyze')}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Add Analysis
                  </button>
                  <button
                    onClick={() => addStep(chain.id, 'summarize')}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Summary
                  </button>
                </div>

                {chain.steps.map((step) => (
                  <div
                    key={step.id}
                    className="border border-gray-200 dark:border-gray-700 rounded p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                        {step.type}
                      </span>
                      <button
                        onClick={() => deleteStep(chain.id, step.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={step.query}
                      onChange={(e) =>
                        updateStep(chain.id, step.id, e.target.value)
                      }
                      placeholder={`Enter ${step.type} query...`}
                      className="w-full px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {step.results && (
                      <div className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                        {step.isLoading ? (
                          <div className="flex items-center justify-center py-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                          </div>
                        ) : (
                          <pre className="whitespace-pre-wrap">{step.results}</pre>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}