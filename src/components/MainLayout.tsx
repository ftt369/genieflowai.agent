import React from 'react';
import { useModelStore } from '../stores/modelStore';
import ModelSelector from './ModelSelector';
import ChatScreen from './ChatScreen';

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2">
            <span>+ New Thread</span>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <button className="w-full text-left p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
            <span>💬</span>
            <span>Chat</span>
          </button>
          <button className="w-full text-left p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
            <span>🤖</span>
            <span>GenieAgent</span>
          </button>
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2 p-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              👤
            </div>
            <div>
              <div className="font-medium">John Doe</div>
              <div className="text-sm text-white/50">Pro Plan</div>
            </div>
          </div>
          <button className="w-full text-left p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
            <span>⚙️</span>
            <span>Settings</span>
          </button>
          <button className="w-full text-left p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">GenieAgent</span>
          </div>
          <div className="flex items-center gap-4">
            <ModelSelector />
            <button className="p-2 rounded-lg hover:bg-white/5">🌙</button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ChatScreen />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Research & Agents</h2>
          <button className="p-1 rounded hover:bg-white/5">
            <span>+</span>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <button className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium">
              List
            </button>
            <button className="px-4 py-1.5 rounded-lg hover:bg-white/5 text-sm font-medium">
              Network
            </button>
            <button className="px-4 py-1.5 rounded-lg hover:bg-white/5 text-sm font-medium">
              Metrics
            </button>
            <button className="px-4 py-1.5 rounded-lg hover:bg-white/5 text-sm font-medium">
              Settings
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search agents..."
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
          </div>

          <div className="space-y-3">
            {/* Research Agent Card */}
            <div className="p-3 rounded-lg border border-white/10 hover:bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    🔍
                  </span>
                  <div>
                    <h3 className="font-medium">Research Agent</h3>
                    <p className="text-sm text-white/50">Analyze research papers</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-white/10">
                  <span>⚡</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-sm text-white/50">
                <span>1 linked</span>
                <div className="flex items-center gap-2">
                  <button className="p-1 rounded hover:bg-white/10">🔗</button>
                  <button className="p-1 rounded hover:bg-white/10">⚙️</button>
                  <button className="p-1 rounded hover:bg-white/10">🗑️</button>
                </div>
              </div>
            </div>

            {/* Code Agent Card */}
            <div className="p-3 rounded-lg border border-white/10 hover:bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                    💻
                  </span>
                  <div>
                    <h3 className="font-medium">Code Agent</h3>
                    <p className="text-sm text-white/50">Write and review code</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-white/10">
                  <span>⚡</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-sm text-white/50">
                <span>2 linked</span>
                <div className="flex items-center gap-2">
                  <button className="p-1 rounded hover:bg-white/10">🔗</button>
                  <button className="p-1 rounded hover:bg-white/10">⚙️</button>
                  <button className="p-1 rounded hover:bg-white/10">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 