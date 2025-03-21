import React, { useState, useRef } from 'react';
import { useModeStore } from '../../stores/model/modeStore';
import { AssistantMode } from '../../stores/model/modeStore';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import ModeCard from './ModeCard';
import ModeDetails from './ModeDetails';

type ModeSelectorProps = {
  onClose?: () => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onClose }) => {
  const { modes, activeMode, setActiveMode } = useModeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<AssistantMode | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Get all available categories
  const categories = Array.from(new Set(modes.map(mode => mode.category || 'Other')));

  // Filter modes based on search query and selected category
  const filteredModes = modes.filter(mode => {
    const matchesSearch = searchQuery === '' || 
      mode.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mode.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mode.tags && mode.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
    const matchesCategory = selectedCategory === null || mode.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group modes by category
  const groupedModes: Record<string, AssistantMode[]> = {};
  filteredModes.forEach(mode => {
    const category = mode.category || 'Other';
    if (!groupedModes[category]) {
      groupedModes[category] = [];
    }
    groupedModes[category].push(mode);
  });

  const handleSelectMode = (modeId: string) => {
    setActiveMode(modeId);
    if (onClose) onClose();
  };

  const handleViewModeDetails = (mode: AssistantMode) => {
    setSelectedMode(mode);
  };

  const handleBackFromDetails = () => {
    setSelectedMode(null);
  };

  // Handle outside clicks to close the modal
  useOnClickOutside(modalRef, () => {
    if (onClose) onClose();
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {!selectedMode ? (
          <>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Select Assistant Mode</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex border-b">
              {/* Category tabs */}
              <div className="w-1/4 border-r overflow-y-auto max-h-[70vh]">
                <div 
                  className={`px-4 py-3 cursor-pointer ${selectedCategory === null ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All Modes
                </div>
                {categories.map(category => (
                  <div 
                    key={category}
                    className={`px-4 py-3 cursor-pointer ${selectedCategory === category ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
              
              {/* Main content */}
              <div className="w-3/4">
                {/* Search */}
                <div className="p-4 border-b">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search modes..."
                      className="w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Mode list */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                  {Object.keys(groupedModes).length > 0 ? (
                    Object.keys(groupedModes).map(category => (
                      <div key={category} className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 mb-3">{category}</h3>
                        {groupedModes[category].map(mode => (
                          <div key={mode.id} className="relative">
                            <ModeCard 
                              mode={mode}
                              isActive={activeMode === mode.id}
                              onSelect={handleSelectMode}
                            />
                            <button 
                              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewModeDetails(mode);
                              }}
                              title="View Mode Details"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No modes found matching your search.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => window.open('/modes/customize', '_blank')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Customize Modes
              </button>
            </div>
          </>
        ) : (
          <ModeDetails 
            mode={selectedMode} 
            onBack={handleBackFromDetails} 
          />
        )}
      </div>
    </div>
  );
};

export default ModeSelector; 