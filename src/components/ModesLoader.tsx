import React, { useEffect, useRef } from 'react';
import { useModeStore } from '@/stores/model/modeStore';
import SPECIALIZED_MODES from '@/data/aiModes';

export const ModesLoader: React.FC = () => {
  const { modes, addCustomMode, updateMode } = useModeStore();
  const modesLoadedRef = useRef(false);

  useEffect(() => {
    // Only load modes once
    if (modesLoadedRef.current) return;
    
    // Check if specialized modes already exist
    const loadSpecializedModes = () => {
      SPECIALIZED_MODES.forEach(mode => {
        const existingMode = modes.find(m => m.name === mode.name);
        if (existingMode) {
          // Update if exists but might need updates
          updateMode(existingMode.id, {
            ...mode,
            id: existingMode.id // preserve the existing ID
          });
        } else {
          // Add if doesn't exist
          addCustomMode(mode);
        }
      });
      
      console.log("Specialized AI modes loaded successfully");
    };

    loadSpecializedModes();
    modesLoadedRef.current = true;
  }, [addCustomMode, updateMode]); // Remove 'modes' from dependencies

  // This is a utility component that doesn't render anything
  return null;
};

export default ModesLoader; 