import React, { useState } from 'react';
import { useModeStore } from '../../stores/model/modeStore';
import ModeSelector from '../modes/ModeSelector';

const ModeBadge: React.FC = () => {
  const { modes, activeMode } = useModeStore();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  
  // Find the active mode
  const currentMode = modes.find(mode => mode.id === activeMode);
  
  if (!currentMode) {
    return null;
  }
  
  return (
    <>
      <button
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        onClick={() => setIsSelectorOpen(true)}
      >
        <span className="text-xl">{currentMode.icon}</span>
        <span className="font-medium">{currentMode.name}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isSelectorOpen && (
        <ModeSelector onClose={() => setIsSelectorOpen(false)} />
      )}
    </>
  );
};

export default ModeBadge; 