export type TaskStatus = "DONE" | "IN_PROGRESS" | "TODO";
export type TaskPriority = "P1 Urgent" | "P2 Normal" | "P3 Low";
export type TaskTag = "FE" | "BUG" | "TECH" | "MISC";

export interface Task {
  id: string;
  code: string;
  title: string;
  hours: number;
  loggedHours?: number;
  dayIndex: number; // 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, -1 = Backlog
  status: TaskStatus;
  priority?: TaskPriority;
  tag: TaskTag;
  quickAction?: {
    label: string;
    targetDayIndex: number;
  };
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
