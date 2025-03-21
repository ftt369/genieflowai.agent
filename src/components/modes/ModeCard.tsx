import React from 'react';
import { AssistantMode } from '../../stores/model/modeStore';

type ModeCardProps = {
  mode: AssistantMode;
  isActive: boolean;
  onSelect: (modeId: string) => void;
};

const ModeCard: React.FC<ModeCardProps> = ({ mode, isActive, onSelect }) => {
  return (
    <div 
      className={`relative border rounded-lg p-4 mb-3 cursor-pointer transition-all ${
        isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={() => onSelect(mode.id)}
    >
      <div className="flex items-start space-x-4">
        {/* Mode icon */}
        <div className="text-3xl flex-shrink-0 mt-1">
          {mode.icon}
        </div>
        
        {/* Mode content */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-medium">{mode.name}</h3>
            
            {/* Action buttons */}
            <div className="flex space-x-2">
              <button className="text-gray-400 hover:text-gray-600" title="Share">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </button>
              <button className="text-gray-400 hover:text-gray-600" title="Favorite">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
              <button className="text-gray-400 hover:text-gray-600" title="Settings">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mode description */}
          <p className="text-sm text-gray-600 mb-2">{mode.description}</p>
          
          {/* Tags */}
          {mode.tags && mode.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {mode.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
              {mode.tags.length > 3 && (
                <span className="text-xs text-gray-500 px-1 py-0.5">
                  +{mode.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-2 right-2">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            Active
          </span>
        </div>
      )}
      
      {/* Selection checkbox */}
      <div className="absolute top-4 left-4">
        <input 
          type="checkbox" 
          className="h-4 w-4 border-gray-300 rounded"
          checked={isActive}
          onChange={() => onSelect(mode.id)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default ModeCard; 