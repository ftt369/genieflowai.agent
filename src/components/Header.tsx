import React from 'react';
import { Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SettingsComponent from './Settings';

interface HeaderProps {
  onLeftSidebarToggle: () => void;
  onRightSidebarToggle: () => void;
}

export function Header({ onLeftSidebarToggle, onRightSidebarToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Button
          variant="ghost"
          className="mr-4 px-2 hover:bg-transparent"
          onClick={onLeftSidebarToggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle left sidebar</span>
        </Button>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search component can go here */}
          </div>
          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="px-2 hover:bg-transparent"
              onClick={onRightSidebarToggle}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Toggle right sidebar</span>
            </Button>
          </nav>
        </div>
        <SettingsComponent />
      </div>
    </header>
  );
} 