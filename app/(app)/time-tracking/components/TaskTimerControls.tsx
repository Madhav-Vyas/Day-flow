"use client";

import React, { useEffect, useState } from "react";
import { Play, Pause, Square, Lock } from "lucide-react";
import { Task } from "@/app/(app)/weekly-plan/components/types";
import { useTimerStore } from "@/lib/stores/timerStore";
import { formatSecondsToHMS } from "@/lib/timerUtils";

interface TaskTimerControlsProps {
  task: Task;
  onSaveTime: (taskId: string, totalHours: number) => void;
}

export function TaskTimerControls({ task, onSaveTime }: TaskTimerControlsProps) {
  const taskId = task.id || task._id || "";
  const isDone = task.status === "DONE";

  const {
    activeTaskId,
    timerStatus,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    getTaskTotalSeconds,
  } = useTimerStore();

  const isCurrentTaskActive = activeTaskId === taskId;
  const isRunning = isCurrentTaskActive && timerStatus === "RUNNING";
  const isPaused = isCurrentTaskActive && timerStatus === "PAUSED";

  const [seconds, setSeconds] = useState(() => (taskId ? getTaskTotalSeconds(taskId) : 0));

  useEffect(() => {
    if (!taskId) return;
    const update = () => setSeconds(getTaskTotalSeconds(taskId));
    update();

    if (isRunning) {
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }
  }, [taskId, isRunning, isPaused, getTaskTotalSeconds]);

  // Permanently locked when task is completed
  if (isDone) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-850 dark:text-zinc-400">
        <Lock className="h-3 w-3 text-zinc-400" />
        <span>Locked</span>
      </div>
    );
  }

  const handleStart = () => {
    startTimer(task);
  };

  const handleStop = () => {
    stopTimer((tId, hours) => {
      onSaveTime(tId, hours);
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Live elapsed timer display if tracked */}
      {seconds > 0 && (
        <span
          className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md ${
            isRunning
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
              : isPaused
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          {formatSecondsToHMS(seconds)}
        </span>
      )}

      {/* Timer action controls */}
      {!isCurrentTaskActive || timerStatus === "IDLE" ? (
        <button
          type="button"
          onClick={handleStart}
          className="inline-flex h-8 items-center gap-1 rounded-lg bg-slate-900 px-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
          title="Start timer for this task"
        >
          <Play className="h-3 w-3 fill-current" />
          <span>Start</span>
        </button>
      ) : isRunning ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={pauseTimer}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300 transition-colors cursor-pointer"
            title="Pause timer"
          >
            <Pause className="h-3 w-3" />
            <span>Pause</span>
          </button>
          <button
            type="button"
            onClick={handleStop}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition-colors cursor-pointer"
            title="Stop & Save actual time"
          >
            <Square className="h-3 w-3 fill-current" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={resumeTimer}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors cursor-pointer"
            title="Resume timer"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Resume</span>
          </button>
          <button
            type="button"
            onClick={handleStop}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition-colors cursor-pointer"
            title="Stop & Save actual time"
          >
            <Square className="h-3 w-3 fill-current" />
          </button>
        </div>
      )}
    </div>
  );
}

