"use client";

import React from "react";
import { Pause, Pencil, Trash2 } from "lucide-react";
import { Task } from "./types";

interface TaskCardProps {
  task: Task;
  onCycleStatus: (taskId: string) => void;
  onLogTime: () => void;
  onQuickAction?: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({
  task,
  onCycleStatus,
  onLogTime,
  onQuickAction,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const taskId = task.id || task._id || "";

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-3 shadow-2xs hover:border-slate-300 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-zinc-700 transition-all">
      {/* Card Top: Code, Category & Hours */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-zinc-400 tracking-tight">
          <span>{task.code || "TASK"}</span>
          {task.category && (
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
              {task.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Edit & Delete Action Buttons - Shown only when card is hovered */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(task);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:text-blue-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Edit task"
              aria-label="Edit task"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(taskId);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Delete task"
              aria-label="Delete task"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>

          <span className="font-medium text-slate-600 dark:text-zinc-400 shrink-0">
            {(task.actualHours ?? task.loggedHours) !== undefined &&
            (task.actualHours ?? task.loggedHours ?? 0) > 0
              ? `${task.actualHours ?? task.loggedHours} / ${task.estimatedHours ?? task.hours ?? 0}h`
              : `${(task.estimatedHours ?? task.hours ?? 0).toFixed(1)}h`}
          </span>
        </div>
      </div>

      {/* Card Title */}
      <p className="my-2 text-xs font-medium leading-snug text-slate-800 dark:text-zinc-200 line-clamp-2">
        {task.title}
      </p>

      {/* Card Bottom: Status & Quick Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-50 dark:border-zinc-800/50 text-xs">
        {task.status === "DONE" && (
          <button
            type="button"
            onClick={() => onCycleStatus(taskId)}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium cursor-pointer"
          >
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300 text-[10px]">
              ✓
            </span>
            <span>Done</span>
          </button>
        )}

        {task.status === "IN_PROGRESS" && (
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => onCycleStatus(taskId)}
              className="flex items-center gap-1 font-medium text-slate-700 dark:text-zinc-300 hover:text-blue-600 cursor-pointer"
            >
              <Pause className="h-3 w-3 text-slate-600" />
              <span>In progress</span>
            </button>
            <button
              type="button"
              onClick={onLogTime}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
            >
              Log
            </button>
          </div>
        )}

        {task.status === "TODO" && (
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => onCycleStatus(taskId)}
              className="text-slate-500 hover:text-slate-800 dark:text-zinc-400 font-medium cursor-pointer"
            >
              To Do
            </button>
            {task.quickAction && onQuickAction && (
              <button
                type="button"
                onClick={onQuickAction}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors cursor-pointer"
              >
                {task.quickAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
