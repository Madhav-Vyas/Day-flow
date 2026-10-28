import { create } from "zustand";

interface WeeklyPlanUIState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isNewTaskModalOpen: boolean;
  setIsNewTaskModalOpen: (open: boolean) => void;
  targetDayIndex: number;
  setTargetDayIndex: (dayIndex: number) => void;
  isBacklogExpanded: boolean;
  toggleBacklogExpanded: () => void;
}

export const useWeeklyPlanStore = create<WeeklyPlanUIState>((set) => ({
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  isNewTaskModalOpen: false,
  setIsNewTaskModalOpen: (isNewTaskModalOpen) => set({ isNewTaskModalOpen }),
  targetDayIndex: 2,
  setTargetDayIndex: (targetDayIndex) => set({ targetDayIndex }),
  isBacklogExpanded: true,
  toggleBacklogExpanded: () =>
    set((state) => ({ isBacklogExpanded: !state.isBacklogExpanded })),
}));
