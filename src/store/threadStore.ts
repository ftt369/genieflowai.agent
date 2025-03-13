import create from 'zustand';
import { persist } from 'zustand/middleware';

// Add UUID generation function for browser compatibility
function generateUUID() {
  // Simple UUID generation that doesn't rely on crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    confidence?: number;
  };
}

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ThreadState {
  threads: Thread[];
  activeThreadId: string | null;
  createThread: () => string;
  setActiveThread: (threadId: string) => void;
  addMessage: (threadId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateThreadTitle: (threadId: string, title: string) => void;
  deleteThread: (threadId: string) => void;
}

export const useThreadStore = create<ThreadState>()(
  persist(
    (set, get) => ({
      threads: [],
      activeThreadId: null,

      createThread: () => {
        const newThread: Thread = {
          id: generateUUID(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          threads: [newThread, ...state.threads],
          activeThreadId: newThread.id,
        }));

        return newThread.id;
      },

      setActiveThread: (threadId) => {
        set({ activeThreadId: threadId });
      },

      addMessage: (threadId, message) => {
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: [
                    ...thread.messages,
                    {
                      id: generateUUID(),
                      ...message,
                      timestamp: new Date(),
                    },
                  ],
                  updatedAt: new Date(),
                  title:
                    thread.messages.length === 0 && message.role === 'user'
                      ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                      : thread.title,
                }
              : thread
          ),
        }));
      },

      updateThreadTitle: (threadId, title) => {
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  title,
                  updatedAt: new Date(),
                }
              : thread
          ),
        }));
      },

      deleteThread: (threadId) => {
        set((state) => {
          const newThreads = state.threads.filter((thread) => thread.id !== threadId);
          return {
            threads: newThreads,
            activeThreadId:
              state.activeThreadId === threadId
                ? newThreads.length > 0
                  ? newThreads[0].id
                  : null
                : state.activeThreadId,
          };
        });
      },
    }),
    {
      name: 'thread-store',
    }
  )
); 