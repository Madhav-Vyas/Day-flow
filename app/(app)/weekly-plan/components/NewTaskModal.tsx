"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Task } from "./types";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDayIndex: number;
  onCreateTask: (task: Omit<Task, "id">) => void;
}

export function NewTaskModal({
  isOpen,
  onClose,
  defaultDayIndex,
  onCreateTask,
}: NewTaskModalProps) {
  const [code, setCode] = useState("FE-170");
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState(2.0);
  const [dayIndex, setDayIndex] = useState(defaultDayIndex);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateTask({
      code: code.trim() || `FE-${Math.floor(Math.random() * 900 + 100)}`,
      title: title.trim(),
      hours: Number(hours) || 2.0,
      dayIndex,
      status: "TODO",
      tag: "FE",
    });

    setTitle("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            Add Task to Plan
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Task Code / ID
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. FE-170"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:border-slate-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Title / Description
            </label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              rows={3}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:border-slate-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Hours (est.)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value) || 1)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:border-slate-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Assign To
              </label>
              <select
                value={dayIndex}
                onChange={(e) => setDayIndex(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:border-slate-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value={0}>Mon 21</option>
                <option value={1}>Tue 22</option>
                <option value={2}>Wed 23 (Today)</option>
                <option value={3}>Thu 24</option>
                <option value={4}>Fri 25</option>
                <option value={-1}>Backlog</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
