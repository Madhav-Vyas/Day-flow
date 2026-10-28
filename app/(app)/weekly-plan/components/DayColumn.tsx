"use client";

import React, { useMemo } from "react";
import { Check, Plus } from "lucide-react";
import { DayInfo, DayStats, Task } from "./types";
import { TaskCard } from "./TaskCard";
import { TARGET_CAPACITY_PER_DAY } from "./mockData";

interface DayColumnProps {
  day: DayInfo;
  tasks: Task[];
  isToday?: boolean;
  onCycleStatus?: (taskId: string) => void;
  onLogTime?: () => void;
  onAddTask?: (dayIndex: number) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  // Backward compatibility optional props:
  stats?: Partial<DayStats> | string;
  onOpenSlotClick?: (dayIndex: number) => void;
  onRescheduleFE157?: () => void;
}

export function DayColumn({
  day,
  tasks,
  isToday = false,
  onCycleStatus = () => {},
  onLogTime = () => {},
  onAddTask,
  onOpenSlotClick,
  onEditTask,
  onDeleteTask,
}: DayColumnProps) {
  const handleAddTask = () => {
    const handler = onAddTask || onOpenSlotClick;
    handler?.(day.index);
  };

  const totalHours = useMemo(() => {
    return tasks.reduce(
      (sum, t) => sum + (t.estimatedHours ?? t.hours ?? 0),
      0
    );
  }, [tasks]);

  const diff = TARGET_CAPACITY_PER_DAY - totalHours;
  const isOver = totalHours > TARGET_CAPACITY_PER_DAY;
  const isUnder = totalHours < TARGET_CAPACITY_PER_DAY;

  const statusLabel =
    tasks.length === 0
      ? "0 tasks"
      : `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;

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
            {totalHours.toFixed(1)}h
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
            {statusLabel}
          </span>

          {isOver ? (
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              +{Math.abs(diff).toFixed(1)}h
            </span>
          ) : isUnder ? (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {diff.toFixed(1)}h open
            </span>
          ) : (
            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-zinc-400">
              <Check className="h-3 w-3 text-slate-500" />
              Full
            </span>
          )}
        </div>
      </div>

      {/* Column Task Cards */}
      <div className="flex flex-col gap-2.5 pt-3 flex-1">
        {tasks.map((task) => (
          <TaskCard
            key={task.id || task._id}
            task={task}
            onCycleStatus={onCycleStatus}
            onLogTime={onLogTime}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}

        {/* Add Task Button */}
        <button
          type="button"
          onClick={handleAddTask}
          className="mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-200 py-2.5 text-xs font-medium text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add task</span>
        </button>
      </div>
    </div>
  );
}
