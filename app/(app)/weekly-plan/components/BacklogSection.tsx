"use client";

import React from "react";
import { ChevronDown, ChevronUp, Sparkles, ArrowRight } from "lucide-react";
import { Task } from "./types";

interface BacklogSectionProps {
  tasks: Task[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onOpenNewBacklogItem: () => void;
  onAddToPlan: (taskId: string) => void;
  onPlaceIntoFriday: () => void;
}

export function BacklogSection({
  tasks,
  isExpanded,
  onToggleExpanded,
  onOpenNewBacklogItem,
  onAddToPlan,
  onPlaceIntoFriday,
}: BacklogSectionProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/80">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex items-center gap-2 text-left cursor-pointer"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          )}
          <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            Unscheduled &amp; Backlog Carry-over
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
            {tasks.length} items
          </span>
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
          <span className="hidden md:inline">
            Drag cards directly into open day slots
          </span>
          <button
            type="button"
            onClick={onOpenNewBacklogItem}
            className="font-semibold text-slate-800 hover:text-slate-950 dark:text-zinc-200 dark:hover:text-white cursor-pointer"
          >
            + New Backlog Item
          </button>
        </div>
      </div>

      {/* Backlog Items Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-slate-50/50 p-4 shadow-2xs hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  <span>{task.code}</span>
                  <span>{task.hours.toFixed(1)}h</span>
                </div>
                <p className="my-2.5 text-xs font-medium leading-relaxed text-slate-800 dark:text-zinc-200">
                  {task.title}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {task.priority || "P3 Low"}
                </span>
                <button
                  type="button"
                  onClick={() => onAddToPlan(task.id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 cursor-pointer"
                >
                  + Add to plan
                </button>
              </div>
            </div>
          ))}

          {/* Capacity Advice Card */}
          <div className="flex flex-col justify-between rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-4 shadow-2xs dark:border-blue-900/50 dark:from-blue-950/20 dark:to-indigo-950/10">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Capacity Advice</span>
              </div>
              <p className="my-2.5 text-xs font-medium leading-relaxed text-slate-700 dark:text-zinc-300">
                Moving BUG-086 (1.0h) directly balances Friday without
                exceeding sprint targets.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onPlaceIntoFriday}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 cursor-pointer"
              >
                <span>Place into Friday Slot</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
