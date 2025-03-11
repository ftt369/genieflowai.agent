import React, { useState } from 'react';
import { 
  ChevronLeft,
  Plus,
  Bot,
  MessageSquare,
  Folder,
  Save,
  History,
  Star,
  Settings
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useOverlayStore } from '../stores/theme/overlayStore';

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen, onClose }) => {
  const [width, setWidth] = useState(280);
  const [activeTab, setActiveTab] = useState<'chats' | 'agents'>('chats');
  const { material } = useOverlayStore();

  if (!isOpen) return null;

  return (
    <aside className={`
      fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out
      material-base material-${material.type} material-interactive
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">GenieAgent</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--muted)] rounded-md">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 p-4">
          <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-[var(--primary)] text-white rounded-md hover:opacity-90">
            <Plus className="h-4 w-4" />
            New Chat
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-[var(--muted)] rounded-md hover:bg-[var(--mutedForeground)]">
            <Bot className="h-4 w-4" />
            New Agent
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 p-3 text-sm font-medium ${
              activeTab === 'chats' ? 'border-b-2 border-[var(--primary)]' : ''
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`flex-1 p-3 text-sm font-medium ${
              activeTab === 'agents' ? 'border-b-2 border-[var(--primary)]' : ''
            }`}
          >
            Agents
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' ? (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[var(--mutedForeground)]">Recent</h3>
                {/* Add recent chats list here */}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[var(--mutedForeground)]">Saved</h3>
                {/* Add saved chats list here */}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[var(--mutedForeground)]">Preset Agents</h3>
                {/* Add preset agents list here */}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[var(--mutedForeground)]">Custom Agents</h3>
                {/* Add custom agents list here */}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar; 