import { create } from 'zustand';
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSettings {
  chat: {
    style: 'balanced' | 'creative' | 'precise' | 'professional';
    responseLength: 'concise' | 'balanced' | 'detailed';
    webSearch: boolean;
    codeExecution: boolean;
    toolUse: boolean;
  };
  memory: {
    contextWindow: number;
    longTermMemory: boolean;
    autoRetrieve: boolean;
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  agentId?: string;
  settings: ChatSettings;
}

interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  savedChats: string[];
  pinnedChats: string[];
  showClearConfirm: boolean;
  createChat: () => string;
  addMessage: (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  removeMessage: (chatId: string, messageId: string) => void;
  saveChat: (chatId: string) => void;
  unsaveChat: (chatId: string) => void;
  pinChat: (chatId: string) => void;
  unpinChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  clearAllChats: () => void;
  setActiveChat: (chatId: string | null) => void;
  getChat: (chatId: string) => Chat | undefined;
  updateChatTitle: (chatId: string, title: string) => void;
  updateChatSettings: (chatId: string, settings: Partial<ChatSettings>) => void;
  setShowClearConfirm: (show: boolean) => void;
  handleClearChat: () => void;
}

const defaultSettings: ChatSettings = {
  chat: {
    style: 'balanced',
    responseLength: 'balanced',
    webSearch: false,
    codeExecution: true,
    toolUse: true
  },
  memory: {
    contextWindow: 4000,
    longTermMemory: false,
    autoRetrieve: false
  }
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChat: null,
      savedChats: [],
      pinnedChats: [],
      showClearConfirm: false,

      createChat: () => {
        const newChat: Chat = {
          id: generateUUID(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          settings: defaultSettings
        };

        set(state => ({
          chats: [newChat, ...state.chats],
          activeChat: newChat.id
        }));

        return newChat.id;
      },

      addMessage: (chatId, message) => {
        set(state => ({
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              const newMessage: ChatMessage = {
                id: generateUUID(),
                ...message,
                timestamp: new Date()
              };

              // Update chat title if it's the first user message
              return {
                ...chat,
                messages: [...chat.messages, newMessage],
                updatedAt: new Date(),
                title: chat.title === 'New Chat' && message.role === 'user' && chat.messages.length === 0
                  ? message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '')
                  : chat.title
              };
            }
            return chat;
          })
        }));
      },

      removeMessage: (chatId, messageId) => {
        set(state => ({
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.filter(msg => msg.id !== messageId),
                updatedAt: new Date()
              };
            }
            return chat;
          })
        }));
      },

      saveChat: (chatId) => {
        set(state => ({
          savedChats: [...state.savedChats, chatId]
        }));
      },

      unsaveChat: (chatId) => {
        set(state => ({
          savedChats: state.savedChats.filter(id => id !== chatId)
        }));
      },

      pinChat: (chatId) => {
        set(state => ({
          pinnedChats: [...state.pinnedChats, chatId]
        }));
      },

      unpinChat: (chatId) => {
        set(state => ({
          pinnedChats: state.pinnedChats.filter(id => id !== chatId)
        }));
      },

      deleteChat: (chatId) => {
        set(state => {
          // Remove from all lists
          const newSavedChats = state.savedChats.filter(id => id !== chatId);
          const newPinnedChats = state.pinnedChats.filter(id => id !== chatId);
          
          // If deleting active chat, set active to the most recent chat
          let newActiveChat = state.activeChat;
          if (state.activeChat === chatId) {
            const remainingChats = state.chats.filter(chat => chat.id !== chatId);
            newActiveChat = remainingChats.length > 0 ? remainingChats[0].id : null;
          }

          return {
            chats: state.chats.filter(chat => chat.id !== chatId),
            activeChat: newActiveChat,
            savedChats: newSavedChats,
            pinnedChats: newPinnedChats
          };
        });
      },

      clearAllChats: () => {
        set({
          chats: [],
          activeChat: null,
          savedChats: [],
          pinnedChats: []
        });
      },

      setActiveChat: (chatId) => {
        set({ activeChat: chatId });
      },

      getChat: (chatId) => {
        return get().chats.find(chat => chat.id === chatId);
      },

      updateChatTitle: (chatId, title) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? { ...chat, title, updatedAt: new Date() }
              : chat
          )
        }));
      },

      updateChatSettings: (chatId, settings) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  settings: {
                    chat: { ...chat.settings.chat, ...settings.chat },
                    memory: { ...chat.settings.memory, ...settings.memory }
                  },
                  updatedAt: new Date()
                }
              : chat
          )
        }));
      },

      setShowClearConfirm: (show) => {
        set({ showClearConfirm: show });
      },

      handleClearChat: () => {
        const { clearAllChats, createChat, setShowClearConfirm } = get();
        clearAllChats();
        createChat();
        setShowClearConfirm(false);
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        chats: state.chats,
        savedChats: state.savedChats,
        pinnedChats: state.pinnedChats
      })
    }
  )
); 