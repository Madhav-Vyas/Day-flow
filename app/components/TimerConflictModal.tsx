"use client";

import React from "react";
import { AlertCircle, X, Timer } from "lucide-react";
import { useTimerStore } from "@/lib/stores/timerStore";

export function TimerConflictModal() {
  const conflictInfo = useTimerStore((state) => state.conflictInfo);
  const clearConflict = useTimerStore((state) => state.clearConflict);

  if (!conflictInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-5 shadow-2xl dark:border-amber-900/50 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Another Timer is Active
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">
              Only one timer can run at a time across DayFlow. You currently have a running timer on:
            </p>
            <div className="mt-3 rounded-xl border border-zinc-200 bg-slate-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50 flex items-center gap-2">
              <Timer className="h-4 w-4 text-blue-600 shrink-0" />
              <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                <span className="text-blue-600 font-bold">{conflictInfo.activeTaskCode}</span> •{" "}
                {conflictInfo.activeTaskTitle}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-zinc-500">
              Please pause or stop the active task before starting a new timer.
            </p>
          </div>
          <button
            type="button"
            onClick={clearConflict}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={clearConflict}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}

