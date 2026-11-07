"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Calendar,
  Flag,
  FileText,
  Hash,
  Sparkles,
  Tag,
  Bug,
  Zap,
  Users,
  BookOpen,
  RefreshCw,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckCircle2,
  Timer,
} from "lucide-react";
import {
  Task,
  CreateTaskInput,
  TaskPriority,
  TaskStatus,
  TaskCategory,
  DayInfo,
} from "./types";
import {
  formatHoursMinutes,
  toDecimalHours,
  fromDecimalHours,
} from "@/lib/dateUtils";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDayIndex: number;
  onCreateTask: (
    task: CreateTaskInput & { hours?: number; loggedHours?: number },
  ) => void;
  daysInfo?: DayInfo[];
  mode?: "create" | "update";
  initialTask?: Task | null;
  onUpdateTask?: (task: Task) => void;
}

/**
 * Category definition list with streamlined Jira/Linear style pill styling
 */
const CATEGORIES: {
  value: TaskCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
  activeClass: string;
}[] = [
  {
    value: "Feature",
    label: "Feature",
    icon: Sparkles,
    badgeClass:
      "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60",
    activeClass:
      "bg-blue-600 text-white dark:bg-blue-500 border-blue-600 shadow-xs",
  },
  {
    value: "Bug",
    label: "Bug",
    icon: Bug,
    badgeClass:
      "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60",
    activeClass:
      "bg-rose-600 text-white dark:bg-rose-500 border-rose-600 shadow-xs",
  },
  {
    value: "Enhancement",
    label: "Enhance",
    icon: Zap,
    badgeClass:
      "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60",
    activeClass:
      "bg-purple-600 text-white dark:bg-purple-500 border-purple-600 shadow-xs",
  },
  {
    value: "Meetings",
    label: "Meeting",
    icon: Users,
    badgeClass:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60",
    activeClass:
      "bg-amber-600 text-white dark:bg-amber-500 border-amber-600 shadow-xs",
  },
  {
    value: "Documentation",
    label: "Docs",
    icon: BookOpen,
    badgeClass:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60",
    activeClass:
      "bg-emerald-600 text-white dark:bg-emerald-500 border-emerald-600 shadow-xs",
  },
  {
    value: "Refactoring",
    label: "Refactor",
    icon: RefreshCw,
    badgeClass:
      "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/60",
    activeClass:
      "bg-cyan-600 text-white dark:bg-cyan-500 border-cyan-600 shadow-xs",
  },
];

const PRESETS = [
  { label: "30m", h: 0, m: 30 },
  { label: "1h", h: 1, m: 0 },
  { label: "2h", h: 2, m: 0 },
  { label: "4h", h: 4, m: 0 },
  { label: "8h", h: 8, m: 0 },
];

