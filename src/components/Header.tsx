import React, { useState } from 'react';
import { 
  Menu, 
  PanelRight, 
  Maximize2, 
  Palette,
  Bot,
  Layers,
  X,
  MessageSquare,
  Search,
  Brain,
  Workflow,
  Database,
  FileText,
  Code,
  BookOpen,
  Scale,
  Stethoscope,
  Briefcase,
  Calculator,
  Settings,
  Minimize,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useModeStore } from '../stores/modeStore';
import ThemeToggle from './ThemeToggle';
import MaterialToggle from './MaterialToggle';
import { useFullscreen } from '../hooks/useFullscreen';

interface HeaderProps {
  onLeftSidebarToggle: () => void;
  onRightSidebarToggle: () => void;
}

export default function Header({ onLeftSidebarToggle, onRightSidebarToggle }: HeaderProps) {
  const [showModesModal, setShowModesModal] = useState(false);
  const { activeMode, setActiveMode } = useModeStore();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const presetModes = [
    { id: 'chat', name: 'Chat Assistant', icon: <MessageSquare />, description: 'General purpose chat assistant' },
    { id: 'research', name: 'Research', icon: <Search />, description: 'Deep research and analysis' },
    { id: 'code', name: 'Code Assistant', icon: <Code />, description: 'Programming and development' },
    { id: 'legal', name: 'Legal Assistant', icon: <Scale />, description: 'Legal analysis and documentation' },
    { id: 'medical', name: 'Medical Assistant', icon: <Stethoscope />, description: 'Medical information and analysis' },
    { id: 'business', name: 'Business Assistant', icon: <Briefcase />, description: 'Business strategy and analysis' },
    { id: 'math', name: 'Math Assistant', icon: <Calculator />, description: 'Mathematical calculations and problems' },
    { id: 'study', name: 'Study Assistant', icon: <BookOpen />, description: 'Learning and education' },
    { id: 'workflow', name: 'Workflow', icon: <Workflow />, description: 'Process automation' },
    { id: 'database', name: 'Database', icon: <Database />, description: 'Data management and queries' },
    { id: 'document', name: 'Document', icon: <FileText />, description: 'Document processing and analysis' },
    { id: 'ai', name: 'AI Assistant', icon: <Brain />, description: 'Advanced AI operations' },
  ];

  return (
    <>
      <header className={cn(
        "border-b border-[var(--border)]",
        "bg-[var(--background)]",
        "sticky top-0 z-40",
        "material-effect"
      )}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onLeftSidebarToggle}
              className="p-2 rounded-md hover:bg-[var(--muted)] touch-manipulation md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold hidden md:block">GenieAgent</h1>
          </div>

          {/* Center section - Mode Button */}
          <button
            onClick={() => setShowModesModal(true)}
            className={cn(
              "px-4 py-2 rounded-md flex items-center gap-2",
              "bg-[var(--primary)] text-white"
            )}
          >
            <Layers className="h-5 w-5" />
            <span>Modes</span>
          </button>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MaterialToggle />
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-[var(--muted)] hidden md:flex"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onRightSidebarToggle}
              className="p-2 rounded-lg hover:bg-[var(--muted)] touch-manipulation"
              aria-label="Toggle settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Modes Modal */}
      {showModesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[var(--background)] rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-xl font-semibold">Select Mode</h2>
              <button
                onClick={() => setShowModesModal(false)}
                className="p-2 rounded-md hover:bg-[var(--muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-auto">
              <div className="grid grid-cols-3 gap-4">
                {presetModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setActiveMode(mode.id);
                      setShowModesModal(false);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-3 p-6 rounded-lg transition-colors",
                      "border-2 hover:border-[var(--primary)]",
                      activeMode === mode.id 
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--border)] hover:bg-[var(--muted)]"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-full",
                      activeMode === mode.id
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--muted)]"
                    )}>
                      {React.cloneElement(mode.icon, { className: "h-6 w-6" })}
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{mode.name}</div>
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {mode.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 