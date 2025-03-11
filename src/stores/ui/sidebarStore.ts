import { create } from 'zustand';

interface SidebarState {
  width: number;
  isCollapsed: boolean;
  setWidth: (width: number) => void;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  width: 500, // Default width
  isCollapsed: false,
  setWidth: (width) => set({ width }),
  setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
})); 