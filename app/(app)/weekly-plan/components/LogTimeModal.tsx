"use client";

import React, { useState } from "react";
import { X, Clock } from "lucide-react";

interface LogTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLog: (hours: number) => void;
}

export function LogTimeModal({
  isOpen,
  onClose,
  onSubmitLog,
}: LogTimeModalProps) {
  const [hoursToAdd, setHoursToAdd] = useState(0.5);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitLog(Number(hoursToAdd) || 0.5);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Log Time</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-4">
          <div>
            <span className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Active Task
            </span>
            <div className="rounded-lg border border-zinc-200 bg-slate-50 p-2.5 text-xs dark:border-zinc-700 dark:bg-zinc-800">
              <div className="font-semibold text-slate-800 dark:text-zinc-200">
                FE-142 • Auth token refresh &amp; silent renewal
              </div>
              <div className="text-slate-500 dark:text-zinc-400 mt-0.5">
                1.7h already logged (3.5h estimate)
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Hours to add
            </label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="8"
              value={hoursToAdd}
              onChange={(e) => setHoursToAdd(parseFloat(e.target.value) || 0.5)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:border-slate-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800"
            />
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
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
            >
              Submit Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
