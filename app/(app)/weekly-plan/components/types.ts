export type TaskStatus = "DONE" | "IN_PROGRESS" | "TODO";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskCategory =
  | "Feature"
  | "Bug"
  | "Enhancement"
  | "Meetings"
  | "Documentation"
  | "Refactoring";
export type TaskTag = "FE" | "BUG" | "TECH" | "MISC";

export interface Task {
  id?: string;
  _id?: string;
  category?: TaskCategory | string;
  code?: string | null;
  title: string;
  description?: string;
  priority: TaskPriority | string;
  estimatedHours: number;
  actualHours?: number;
  dayIndex: number; // 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, -1 = Backlog
  status: TaskStatus;
  // Compatibility helpers
  plannedDate?: string | null;
  hours?: number;
  loggedHours?: number;
  tag?: string;
  createdAt?: string;
  updatedAt?: string;
  quickAction?: {
    label: string;
    targetDayIndex: number;
  };
}

export interface CreateTaskInput {
  category: TaskCategory;
  title: string;
  code?: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dayIndex: number;
  plannedDate?: string | null;
  estimatedHours: number;
  actualHours?: number;
}

export interface DayInfo {
  index: number;
  dayName: string;
  dayNumber: number;
  fullDate: Date;
  formatted: string;
}

export interface DayStats {
  totalHours: number;
  isOver: boolean;
  isUnder: boolean;
  diff: number;
  isDone: boolean;
  statusLabel: string;
}
