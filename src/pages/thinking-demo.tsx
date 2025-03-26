import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import ChatWithThinking from '../components/chat/ChatWithThinking';
import { userPreferencesStore } from '../stores/userPreferencesStore';
import { useThemeStore } from '../stores/theme/themeStore';
import { Brain, Moon, Sun, Monitor, Info } from 'lucide-react';

const ThinkingDemo: React.FC = () => {
  const { showThinkingProcess, setShowThinkingProcess } = userPreferencesStore();
  const { mode, setMode } = useThemeStore();
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  
  const toggleDarkMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    document.documentElement.classList.toggle('dark', newMode === 'dark');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300">
        {showInfoBanner && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start">
            <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-800 dark:text-blue-300">About Thinking Mode</h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                Thinking Mode shows you how the AI reasons through problems step by step before providing a final answer. 
                This helps build trust by making the AI's decision process transparent.
              </p>
            </div>
            <button 
              onClick={() => setShowInfoBanner(false)}
              className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 ml-4"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Thinking Mode Demo</h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
                Experience how the AI assistant thinks through problems step by step. This feature
                provides transparency into the reasoning process, helping you understand how the
                AI arrives at its conclusions.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={mode === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
              >
                {mode === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/60 p-6 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <Brain className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-300 text-lg">Thinking Mode</h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                  {showThinkingProcess 
                    ? "Currently showing the AI's step-by-step reasoning" 
                    : "Currently showing direct answers only"}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-3 text-sm text-blue-700 dark:text-blue-300">Off</span>
              <div 
                onClick={() => setShowThinkingProcess(!showThinkingProcess)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  showThinkingProcess 
                    ? "bg-blue-600 dark:bg-blue-500" 
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showThinkingProcess ? "translate-x-6" : "translate-x-1"
                  }`} 
                />
              </div>
              <span className="ml-3 text-sm text-blue-700 dark:text-blue-300">On</span>
              <button
                onClick={() => setShowThinkingProcess(!showThinkingProcess)}
                className={`ml-4 px-4 py-2 rounded-lg transition-colors ${
                  showThinkingProcess 
                    ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" 
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {showThinkingProcess ? "Hide Thinking Process" : "Show Thinking Process"}
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 h-[calc(100vh-250px)]">
          <ChatWithThinking />
        </div>
        
        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Example Questions to Try</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Complex Problem Solving</h3>
              <ul className="space-y-2 text-sm">
                <li className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">"How would you solve the traveling salesman problem for 5 cities?"</li>
                <li className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">"Explain the prisoner's dilemma and the optimal strategy."</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Ethical Reasoning</h3>
              <ul className="space-y-2 text-sm">
                <li className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">"What are the ethical considerations for self-driving cars making life-or-death decisions?"</li>
                <li className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">"Should AI systems be programmed with a sense of ethics, and if so, whose ethics?"</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Technical Design</h3>
              <ul className="space-y-2 text-sm">
                <li className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">"Design a system for real-time fraud detection for e-commerce transactions."</li>
                <li className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">"How would you implement a distributed cache system for a high-traffic website?"</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Creative Problem Solving</h3>
              <ul className="space-y-2 text-sm">
                <li className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">"Develop a solution for reducing plastic waste in urban areas."</li>
                <li className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">"How might we redesign public transportation to be more efficient and accessible?"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ThinkingDemo; 