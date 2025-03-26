import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import ThinkingMode from '../components/thinking/ThinkingMode';

const TestThinkingPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinking, setThinking] = useState('');
  const [answer, setAnswer] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Check environment variables on component mount
  useEffect(() => {
    const envInfo = {
      availableEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
      geminiKeySet: !!import.meta.env.VITE_GEMINI_API_KEY,
      isDev: import.meta.env.DEV
    };
    setDebugInfo(envInfo);
    console.log('Debug info:', envInfo);
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    setThinking('');
    setAnswer('');
    setIsThinking(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      // Sample thinking process for demonstration
      const demoThinking = `Let me analyze this question step by step:

Step 1: First, I need to understand what is being asked.
${input}

Step 2: Let me break down the key components of this question.
- This seems to be asking about ${input.split(' ').slice(0, 3).join(' ')}
- I need to consider various aspects of this topic

Step 3: Let me gather relevant knowledge about this.
- ${input.split(' ').slice(0, 2).join(' ')} is related to ${input.split(' ').slice(-2).join(' ')}
- There are several important factors to consider:
  1. Historical context
  2. Current understanding
  3. Practical applications

Step 4: Analyzing potential approaches to answer this.
- I could start with a definition
- I should provide examples to clarify
- I should address common misconceptions

Step 5: Formulating a comprehensive response based on the above analysis.
- Will begin with a clear explanation
- Will provide supporting evidence
- Will conclude with practical implications

Now I can provide a well-reasoned answer based on this thinking process.`;

      const demoAnswer = `Based on my analysis, here's my answer about ${input}:

This is a comprehensive explanation that addresses all aspects of your question. I've considered the historical context, current understanding, and practical applications to provide you with an accurate and helpful response.

The key points to understand are:
1. First important point about ${input}
2. Second critical aspect to consider
3. Practical implications for everyday understanding

I hope this helps clarify your question about ${input}!`;

      setThinking(demoThinking);
      setIsLoading(false);
      
      // The answer will be shown after clicking the button in the ThinkingMode component
    }, 1500);
  };
  
  const handleThinkingComplete = () => {
    setIsThinking(false);
    setAnswer(thinking.split('Now I can provide a well-reasoned answer')[1] || 'Here is my answer after careful thinking.');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Thinking Mode Demo</h1>
          <p className="text-gray-600 mt-2">
            This page demonstrates how the AI thinking process works. Ask a question and watch how the AI thinks through it step by step.
          </p>
          
          {/* Debug information */}
          {debugInfo && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <h3 className="font-semibold text-yellow-800">Debug Information:</h3>
              <ul className="list-disc pl-5 mt-1 text-yellow-700">
                <li>Environment: {debugInfo.isDev ? 'Development' : 'Production'}</li>
                <li>Available env vars: {debugInfo.availableEnvVars.join(', ') || 'None'}</li>
                <li>Gemini API key: {debugInfo.geminiKeySet ? 'Set ✓' : 'Not set ✗'}</li>
              </ul>
              <p className="mt-2 text-yellow-600 text-xs">Note: This is a simulated demo. In a real implementation, API calls would be made to the Gemini API.</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex flex-col space-y-4">
              <label className="font-medium">
                Ask a complex question:
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="E.g., What are the implications of quantum computing on cryptography?"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || isThinking}
              />
              <button
                type="submit"
                className={`bg-blue-600 text-white px-4 py-2 rounded-lg ${
                  isLoading || isThinking ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
                disabled={isLoading || isThinking}
              >
                {isLoading ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </form>
          
          {isThinking && (
            <ThinkingMode 
              thinking={thinking} 
              onComplete={handleThinkingComplete} 
            />
          )}
          
          {!isThinking && answer && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Final Answer</h3>
              <div className="text-blue-900 whitespace-pre-wrap">
                {answer}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TestThinkingPage; 