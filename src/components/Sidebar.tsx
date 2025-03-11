import { 
  MessageSquare, 
  Brain, 
  Plus, 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Command,
  Bot,
  Sparkles,
  Workflow
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface SidebarProps {
  currentView: 'chat' | 'genieagent' | 'workflow';
  onViewChange: (view: 'chat' | 'genieagent' | 'workflow') => void;
  onNewThread: () => void;
  isCollapsed?: boolean;
  className?: string;
}

export default function Sidebar({ currentView, onViewChange, onNewThread, isCollapsed = false, className = '' }: SidebarProps) {
  return (
    <div className={cn('h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800', className)}>
      {/* Top section with actions */}
      <div className="flex-1 p-4 space-y-4">
        <button
          onClick={onNewThread}
          className={cn(
            'flex items-center gap-2 w-full p-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors',
            isCollapsed && 'justify-center'
          )}
        >
          <Plus className="h-5 w-5" />
          {!isCollapsed && <span>New Thread</span>}
        </button>
        
        <nav className="space-y-2">
          <button
            onClick={() => onViewChange('chat')}
            className={cn(
              'flex items-center gap-2 w-full p-2 rounded-md transition-colors',
              currentView === 'chat' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              isCollapsed && 'justify-center'
            )}
          >
            <MessageSquare className="h-5 w-5" />
            {!isCollapsed && <span>Chat</span>}
          </button>

          <button
            onClick={() => onViewChange('genieagent')}
            className={cn(
              'flex items-center gap-2 w-full p-2 rounded-md transition-colors',
              currentView === 'genieagent' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              isCollapsed && 'justify-center'
            )}
          >
            <Sparkles className="h-5 w-5" />
            {!isCollapsed && <span>GenieAgent</span>}
          </button>

          <button
            onClick={() => onViewChange('workflow')}
            className={cn(
              'flex items-center gap-2 w-full p-2 rounded-md transition-colors',
              currentView === 'workflow' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              isCollapsed && 'justify-center'
            )}
          >
            <Workflow className="h-5 w-5" />
            {!isCollapsed && <span>Workflow</span>}
          </button>
        </nav>
      </div>

      {/* Bottom section with user info */}
      <div className={cn(
        'p-4 border-t border-gray-200 dark:border-gray-800',
        isCollapsed ? 'items-center' : 'space-y-2'
      )}>
        <div className={cn(
          'flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer',
          isCollapsed && 'justify-center'
        )}>
          <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          {!isCollapsed && (
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pro Plan</p>
            </div>
          )}
        </div>

        <div className={cn(
          'flex flex-col space-y-1',
          isCollapsed && 'items-center'
        )}>
          <button className={cn(
            'flex items-center gap-2 w-full p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
            isCollapsed && 'justify-center'
          )}>
            <Command className="h-5 w-5" />
            {!isCollapsed && <span>Commands</span>}
          </button>

          <button className={cn(
            'flex items-center gap-2 w-full p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
            isCollapsed && 'justify-center'
          )}>
            <Settings className="h-5 w-5" />
            {!isCollapsed && <span>Settings</span>}
          </button>
          
          <button className={cn(
            'flex items-center gap-2 w-full p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
            isCollapsed && 'justify-center'
          )}>
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}