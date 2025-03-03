import { MessageSquare, Brain, Plus, User, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SidebarProps {
  currentView: 'chat' | 'genieagent';
  onViewChange: (view: 'chat' | 'genieagent') => void;
  onNewThread: () => void;
  isCollapsed?: boolean;
  className?: string;
}

export default function Sidebar({ currentView, onViewChange, onNewThread, isCollapsed = false, className = '' }: SidebarProps) {
  return (
    <div className={cn('h-full flex flex-col p-2', className)}>
      {/* Top section with actions */}
      <div className="flex-1">
        <button
          onClick={onNewThread}
          className={cn(
            'flex items-center space-x-2 w-full p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
            isCollapsed && 'justify-center'
          )}
        >
          <Plus className="h-5 w-5" />
          {!isCollapsed && <span>New Thread</span>}
        </button>
        
        <nav className="mt-4 space-y-2">
          <button
            onClick={() => onViewChange('chat')}
            className={cn(
              'flex items-center space-x-2 w-full p-2 rounded-md transition-colors',
              currentView === 'chat' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
              isCollapsed && 'justify-center'
            )}
          >
            <MessageSquare className="h-5 w-5" />
            {!isCollapsed && <span>Chat</span>}
      </button>

              <button
            onClick={() => onViewChange('genieagent')}
            className={cn(
              'flex items-center space-x-2 w-full p-2 rounded-md transition-colors',
              currentView === 'genieagent' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
              isCollapsed && 'justify-center'
            )}
          >
            <Brain className="h-5 w-5" />
            {!isCollapsed && <span>GenieAgent</span>}
              </button>
      </nav>
        </div>

      {/* Bottom section with user info */}
      <div className={cn(
        'mt-auto pt-4 border-t border-border',
        isCollapsed ? 'items-center' : 'space-y-2'
      )}>
        <div className={cn(
          'flex items-center p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer',
          isCollapsed && 'justify-center'
        )}>
          <User className="h-5 w-5" />
          {!isCollapsed && (
            <div className="ml-2">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">Pro Plan</p>
            </div>
          )}
          </div>

        <div className={cn(
          'flex flex-col',
          isCollapsed && 'items-center'
        )}>
          <button className={cn(
            'flex items-center space-x-2 w-full p-2 rounded-md hover:bg-accent/50 transition-colors',
            isCollapsed && 'justify-center'
          )}>
            <Settings className="h-5 w-5" />
            {!isCollapsed && <span>Settings</span>}
          </button>
          
          <button className={cn(
            'flex items-center space-x-2 w-full p-2 rounded-md hover:bg-accent/50 transition-colors text-destructive',
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