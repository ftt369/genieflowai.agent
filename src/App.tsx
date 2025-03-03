import { useEffect } from 'react';
import MainLayout from './components/MainLayout';
import { AuthProvider } from './components/AuthProvider';
import { Login } from './components/Login';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

function ProtectedApp() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme based on system preference or stored value
    const savedTheme = localStorage.getItem('theme-store')
      ? JSON.parse(localStorage.getItem('theme-store') || '{}').state?.theme
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    setTheme(savedTheme);
  }, []);

  // Re-apply theme when it changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  if (!user) {
    return <Login />;
  }

  return <MainLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
}