import React, { useState, useRef, useEffect } from 'react';
import { useModeStore } from '@/stores/model/modeStore';
import { useThemeStore } from '@/stores/theme/themeStore';
import { cn } from '@/utils/cn';
import { 
  ChevronDown, 
  Check, 
  Plus, 
  Settings, 
  Edit, 
  Download, 
  Upload,
  Sparkles 
} from 'lucide-react';

interface ModeDropdownProps {
  onSelect?: (modeId: string) => void;
  onOpenSettings?: () => void;
  onCreateMode?: () => void;
  onCustomizeMode?: (modeId: string) => void;
}

const ModeDropdown: React.FC<ModeDropdownProps> = ({ 
  onSelect,
  onOpenSettings,
  onCreateMode,
  onCustomizeMode
}) => {
  const { modes, activeMode, setActiveMode, customModes } = useModeStore();
  const { profile } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentMode = modes.find(m => m.id === activeMode);
  const isSpiralStyle = profile === 'spiral';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMode = (modeId: string) => {
    setActiveMode(modeId);
    if (onSelect) {
      onSelect(modeId);
    }
    setIsOpen(false);
  };
  
  const handleCustomizeMode = (modeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCustomizeMode) {
      onCustomizeMode(modeId);
      setIsOpen(false);
    }
  };

  // Group modes by category
  const groupedModes = modes.reduce((acc, mode) => {
    const category = mode.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(mode);
    return acc;
  }, {} as Record<string, typeof modes>);

  // Sort categories
  const sortedCategories = Object.keys(groupedModes).sort((a, b) => {
    if (a === 'General') return -1;
    if (b === 'General') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          isSpiralStyle
            ? "bg-white/20 hover:bg-white/30 text-white"
            : "bg-accent/20 hover:bg-accent/40 text-foreground"
        )}
      >
        <span className="text-sm font-medium flex items-center">
          {currentMode?.icon && <span className="mr-1">{currentMode.icon}</span>}
          <span className="max-w-[120px] truncate hidden sm:block">{currentMode?.name || 'Standard Chat'}</span>
          <span className="sm:hidden">Mode</span>
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 opacity-70",
          isSpiralStyle
            ? "text-amber-400"
            : "text-muted-foreground"
        )} />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute z-50 mt-1 w-72 rounded-md shadow-lg overflow-hidden",
          isSpiralStyle
            ? "bg-white dark:bg-slate-900 border border-amber-400"
            : "bg-background border border-border"
        )}>
          <div className="max-h-[60vh] overflow-y-auto py-2">
            {sortedCategories.map(category => (
              <div key={category} className="px-1 py-1">
                <div className={cn(
                  "px-3 py-1 text-xs font-semibold",
                  isSpiralStyle
                    ? "text-blue-900 dark:text-amber-400"
                    : "text-muted-foreground"
                )}>
                  {category}
                </div>
                {groupedModes[category].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => handleSelectMode(mode.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md",
                      "flex items-center justify-between",
                      activeMode === mode.id
                        ? isSpiralStyle
                          ? "bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-amber-400"
                          : "bg-primary/10 text-primary"
                        : isSpiralStyle
                          ? "hover:bg-blue-50 dark:hover:bg-blue-900/10 text-foreground"
                          : "hover:bg-accent/50 text-foreground"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <span className="text-lg">{mode.icon}</span>
                      </div>
                      <div>
                        <div className="font-medium">{mode.name}</div>
                        <div className={cn(
                          "text-xs",
                          isSpiralStyle
                            ? "text-gray-600 dark:text-gray-300"
                            : "text-muted-foreground"
                        )}>
                          {mode.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {activeMode === mode.id && (
                        <Check className={cn(
                          "h-4 w-4 flex-shrink-0",
                          isSpiralStyle
                            ? "text-blue-600 dark:text-amber-400"
                            : "text-primary"
                        )} />
                      )}
                      {onCustomizeMode && (
                        <button
                          onClick={(e) => handleCustomizeMode(mode.id, e)}
                          className={cn(
                            "ml-1 p-1.5 rounded-full",
                            isSpiralStyle
                              ? "hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-amber-400"
                              : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                          )}
                          title="Customize mode"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
          
          {/* Footer actions */}
          <div className={cn(
            "border-t px-3 py-3",
            isSpiralStyle
              ? "border-amber-200 dark:border-amber-800"
              : "border-border"
          )}>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  if (onCreateMode) {
                    onCreateMode();
                    setIsOpen(false);
                  }
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-3 py-2 rounded text-sm font-medium",
                  isSpiralStyle
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Mode</span>
              </button>
              
              <button
                onClick={() => {
                  if (onOpenSettings) {
                    onOpenSettings();
                    setIsOpen(false);
                  }
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-3 py-2 rounded text-sm font-medium",
                  isSpiralStyle
                    ? "bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200"
                    : "bg-accent hover:bg-accent/80 text-accent-foreground"
                )}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>AI Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeDropdown; 