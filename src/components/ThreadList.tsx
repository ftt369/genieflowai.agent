import React, { useState } from 'react';
import { useThreadStore } from '../store/threadStore';
import { Edit2, Trash2, MessageSquare } from 'lucide-react';

export default function ThreadList() {
  const { threads, activeThreadId, setActiveThread, updateThread, deleteThread } = useThreadStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  const handleEdit = (threadId: string, currentTitle: string) => {
    setEditingId(threadId);
    setEditTitle(currentTitle);
  };
  
  const handleSave = (threadId: string) => {
    if (editTitle.trim()) {
      updateThread(threadId, { title: editTitle.trim() });
    }
    setEditingId(null);
    setEditTitle('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent, threadId: string) => {
    if (e.key === 'Enter') {
      handleSave(threadId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditTitle('');
    }
  };
  
  return (
    <div className="flex-1 overflow-y-auto py-2">
      {threads.map((thread) => (
        <div
          key={thread.id}
          className={`group px-2 py-1 mx-2 rounded-lg cursor-pointer ${
            thread.id === activeThreadId
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'hover:bg-gray-100 dark:hover:bg-[#2C2C2C]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 flex-1"
              onClick={() => thread.id !== activeThreadId && setActiveThread(thread.id)}
            >
              <MessageSquare
                size={16}
                className={`${
                  thread.id === activeThreadId
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              />
              
              {editingId === thread.id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, thread.id)}
                  onBlur={() => handleSave(thread.id)}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                  autoFocus
                />
              ) : (
                <span
                  className={`text-sm truncate ${
                    thread.id === activeThreadId
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {thread.title}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(thread.id, thread.title)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#3C3C3C] text-gray-500 dark:text-gray-400"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => deleteThread(thread.id)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#3C3C3C] text-gray-500 dark:text-gray-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 