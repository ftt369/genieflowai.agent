import React, { useState } from 'react';
import { AssistantMode } from '../../stores/model/modeStore';

type ModeDetailsProps = {
  mode: AssistantMode;
  onBack: () => void;
};

const ModeDetails: React.FC<ModeDetailsProps> = ({ mode, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'prompt'>('overview');
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center border-b p-4">
        <button 
          onClick={onBack}
          className="mr-3 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="text-3xl mr-3">{mode.icon}</div>
        <div>
          <h2 className="text-xl font-semibold">{mode.name}</h2>
          <p className="text-sm text-gray-500">{mode.category || 'Uncategorized'}</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'prompt' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('prompt')}
        >
          System Prompt
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'overview' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-700">{mode.description}</p>
            </div>
            
            {mode.tags && mode.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {mode.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {mode.knowledgeBaseIds && mode.knowledgeBaseIds.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Knowledge Bases</h3>
                <ul className="list-disc list-inside">
                  {mode.knowledgeBaseIds.map((id, index) => (
                    <li key={index} className="text-gray-700">{id}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {mode.researchFields && mode.researchFields.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Research Fields</h3>
                <ul className="list-disc list-inside">
                  {mode.researchFields.map((field, index) => (
                    <li key={index} className="text-gray-700">{field}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {mode.customInstructions && mode.customInstructions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Custom Instructions</h3>
                <ul className="list-disc list-inside">
                  {mode.customInstructions.map((instruction, index) => (
                    <li key={index} className="text-gray-700">{instruction}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Model Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Temperature</p>
                  <div className="flex items-center mt-1">
                    <div className="bg-gray-200 h-2 flex-grow rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${mode.temperature * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">{mode.temperature}</span>
                  </div>
                </div>
                
                {mode.topP !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Top P</p>
                    <div className="flex items-center mt-1">
                      <div className="bg-gray-200 h-2 flex-grow rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${mode.topP * 100}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">{mode.topP}</span>
                    </div>
                  </div>
                )}
                
                {mode.maxTokens !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Max Tokens</p>
                    <p className="text-sm text-gray-700">{mode.maxTokens}</p>
                  </div>
                )}
                
                {mode.frequencyPenalty !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Frequency Penalty</p>
                    <p className="text-sm text-gray-700">{mode.frequencyPenalty}</p>
                  </div>
                )}
                
                {mode.presencePenalty !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Presence Penalty</p>
                    <p className="text-sm text-gray-700">{mode.presencePenalty}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Additional Configuration</h3>
              
              <div className="space-y-4">
                {mode.stopSequences && mode.stopSequences.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Stop Sequences</p>
                    <div className="mt-1 space-y-1">
                      {mode.stopSequences.map((seq, index) => (
                        <code key={index} className="text-xs bg-gray-100 px-2 py-1 rounded block">{seq}</code>
                      ))}
                    </div>
                  </div>
                )}
                
                {mode.methodology && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Methodology</p>
                    <p className="text-sm text-gray-700">{mode.methodology}</p>
                  </div>
                )}
                
                {mode.citationStyle && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Citation Style</p>
                    <p className="text-sm text-gray-700">{mode.citationStyle}</p>
                  </div>
                )}
                
                {mode.dataAnalysisTools && mode.dataAnalysisTools.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data Analysis Tools</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mode.dataAnalysisTools.map((tool, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'prompt' && (
          <div>
            <h3 className="text-lg font-medium mb-3">System Prompt</h3>
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">
                {mode.systemPrompt}
              </pre>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="border-t p-4 flex justify-end space-x-3">
        <button 
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Use This Mode
        </button>
      </div>
    </div>
  );
};

export default ModeDetails; 