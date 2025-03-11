import React from 'react';
import { Button } from '../ui/button';
import { PlusCircle, MessageSquare, Settings, Trash } from 'lucide-react';
import { useThemeStore } from '@/stores/theme/themeStore';

const LeftSidebar: React.FC = () => {
  const { currentTheme } = useThemeStore();

  return (
    <div className="w-64 h-full border-r border-border bg-card">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <Button variant="outline" className="w-full justify-start gap-2">
            <PlusCircle size={20} />
            New Chat
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Chat history items will be mapped here */}
          <Button variant="ghost" className="w-full justify-start gap-2 text-left">
            <MessageSquare size={16} />
            <span className="truncate">Previous Chat 1</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-left">
            <MessageSquare size={16} />
            <span className="truncate">Previous Chat 2</span>
          </Button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings size={20} />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-destructive">
            <Trash size={20} />
            Clear History
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar; 