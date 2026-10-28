"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, CheckCircle2 } from "lucide-react";
import { formatHoursMinutes, toDecimalHours } from "@/lib/dateUtils";

interface LogTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLog: (hours: number) => void;
  taskTitle?: string;
  taskCode?: string;
}

export function LogTimeModal({
  isOpen,
  onClose,
  onSubmitLog,
  taskTitle = "Auth token refresh & silent renewal",
  taskCode = "FE-142",
}: LogTimeModalProps) {
  // Simple Hours & Minutes state
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(30);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const decimal = toDecimalHours(hours, minutes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hours === 0 && minutes === 0) return;
    onSubmitLog(decimal);
    onClose();
  };

  const presets = [
    { label: "15m", h: 0, m: 15 },
    { label: "30m", h: 0, m: 30 },
    { label: "45m", h: 0, m: 45 },
    { label: "1h", h: 1, m: 0 },
    { label: "2h", h: 2, m: 0 },
    { label: "2h 30m", h: 2, m: 30 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <span>Log Time Spent</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3.5 pt-3.5 text-xs"
        >
          {/* Active Task Summary */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Task
            </span>
            <div className="rounded-xl border border-zinc-200/90 bg-slate-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/40">
              <div className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                {taskCode} • {taskTitle}
              </div>
            </div>
          </div>

          {/* Time Picker Card */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-zinc-200/90 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Time to Log
              </span>
              <span className="text-[11px] font-semibold rounded-md bg-blue-50 px-2 py-0.5 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                {formatHoursMinutes(hours, minutes)}{" "}
                <span className="opacity-75 font-normal">({decimal} hrs)</span>
              </span>
            </div>

            {/* Hours and Minutes Inputs */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1 block">
                  Hours
                </span>
                <div className="flex items-center rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 transition-all">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={hours}
                    onChange={(e) =>
                      setHours(Math.max(0, parseInt(e.target.value, 10) || 0))
                    }
                    className="w-full text-xs font-semibold focus:outline-hidden bg-transparent text-slate-900 dark:text-zinc-100"
                  />
                  <span className="text-slate-400 text-[11px] font-medium ml-1">
                    hrs
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1 block">
                  Minutes
                </span>
                <div className="flex items-center rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 transition-all">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    value={minutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setMinutes(
                        isNaN(val) ? 0 : Math.max(0, Math.min(59, val)),
                      );
                    }}
                    className="w-full text-xs font-semibold focus:outline-hidden bg-transparent text-slate-900 dark:text-zinc-100"
                    placeholder="0"
                  />
                  <span className="text-slate-400 text-[11px] font-medium ml-1">
                    mins
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-zinc-200/50 dark:border-zinc-700/50">
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 mr-0.5">
                Presets:
              </span>
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setHours(p.h);
                    setMinutes(p.m);
                  }}
                  className={`rounded-md px-2 py-0.5 text-[11px] transition-all cursor-pointer ${
                    hours === p.h && minutes === p.m
                      ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold"
                      : "bg-white text-slate-600 border border-zinc-200 hover:bg-slate-100 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700 font-medium"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hours === 0 && minutes === 0}
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
            >
              Log Time
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
