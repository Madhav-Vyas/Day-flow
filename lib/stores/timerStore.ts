import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  TimeSession,
  calculateTotalTaskSeconds,
  secondsToDecimalHours,
} from "../timerUtils";
import { Task } from "@/app/(app)/weekly-plan/components/types";

export type TimerStatus = "IDLE" | "RUNNING" | "PAUSED";

export interface ConflictInfo {
  activeTaskId: string;
  activeTaskTitle: string;
  activeTaskCode: string;
}

export interface TimerStoreState {
  activeTaskId: string | null;
  activeTaskCode: string | null;
  activeTaskTitle: string | null;
  timerStatus: TimerStatus;
  activeSessionStartTime: number | null; // ms timestamp
  taskSessions: Record<string, TimeSession[]>; // taskId -> sessions[]
  conflictInfo: ConflictInfo | null;

  // Actions
  startTimer: (task: Task) => boolean;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (onSaveCallback?: (taskId: string, totalHours: number) => void) => void;
  handleTaskCompleted: (
    taskId: string,
    onSaveCallback?: (taskId: string, totalHours: number) => void
  ) => void;
  clearConflict: () => void;
  getTaskTotalSeconds: (taskId: string) => number;
}

export const useTimerStore = create<TimerStoreState>()(
  persist(
    (set, get) => ({
      activeTaskId: null,
      activeTaskCode: null,
      activeTaskTitle: null,
      timerStatus: "IDLE",
      activeSessionStartTime: null,
      taskSessions: {},
      conflictInfo: null,

      clearConflict: () => set({ conflictInfo: null }),

      getTaskTotalSeconds: (taskId: string) => {
        const { activeTaskId, activeSessionStartTime, timerStatus, taskSessions } = get();
        const sessions = taskSessions[taskId] || [];
        const isCurrentRunning = activeTaskId === taskId && timerStatus === "RUNNING";
        return calculateTotalTaskSeconds(sessions, activeSessionStartTime, isCurrentRunning);
      },

      startTimer: (task: Task) => {
        const taskId = task.id || task._id;
        if (!taskId) return false;

        // Disallow tracking on completed tasks
        if (task.status === "DONE") {
          return false;
        }

        const { activeTaskId, timerStatus, activeTaskTitle, activeTaskCode } = get();

        // Single active timer rule: check if another task is currently running
        if (activeTaskId && activeTaskId !== taskId && timerStatus === "RUNNING") {
          set({
            conflictInfo: {
              activeTaskId,
              activeTaskTitle: activeTaskTitle || "Active Task",
              activeTaskCode: activeTaskCode || "TASK",
            },
          });
          return false;
        }

        const now = Date.now();

        // If resuming the currently paused task
        if (activeTaskId === taskId && timerStatus === "PAUSED") {
          set({
            timerStatus: "RUNNING",
            activeSessionStartTime: now,
            conflictInfo: null,
          });
          return true;
        }

        // Starting a new session for this task
        set({
          activeTaskId: taskId,
          activeTaskCode: task.code || "TASK",
          activeTaskTitle: task.title,
          timerStatus: "RUNNING",
          activeSessionStartTime: now,
          conflictInfo: null,
        });

        return true;
      },

      pauseTimer: () => {
        const { activeTaskId, activeSessionStartTime, timerStatus, taskSessions } = get();
        if (!activeTaskId || timerStatus !== "RUNNING" || !activeSessionStartTime) return;

        const now = Date.now();
        const sessionDuration = Math.max(0, Math.floor((now - activeSessionStartTime) / 1000));

        const newSession: TimeSession = {
          id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          startTime: activeSessionStartTime,
          endTime: now,
          durationSeconds: sessionDuration,
        };

        const existingSessions = taskSessions[activeTaskId] || [];

        set({
          timerStatus: "PAUSED",
          activeSessionStartTime: null,
          taskSessions: {
            ...taskSessions,
            [activeTaskId]: [...existingSessions, newSession],
          },
        });
      },

      resumeTimer: () => {
        const { activeTaskId, timerStatus } = get();
        if (!activeTaskId || timerStatus !== "PAUSED") return;

        set({
          timerStatus: "RUNNING",
          activeSessionStartTime: Date.now(),
        });
      },

      stopTimer: (onSaveCallback) => {
        const { activeTaskId, activeSessionStartTime, timerStatus, taskSessions } = get();
        if (!activeTaskId) return;

        let updatedSessions = taskSessions[activeTaskId] || [];

        // If currently running, finalize the active segment
        if (timerStatus === "RUNNING" && activeSessionStartTime) {
          const now = Date.now();
          const duration = Math.max(0, Math.floor((now - activeSessionStartTime) / 1000));
          const finalSession: TimeSession = {
            id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            startTime: activeSessionStartTime,
            endTime: now,
            durationSeconds: duration,
          };
          updatedSessions = [...updatedSessions, finalSession];
        }

        const totalSeconds = updatedSessions.reduce(
          (acc, s) => acc + (s.durationSeconds || 0),
          0
        );
        const decimalHours = secondsToDecimalHours(totalSeconds);

        set({
          activeTaskId: null,
          activeTaskCode: null,
          activeTaskTitle: null,
          timerStatus: "IDLE",
          activeSessionStartTime: null,
          taskSessions: {
            ...taskSessions,
            [activeTaskId]: updatedSessions,
          },
        });

        if (onSaveCallback) {
          onSaveCallback(activeTaskId, decimalHours);
        }
      },

      handleTaskCompleted: (taskId, onSaveCallback) => {
        const { activeTaskId } = get();
        if (activeTaskId === taskId) {
          get().stopTimer(onSaveCallback);
        }
      },
    }),
    {
      name: "dayflow-timer-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTaskId: state.activeTaskId,
        activeTaskCode: state.activeTaskCode,
        activeTaskTitle: state.activeTaskTitle,
        timerStatus: state.timerStatus,
        activeSessionStartTime: state.activeSessionStartTime,
        taskSessions: state.taskSessions,
      }),
    }
  )
);

