"use client";

import React from "react";
import { Search, Clock, Plus, Calendar } from "lucide-react";

interface TopAppBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenLogTime: () => void;
  onOpenNewTask: () => void;
  totalPlannedHours: number;
}

export function TopAppBar({
  searchQuery,
  onSearchChange,
  onOpenLogTime,
  onOpenNewTask,
  totalPlannedHours,
}: TopAppBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-200/80 bg-white/95 px-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
      {/* Left: Breadcrumbs & Date */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
          <span>DayFlow</span>
          <span>&gt;</span>
          <span className="text-slate-800 dark:text-zinc-200">Workspace</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 rounded-md bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-zinc-800/80 dark:text-zinc-300">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          <span>Wednesday, Oct 23</span>
        </div>
      </div>

      {/* Center: Capacity Meter */}
      <div className="hidden lg:flex items-center gap-2.5">
        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
          Capacity
        </span>
        <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
          <div
            className="h-full bg-slate-700 dark:bg-zinc-300 transition-all duration-300"
            style={{ width: "68%" }}
          />
        </div>
        <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
          5.5h / 8.0h
        </span>
      </div>

      {/* Right: Search, Log Time, New Task */}
      <div className="flex items-center gap-2.5">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-48 rounded-lg border border-zinc-200 bg-slate-50/80 pl-8 pr-8 text-xs placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-zinc-200 bg-white px-1 py-0.2 text-[10px] text-slate-400 dark:border-zinc-700 dark:bg-zinc-800">
            ⌘K
          </kbd>
        </div>

        <button
          type="button"
          onClick={onOpenLogTime}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>Log Time</span>
        </button>

        <button
          type="button"
          onClick={onOpenNewTask}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
}
