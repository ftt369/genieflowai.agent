import React from 'react';
import LeftSidebar from './sidebars/LeftSidebar';
import RightSidebar from './sidebars/RightSidebar';
import HeaderBar from './HeaderBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <HeaderBar className="flex-shrink-0" />
      <div className="flex flex-1 overflow-hidden pt-0">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
};

export default Layout; 