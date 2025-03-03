import { useState, useEffect, useCallback } from 'react';

interface TransitionOptions {
  duration?: number;
  delay?: number;
  onComplete?: () => void;
  timingFunction?: string;
}

interface TransitionState {
  isVisible: boolean;
  isAnimating: boolean;
  animationClass: string;
}

export function useTransition(initialState = false, options: TransitionOptions = {}) {
  const {
    duration = 300,
    delay = 0,
    onComplete,
    timingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)',
  } = options;

  const [state, setState] = useState<TransitionState>({
    isVisible: initialState,
    isAnimating: false,
    animationClass: initialState ? 'enter-done' : 'exit-done',
  });

  const startTransition = useCallback((isEntering: boolean) => {
    if (isEntering) {
      setState({
        isVisible: true,
        isAnimating: true,
        animationClass: 'enter-start',
      });

      // Force reflow
      document.body.offsetHeight;

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          animationClass: 'enter-active',
        }));
      }, 10);

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isAnimating: false,
          animationClass: 'enter-done',
        }));
        onComplete?.();
      }, duration + delay);
    } else {
      setState(prev => ({
        ...prev,
        isAnimating: true,
        animationClass: 'exit-start',
      }));

      // Force reflow
      document.body.offsetHeight;

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          animationClass: 'exit-active',
        }));
      }, 10);

      setTimeout(() => {
        setState({
          isVisible: false,
          isAnimating: false,
          animationClass: 'exit-done',
        });
        onComplete?.();
      }, duration + delay);
    }
  }, [duration, delay, onComplete]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .enter-start { opacity: 0; transform: scale(0.95); }
      .enter-active { 
        opacity: 1; 
        transform: scale(1);
        transition: opacity ${duration}ms ${timingFunction} ${delay}ms,
                    transform ${duration}ms ${timingFunction} ${delay}ms;
      }
      .enter-done { opacity: 1; transform: scale(1); }
      .exit-start { opacity: 1; transform: scale(1); }
      .exit-active { 
        opacity: 0; 
        transform: scale(0.95);
        transition: opacity ${duration}ms ${timingFunction} ${delay}ms,
                    transform ${duration}ms ${timingFunction} ${delay}ms;
      }
      .exit-done { opacity: 0; transform: scale(0.95); }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [duration, delay, timingFunction]);

  const show = useCallback(() => {
    startTransition(true);
  }, [startTransition]);

  const hide = useCallback(() => {
    startTransition(false);
  }, [startTransition]);

  const toggle = useCallback(() => {
    startTransition(!state.isVisible);
  }, [state.isVisible, startTransition]);

  return {
    isVisible: state.isVisible,
    isAnimating: state.isAnimating,
    animationClass: state.animationClass,
    show,
    hide,
    toggle,
  };
} 