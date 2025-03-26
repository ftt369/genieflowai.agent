import { useEffect } from 'react';
import { useThemeStore } from './stores/theme/themeStore';
import { useNotification } from './components/ui/Notification';
import { Button } from './components/ui/button';
import AppInit from './components/AppInit';
import { ToastProvider } from './components/ui/toast';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './router/AppRouter';

function App() {
  const { mode, profile, setMode, setProfile } = useThemeStore();
  const { show, NotificationsContainer } = useNotification();

  // Check for system dark mode preference on initial load
  useEffect(() => {
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemMode = prefersDark ? 'dark' : 'light';
      
      // Apply the system preference to the document
      document.documentElement.classList.toggle('dark', systemMode === 'dark');
      document.documentElement.style.colorScheme = systemMode === 'dark' ? 'dark' : 'light';
      
      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
        document.documentElement.style.colorScheme = e.matches ? 'dark' : 'light';
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Apply theme on mount and when it changes
  useEffect(() => {
    if (mode !== 'system') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.toggle('dark', mode === 'dark');
      document.documentElement.style.colorScheme = mode === 'dark' ? 'dark' : 'light';
    }
    
    // Always apply the profile attribute regardless of mode
    document.documentElement.setAttribute('data-theme', profile);
    
    // Apply dark mode classes to body for broader compatibility
    if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [mode, profile]);

  // Display a welcome notification when changing theme
  useEffect(() => {
    if (profile === 'spiral') {
      show({
        type: 'info',
        title: 'Spiral Theme Activated',
        message: 'You are now using the Spiral inspired theme with gold and blue colors.',
        duration: 5000,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 border-[#e6b44c] text-[#e6b44c] hover:bg-[#e6b44c]/10"
            onClick={() => typeof setProfile === 'function' && setProfile('default')}
          >
            Switch back to default
          </Button>
        )
      });
    }
  }, [profile]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(
        '%cReact DevTools Available',
        'color: #61dafb; font-size: 14px; font-weight: bold;',
        '\nDownload the React DevTools for a better development experience:',
        'https://reactjs.org/link/react-devtools'
      );
    }
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <AppInit />
        <AppRouter />
        <NotificationsContainer />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;