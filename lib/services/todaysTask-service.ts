import { axiosInstance } from "./task-service";

export async function getTodaysTask(date: string) {
  const res = await axiosInstance.get(`/api/v1/tasks/today?date=${date}`);
  return res.data;
}
