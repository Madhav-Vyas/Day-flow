import { axiosInstance } from "./task-service";

export interface DailyReportItem {
  id: string;
  code: string;
  title: string;
  category: string;
  status: "DONE" | "IN_PROGRESS" | "TODO";
  spentHours: number;
  notes?: string;
  plannedDate?: string;
}

export interface DayReportGroup {
  date: string;
  dayLabel: string;
  isToday?: boolean;
  tasks: DailyReportItem[];
  totalHours?: number;
}

export interface WeeklyReportDay {
  date: string;
  dayName: string;
  dayNumber: number;
  dayLabel: string;
  totalHours: number;
  tasks: DailyReportItem[];
}

export interface WeeklyReportCategory {
  category: string;
  totalHours: number;
  count: number;
  percentage: number;
}

export interface WeeklyReportData {
  week: string;
  startStr: string;
  endStr: string;
  weekRangeLabel: string;
  totalLoggedHours: number;
  totalEstimatedHours: number;
  targetHours: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  byDay: WeeklyReportDay[];
  byCategory: WeeklyReportCategory[];
  tasks: DailyReportItem[];
}

export async function getDailyReports(): Promise<DayReportGroup[]> {
  const response = await axiosInstance.get("/api/v1/reports/daily");
  return response.data?.data ?? [];
}

export async function getWeeklyReport(week?: string): Promise<WeeklyReportData> {
  const params = week ? `?week=${week}` : "";
  const response = await axiosInstance.get(`/api/v1/reports/weekly${params}`);
  return response.data?.data;
}