export function NewTaskModal({
  isOpen,
  onClose,
  defaultDayIndex,
  onCreateTask,
  daysInfo,
  mode = "create",
  initialTask,
  onUpdateTask,
}: NewTaskModalProps) {
  const isEdit = mode === "update" || Boolean(initialTask);

  // Form State
  const [category, setCategory] = useState<TaskCategory>("Feature");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [dayIndex, setDayIndex] = useState<number>(defaultDayIndex);

  // Time States
  const [estHours, setEstHours] = useState<number>(2);
  const [estMinutes, setEstMinutes] = useState<number>(0);
  const [showActualTime, setShowActualTime] = useState<boolean>(false);
  const [actHours, setActHours] = useState<number>(0);
  const [actMinutes, setActMinutes] = useState<number>(0);

  // Synchronize state when modal opens or initialTask changes
  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setCategory((initialTask.category as TaskCategory) || "Feature");
        setTitle(initialTask.title || "");
        setCode(initialTask.code || "");
        setDescription(initialTask.description || "");
        setPriority((initialTask.priority as TaskPriority) || "MEDIUM");
        setStatus((initialTask.status as TaskStatus) || "TODO");
        setDayIndex(
          initialTask.dayIndex !== undefined
            ? Number(initialTask.dayIndex)
            : defaultDayIndex,
        );

        const est = fromDecimalHours(
          initialTask.estimatedHours ?? initialTask.hours ?? 2,
        );
        setEstHours(est.hours);
        setEstMinutes(est.minutes);

        const actualVal =
          initialTask.actualHours ?? initialTask.loggedHours ?? 0;
        const act = fromDecimalHours(actualVal);
        setActHours(act.hours);
        setActMinutes(act.minutes);
        setShowActualTime(actualVal > 0);
      } else {
        setCategory("Feature");
        setTitle("");
        setCode("");
        setDescription("");
        setPriority("MEDIUM");
        setStatus("TODO");
        setDayIndex(defaultDayIndex);
        setEstHours(2);
        setEstMinutes(0);
        setActHours(0);
        setActMinutes(0);
        setShowActualTime(false);
      }
    }
  }, [isOpen, initialTask, defaultDayIndex]);

  // Keyboard accessibility: Escape to close, Ctrl/Cmd + Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    title,
    category,
    code,
    description,
    priority,
    status,
    dayIndex,
    estHours,
    estMinutes,
    actHours,
    actMinutes,
    showActualTime,
  ]);

  if (!isOpen) return null;

  const selectedDayInfo = daysInfo?.find((d) => d.index === Number(dayIndex));
  const estimatedDecimal = toDecimalHours(estHours, estMinutes);
  const actualDecimal = showActualTime
    ? toDecimalHours(actHours, actMinutes)
    : 0;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const plannedDate = selectedDayInfo
      ? selectedDayInfo.formatted
      : initialTask?.plannedDate || null;

    if (isEdit && initialTask) {
      const updated: Task = {
        ...initialTask,
        id: initialTask.id || initialTask._id,
        _id: initialTask._id,
        category,
        title: title.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        priority,
        status,
        dayIndex: Number(dayIndex),
        plannedDate,
        estimatedHours: estimatedDecimal,
        actualHours: actualDecimal,
        hours: estimatedDecimal,
        loggedHours: actualDecimal,
      };

      if (onUpdateTask) {
        onUpdateTask(updated);
      } else {
        onCreateTask(updated as any);
      }
    } else {
      onCreateTask({
        category,
        title: title.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        priority,
        status,
        dayIndex: Number(dayIndex),
        plannedDate,
        estimatedHours: estimatedDecimal,
        actualHours: actualDecimal,
        hours: estimatedDecimal,
        loggedHours: actualDecimal,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl lg:max-w-4xl rounded-2xl border border-zinc-200/90 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 my-auto transition-all overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. COMPACT HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {isEdit ? "Edit Task" : "Create New Task"}
              </h2>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {selectedDayInfo
                  ? `${selectedDayInfo.dayName} (${selectedDayInfo.formatted})`
                  : "Backlog"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. FORM BODY - WIDE TWO-COLUMN MANAGED LAYOUT */}
        <form onSubmit={handleSubmit} className="flex flex-col text-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800/80">
            {/* LEFT MAIN PANEL (7 COLS): Content & Time */}
            <div className="md:col-span-7 p-5 flex flex-col gap-4">
              {/* Category Pills (Horizontal, Minimal) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.value;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? cat.activeClass
                            : `${cat.badgeClass} hover:opacity-85`
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement auth refresh flow"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 transition-all"
                />
              </div>

              {/* Description / Notes */}
              <div className="flex-1 flex flex-col">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Description &amp; Acceptance</span>
                  <span className="text-[10px] lowercase font-normal text-slate-400">
                    optional
                  </span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add context, acceptance criteria, or relevant links..."
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 resize-none transition-all flex-1 min-h-[72px]"
                />
              </div>

              {/* Compact Estimation & Logged Hours */}
              <div className="rounded-xl border border-zinc-200/80 bg-slate-50/60 dark:border-zinc-800 dark:bg-zinc-800/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Estimated Time</span>
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/50 px-2 py-0.5 rounded-md">
                    {formatHoursMinutes(estHours, estMinutes)} (
                    {estimatedDecimal}h)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800 w-24">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={estHours}
                      onChange={(e) =>
                        setEstHours(
                          Math.max(0, parseInt(e.target.value, 10) || 0),
                        )
                      }
                      className="w-full text-xs font-semibold focus:outline-hidden bg-transparent text-slate-900 dark:text-zinc-100"
                    />
                    <span className="text-slate-400 text-[10px] font-medium ml-1">
                      hrs
                    </span>
                  </div>

                  <div className="flex items-center rounded-lg border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800 w-24">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="5"
                      value={estMinutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setEstMinutes(
                          isNaN(val) ? 0 : Math.max(0, Math.min(59, val)),
                        );
                      }}
                      className="w-full text-xs font-semibold focus:outline-hidden bg-transparent text-slate-900 dark:text-zinc-100"
                    />
                    <span className="text-slate-400 text-[10px] font-medium ml-1">
                      min
                    </span>
                  </div>

                  {/* Presets */}
                  <div className="flex items-center gap-1 ml-auto flex-wrap">
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setEstHours(p.h);
                          setEstMinutes(p.m);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-medium transition-colors cursor-pointer ${
                          estHours === p.h && estMinutes === p.m
                            ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent font-semibold"
                            : "bg-white text-slate-600 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actual Time Toggle & Inputs */}
                <div className="mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/50">
                  <button
                    type="button"
                    onClick={() => setShowActualTime(!showActualTime)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 cursor-pointer"
                  >
                    {showActualTime ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {showActualTime
                        ? "Hide logged time"
                        : "+ Add logged time (optional)"}
                    </span>
                    {showActualTime && (
                      <span className="ml-auto font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatHoursMinutes(actHours, actMinutes)} (
                        {actualDecimal}h)
                      </span>
                    )}
                  </button>

                  {showActualTime && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center rounded-lg border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800 w-24">
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={actHours}
                          onChange={(e) =>
                            setActHours(
                              Math.max(0, parseInt(e.target.value, 10) || 0),
                            )
                          }
                          className="w-full text-xs font-semibold focus:outline-hidden bg-transparent text-slate-900 dark:text-zinc-100"
                        />
                        <span className="text-slate-400 text-[10px] font-medium ml-1">
                          hrs
                        </span>
                      </div>
                      <div className="flex items-center rounded-lg border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800 w-24">
                        <input
                          type="number"
                          min="0"
                          max="59"
                          step="5"
                          value={actMinutes}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setActMinutes(
                              isNaN(val) ? 0 : Math.max(0, Math.min(59, val)),
                            );
                          }}
                          className="w-full text-xs font-semibold focus:outline-hidden bg-transparent text-slate-900 dark:text-zinc-100"
                        />
                        <span className="text-slate-400 text-[10px] font-medium ml-1">
                          min
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR PANEL (5 COLS): Properties (Jira/Linear style) */}
            <div className="md:col-span-5 p-5 flex flex-col gap-4 bg-slate-50/30 dark:bg-zinc-900/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Sprint Properties
              </span>

              {/* Day / Schedule Assignment */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span>Planned Day</span>
                </label>
                <select
                  value={dayIndex}
                  onChange={(e) => setDayIndex(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition-all cursor-pointer shadow-2xs"
                >
                  <option value={0}>Monday</option>
                  <option value={1}>Tuesday</option>
                  <option value={2}>Wednesday</option>
                  <option value={3}>Thursday</option>
                  <option value={4}>Friday</option>
                  <option value={-1}>Unscheduled (Backlog)</option>
                </select>

                <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                  {selectedDayInfo ? (
                    <span className="inline-flex items-center gap-1 font-medium text-blue-700 dark:text-blue-400">
                      <span>Scheduled for {selectedDayInfo.formatted}</span>
                    </span>
                  ) : (
                    <span>Stored in backlog carry-over</span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Circle className="h-3 w-3 text-slate-400" />
                  <span>Status</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition-all cursor-pointer shadow-2xs"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Flag className="h-3 w-3 text-slate-400" />
                  <span>Priority</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition-all cursor-pointer shadow-2xs"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Ticket ID / Reference */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-3 w-3 text-slate-400" />
                    <span>Ticket / Code</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    optional
                  </span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. FE-182"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* 3. MODAL FOOTER */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="text-[11px] text-slate-400 dark:text-zinc-500 hidden sm:block">
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-mono">
                Esc
              </kbd>{" "}
              to cancel,{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-mono">
                Ctrl+Enter
              </kbd>{" "}
              to submit
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
              >
                {isEdit ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
