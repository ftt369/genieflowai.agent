import { useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import { useThemeStore } from './stores/theme/themeStore';
import { useNotification } from './components/ui/Notification';
import { Button } from './components/ui/button';
import AppInit from './components/AppInit';
import { ToastProvider } from './components/ui/toast';

function App() {
  const { mode, profile, setMode, setProfile } = useThemeStore();
  const { show, NotificationsContainer } = useNotification();

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.toggle('dark', mode === 'dark');
    document.documentElement.setAttribute('data-theme', profile);
    document.documentElement.style.colorScheme = mode === 'dark' ? 'dark' : 'light';
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

  return (
    <ToastProvider>
      <AppInit />
      <MainLayout />
      <NotificationsContainer />
    </ToastProvider>
  );
}

export default App;