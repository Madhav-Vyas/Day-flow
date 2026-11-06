"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Pause, Square, ExternalLink } from "lucide-react";
import { useTimerStore } from "@/lib/stores/timerStore";
import { formatSecondsToHMS } from "@/lib/timerUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "@/lib/services/task-service";

export function GlobalTimerBar() {
  const queryClient = useQueryClient();
  const {
    activeTaskId,
    activeTaskCode,
    activeTaskTitle,
    timerStatus,
    pauseTimer,
    resumeTimer,
    stopTimer,
    getTaskTotalSeconds,
  } = useTimerStore();

  const [displaySeconds, setDisplaySeconds] = useState(0);

  // Sync mutation to backend actualHours
  const saveTimeMutation = useMutation({
    mutationFn: (payload: { id: string; actualHours: number }) =>
      updateTask(payload as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todaystask"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Real-time tick using timestamp math
  useEffect(() => {
    if (!activeTaskId || timerStatus === "IDLE") {
      setDisplaySeconds(0);
      return;
    }

    const updateDisplay = () => {
      setDisplaySeconds(getTaskTotalSeconds(activeTaskId));
    };

    updateDisplay();

    if (timerStatus === "RUNNING") {
      const interval = setInterval(updateDisplay, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTaskId, timerStatus, getTaskTotalSeconds]);

  if (!activeTaskId || timerStatus === "IDLE") return null;

  const handleStop = () => {
    stopTimer((taskId, totalHours) => {
      saveTimeMutation.mutate({ id: taskId, actualHours: totalHours });
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-2xl border border-zinc-200/90 bg-white/95 p-3 px-4 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 transition-all">
      {/* Status indicator pulse */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {timerStatus === "RUNNING" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              timerStatus === "RUNNING" ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          {timerStatus}
        </span>
      </div>

      <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

      {/* Task info */}
      <div className="flex flex-col min-w-0 max-w-[180px] sm:max-w-xs">
        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 truncate">
          {activeTaskCode}
        </span>
        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
          {activeTaskTitle}
        </span>
      </div>

      {/* Counter */}
      <div className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-900 dark:bg-zinc-800 dark:text-zinc-100">
        {formatSecondsToHMS(displaySeconds)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {timerStatus === "RUNNING" ? (
          <button
            type="button"
            onClick={pauseTimer}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 transition-colors cursor-pointer"
            title="Pause timer"
          >
            <Pause className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={resumeTimer}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 transition-colors cursor-pointer"
            title="Resume timer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
          </button>
        )}

        <button
          type="button"
          onClick={handleStop}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 transition-colors cursor-pointer"
          title="Stop & Save time"
        >
          <Square className="h-3.5 w-3.5 fill-current" />
        </button>

        <Link
          href="/time-tracking"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          title="Go to Time Tracking"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

