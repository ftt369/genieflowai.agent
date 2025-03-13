import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  width: number;
  isCollapsed: boolean;
  isOpen: boolean;
  setWidth: (width: number) => void;
  setIsCollapsed: (isCollapsed: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      width: 500, // Default width
      isCollapsed: false,
      isOpen: false,
      setWidth: (width) => set({ width }),
      setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
      setIsOpen: (isOpen) => set({ isOpen })
    }),
    {
      name: 'sidebar-store',
      partialize: (state) => ({
        width: state.width,
        isCollapsed: state.isCollapsed,
        isOpen: state.isOpen
      })
    }
  )
); 