import { axiosInstance } from "./task-service";
import { Task } from "@/app/(app)/weekly-plan/components/types";

export async function getTodaysTask(date: string): Promise<Task[]> {
  try {
    const res = await axiosInstance.get(`/api/v1/tasks/today?date=${date}`);
    const data = res.data?.data ?? res.data?.tasks ?? res.data;
    return Array.isArray(data) ? data : [];
  } catch {
    // Fallback attempt to /api/v1/today if backend has that endpoint
    try {
      const fallbackRes = await axiosInstance.get(`/api/v1/today?date=${date}`);
      const fallbackData =
        fallbackRes.data?.data ?? fallbackRes.data?.tasks ?? fallbackRes.data;
      return Array.isArray(fallbackData) ? fallbackData : [];
    } catch {
      return [];
    }
  }
}
