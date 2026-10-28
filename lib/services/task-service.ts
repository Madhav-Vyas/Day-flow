import axios from "axios";
import {
  CreateTaskInput,
  Task,
} from "@/app/(app)/weekly-plan/components/types";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export async function createTask(taskData: CreateTaskInput) {
  console.log("createTask payload:", taskData);
  const response = await axiosInstance.post("/api/v1/tasks", taskData);
  return response.data?.data ?? response.data;
}

export async function getWeekTasks(week: string): Promise<Task[]> {
  const response = await axiosInstance.get(
    `/api/v1/tasks/weekly/${week}`,
  );
  const data = response.data?.data ?? response.data?.tasks ?? response.data;
  return Array.isArray(data) ? data : [];
}
