import { useEffect } from 'react';
import { useThreadStore } from '../store/threadStore';

interface ShortcutHandlers {
  onToggleShortcuts: () => void;
  onToggleResearch: () => void;
  onToggleSettings: () => void;
}

export function useKeyboardShortcuts({
  onToggleShortcuts,
  onToggleResearch,
  onToggleSettings,
}: ShortcutHandlers) {
  const { createThread } = useThreadStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if target is an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        // Only handle Escape for inputs
        if (e.key === 'Escape') {
          (e.target as HTMLInputElement | HTMLTextAreaElement).value = '';
        }
        return;
      }

      // Command/Control + Key shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            // TODO: Implement search
            break;
          case 'n':
            e.preventDefault();
            createThread();
            break;
          case '/':
            e.preventDefault();
            onToggleShortcuts();
            break;
          case '[':
            e.preventDefault();
            onToggleResearch();
            break;
          case ',':
            e.preventDefault();
            onToggleSettings();
            break;
        }
      }

      // Single key shortcuts (when not in input/textarea)
      if (e.key === 'Escape') {
        // Close any open dialogs
        onToggleShortcuts();
        onToggleSettings();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createThread, onToggleShortcuts, onToggleResearch, onToggleSettings]);
} 