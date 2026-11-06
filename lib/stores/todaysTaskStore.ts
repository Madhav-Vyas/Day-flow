import { create } from "zustand";

export type StatusFilter = "ALL" | "TODO" | "IN_PROGRESS" | "DONE";

interface TodaysTaskStore {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  isNewTaskModalOpen: boolean;
  setIsNewTaskModalOpen: (open: boolean) => void;
  isLogTimeModalOpen: boolean;
  setIsLogTimeModalOpen: (open: boolean) => void;
}

export const useTodaysTaskStore = create<TodaysTaskStore>((set) => ({
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  statusFilter: "ALL",
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  isNewTaskModalOpen: false,
  setIsNewTaskModalOpen: (isNewTaskModalOpen) => set({ isNewTaskModalOpen }),
  isLogTimeModalOpen: false,
  setIsLogTimeModalOpen: (isLogTimeModalOpen) => set({ isLogTimeModalOpen }),
}));

