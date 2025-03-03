import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const [isChanging, setIsChanging] = useState(false);

  // Handle theme change animation
  const handleThemeChange = () => {
    setIsChanging(true);
    toggleTheme();
    // Remove the animation class after the transition
    setTimeout(() => setIsChanging(false), 300);
  };

  // Add/remove theme-changing class on body
  useEffect(() => {
    if (isChanging) {
      document.body.classList.add('theme-changing');
    } else {
      document.body.classList.remove('theme-changing');
    }
  }, [isChanging]);

  return (
    <>
      <button
        onClick={handleThemeChange}
        className="relative rounded-lg p-2 hover:bg-accent transition-all duration-300 
                 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary 
                 focus:ring-offset-2 focus:ring-offset-background"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Show Sun icon when in dark mode */}
        <div className="relative w-5 h-5">
          <Sun 
            className={`absolute inset-0 text-foreground transition-all duration-300
                       ${theme === 'dark' 
                         ? 'rotate-0 scale-100 opacity-100' 
                         : 'rotate-90 scale-0 opacity-0'}`}
          />
          <Moon 
            className={`absolute inset-0 text-foreground transition-all duration-300
                       ${theme === 'light' 
                         ? 'rotate-0 scale-100 opacity-100' 
                         : '-rotate-90 scale-0 opacity-0'}`}
          />
        </div>
        <span className="sr-only">
          {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        </span>
      </button>
      
      {/* Theme transition overlay */}
      <div className="theme-transition-overlay" />
    </>
  );
}