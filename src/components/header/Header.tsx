import React from 'react';
import { Link } from 'react-router-dom';
import ModeBadge from './ModeBadge';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
      <div className="flex items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-blue-600">GenieAgent</span>
        </Link>
        
        {/* Navigation */}
        <nav className="ml-10 hidden md:flex space-x-6">
          <Link to="/chat" className="text-gray-700 hover:text-blue-600">Chat</Link>
          <Link to="/knowledge-base" className="text-gray-700 hover:text-blue-600">Knowledge Base</Link>
          <Link to="/documents" className="text-gray-700 hover:text-blue-600">Documents</Link>
          <Link to="/workers-comp/generator" className="text-gray-700 hover:text-blue-600">Workers' Comp</Link>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
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
      </div>
    </header>
  );
};

export default Header; 