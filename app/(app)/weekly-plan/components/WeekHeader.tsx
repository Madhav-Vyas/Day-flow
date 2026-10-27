"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Timer, Copy, Plus } from "lucide-react";

interface WeekHeaderProps {
  prevWeekMonday: string;
  nextWeekMonday: string;
  weekRangeDisplay: string;
  totalPlannedHours: number;
  targetSprintHours: number;
  sprintPercentage: number;
  sprintBuffer: number;
  onDuplicateLastWeek: () => void;
  onOpenNewTask: () => void;
}

export function WeekHeader({
  prevWeekMonday,
  nextWeekMonday,
  weekRangeDisplay,
  totalPlannedHours,
  targetSprintHours,
  sprintPercentage,
  sprintBuffer,
  onDuplicateLastWeek,
  onOpenNewTask,
}: WeekHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Week Selector */}
      <div className="flex items-center gap-2">
        <Link
          href={`/weekly-plan?week=${prevWeekMonday}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200/90 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <span className="text-base font-bold text-slate-900 dark:text-zinc-100">
          {weekRangeDisplay}
        </span>

        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
          Current Week
        </span>

        <Link
          href={`/weekly-plan?week=${nextWeekMonday}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200/90 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Sprint Progress Gauge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
          <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
            Sprint 24:{" "}
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {totalPlannedHours.toFixed(1)}h / {targetSprintHours.toFixed(1)}h
            </span>
          </span>
        </div>

        <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
          <div
            className="h-full bg-slate-700 dark:bg-zinc-300 transition-all duration-300"
            style={{ width: `${sprintPercentage}%` }}
          />
        </div>

        <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
          {sprintPercentage}% · {sprintBuffer.toFixed(1)}h buffer
        </span>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onDuplicateLastWeek}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Copy className="h-3.5 w-3.5 text-slate-500" />
          <span>Duplicate Last Week</span>
        </button>

        <button
          type="button"
          onClick={onOpenNewTask}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
