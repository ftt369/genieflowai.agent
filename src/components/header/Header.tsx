import React from 'react';
import { Link } from 'react-router-dom';
import ModeBadge from './ModeBadge';
import { Moon, Sun, Brain } from 'lucide-react';
import { useThemeStore } from '@/stores/theme/themeStore';
import { useUserPreferencesStore } from '@/stores/ui/userPreferencesStore';

const Header: React.FC = () => {
  const { mode, setMode } = useThemeStore();
  const { showThinking, setShowThinking } = useUserPreferencesStore();
  
  const toggleDarkMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
    // Apply dark mode to document
    if (mode === 'light') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-6 flex items-center justify-between">
      <div className="flex items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">GenieAgent</span>
        </Link>
        
        {/* Navigation */}
        <nav className="ml-10 hidden md:flex space-x-6">
          <Link to="/chat" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Chat</Link>
          <Link to="/knowledge-base" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Knowledge Base</Link>
          <Link to="/documents" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Documents</Link>
          <Link to="/workers-comp/generator" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Workers' Comp</Link>
          <Link to="/thinking-demo" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
            <span>Thinking Mode</span>
            <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-2 py-0.5">New</span>
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* EXTRA LARGE Thinking Mode Toggle Button */}
        <button 
          onClick={() => setShowThinking(!showThinking)}
          className={`relative flex items-center px-5 py-2.5 rounded-md text-sm font-medium transition-colors shadow-md ${
            showThinking 
            ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-300/50' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          style={{
            animation: showThinking ? 'pulse 2s infinite' : 'none',
            transform: 'scale(1.1)'
          }}
        >
          <Brain className="h-5 w-5 mr-2" />
          <span className="font-bold">
            {showThinking ? "THINKING MODE: ON" : "THINKING MODE: OFF"}
          </span>
          {/* Add a pulsing effect when turned on */}
          {showThinking && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
          )}
        </button>
        
        {/* Mode badge */}
        <ModeBadge />
        
        {/* Search */}
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Settings */}
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* User profile */}
        <div className="relative">
          <button className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode} 
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          title={mode === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          {mode === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Add keyframe animation for pulse effect */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(147, 51, 234, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
          }
        }
      `}</style>
    </header>
  );
};

export default Header; 