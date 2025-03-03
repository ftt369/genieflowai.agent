import { useState } from 'react';
import { Plus, Save, Mic, Paperclip, X } from 'lucide-react';
import { useThreadStore } from '../store/threadStore';

export default function ThreadSidebar() {
  const { threads, activeThreadId, addThread, removeThread, setActiveThreadId } = useThreadStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const quickActions = [
    { type: 'document-review', label: 'Document Review' },
    { type: 'research', label: 'Research' },
    { type: 'verification', label: 'Verify' },
    { type: 'writing', label: 'Write' },
  ] as const;

  return (
    <div className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className={`font-semibold ${isCollapsed ? 'hidden' : 'block'}`}>
          Agent Threads
        </h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <div className="p-2">
        {!isCollapsed && (
          <div className="space-y-2 mb-4">
            {quickActions.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => addThread(type)}
                className="flex items-center w-full p-2 text-sm hover:bg-gray-100 rounded-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={`flex items-center justify-between p-2 text-sm rounded-md cursor-pointer ${
                thread.id === activeThreadId ? 'bg-blue-50' : 'bg-gray-50'
              }`}
              onClick={() => setActiveThreadId(thread.id)}
            >
              {!isCollapsed ? (
                <>
                  <span>{thread.title}</span>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-200 rounded-md">
                      <Mic className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded-md">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded-md">
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeThread(thread.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-8 h-8 flex items-center justify-center">
                  {thread.type.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 