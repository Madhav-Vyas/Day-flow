"use client";

import React from "react";
import { Check } from "lucide-react";
import { DayInfo, DayStats, Task } from "./types";
import { TaskCard } from "./TaskCard";

interface DayColumnProps {
  day: DayInfo;
  stats: DayStats;
  tasks: Task[];
  isToday: boolean;
  onCycleStatus: (taskId: string) => void;
  onLogTime: () => void;
  onRescheduleFE157: () => void;
  onOpenSlotClick: (dayIndex: number) => void;
}

export function DayColumn({
  day,
  stats,
  tasks,
  isToday,
  onCycleStatus,
  onLogTime,
  onRescheduleFE157,
  onOpenSlotClick,
}: DayColumnProps) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-3.5 transition-colors ${
        isToday
          ? "border-blue-300/80 bg-blue-50/20 shadow-xs dark:border-blue-800/60 dark:bg-blue-950/15"
          : "border-zinc-200/80 bg-white shadow-2xs dark:border-zinc-800/80 dark:bg-zinc-900/60"
      }`}
    >
      {/* Column Header */}
      <div className="flex flex-col border-b border-zinc-100 pb-2.5 dark:border-zinc-800/80">
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-bold ${
              isToday
                ? "text-blue-700 dark:text-blue-400"
                : "text-slate-800 dark:text-zinc-100"
            }`}
          >
            {day.dayName} {day.dayNumber}
            {isToday && " •"}
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
            {stats.totalHours.toFixed(1)}h
          </span>
        </div>

        <div className="flex items-center justify-between mt-0.5 text-xs">
          <span
            className={`font-medium ${
              isToday
                ? "text-blue-600 dark:text-blue-400 font-semibold"
                : "text-slate-500 dark:text-zinc-400"
            }`}
          >
            {stats.statusLabel}
          </span>

          {stats.isOver ? (
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              +{stats.diff.toFixed(1)}h
            </span>
          ) : stats.isUnder ? (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {Math.abs(stats.diff).toFixed(1)}h open
            </span>
          ) : (
            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-zinc-400">
              <Check className="h-3 w-3 text-slate-500" />
              Done
            </span>
          )}
        </div>
      </div>

      {/* Column Task Cards */}
      <div className="flex flex-col gap-2.5 pt-3 flex-1">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onCycleStatus={onCycleStatus}
            onLogTime={onLogTime}
            onQuickAction={
              task.quickAction ? onRescheduleFE157 : undefined
            }
          />
        ))}

        {/* Open Capacity / Buffer Slot Button */}
        {day.index === 3 && (
          <button
            type="button"
            onClick={() => onOpenSlotClick(3)}
            className="mt-auto flex items-center justify-center rounded-xl border border-dashed border-zinc-200 py-3 text-xs font-medium text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
          >
            + 1.0h open
          </button>
        )}

        {day.index === 4 && (
          <button
            type="button"
            onClick={() => onOpenSlotClick(4)}
            className="mt-auto flex items-center justify-center rounded-xl border border-dashed border-zinc-200 py-3 text-xs font-medium text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
          >
            + 2.0h buffer
          </button>
        )}
      </div>
    </div>
  );
}
