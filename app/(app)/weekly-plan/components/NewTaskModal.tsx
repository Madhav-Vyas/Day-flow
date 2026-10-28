"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Calendar,
  Flag,
  FileText,
  Hash,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Tag,
  Bug,
  Zap,
  Users,
  BookOpen,
  RefreshCw,
  Check,
} from "lucide-react";
import {
  Task,
  CreateTaskInput,
  TaskPriority,
  TaskStatus,
  TaskCategory,
  DayInfo,
} from "./types";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDayIndex: number;
  onCreateTask: (task: CreateTaskInput & { hours?: number; loggedHours?: number }) => void;
  daysInfo?: DayInfo[];
}

/**
 * Category definition list with vibrant styling & icons
 */
const CATEGORIES: {
  value: TaskCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  selectedCardClass: string;
  unselectedCardClass: string;
}[] = [
  {
    value: "Feature",
    label: "Feature",
    icon: Sparkles,
    iconClass: "text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/50",
    selectedCardClass:
      "border-blue-500 bg-blue-50/70 text-blue-950 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-100 ring-2 ring-blue-500/20",
    unselectedCardClass:
      "border-zinc-200/90 bg-white hover:border-blue-200 hover:bg-slate-50/80 dark:border-zinc-800 dark:bg-zinc-850 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-200",
  },
  {
    value: "Bug",
    label: "Bug",
    icon: Bug,
    iconClass: "text-rose-600 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-900/50",
    selectedCardClass:
      "border-rose-500 bg-rose-50/70 text-rose-950 dark:border-rose-400 dark:bg-rose-950/40 dark:text-rose-100 ring-2 ring-rose-500/20",
    unselectedCardClass:
      "border-zinc-200/90 bg-white hover:border-rose-200 hover:bg-slate-50/80 dark:border-zinc-800 dark:bg-zinc-850 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-200",
  },
  {
    value: "Enhancement",
    label: "Enhancement",
    icon: Zap,
    iconClass: "text-purple-600 dark:text-purple-400 bg-purple-100/70 dark:bg-purple-900/50",
    selectedCardClass:
      "border-purple-500 bg-purple-50/70 text-purple-950 dark:border-purple-400 dark:bg-purple-950/40 dark:text-purple-100 ring-2 ring-purple-500/20",
    unselectedCardClass:
      "border-zinc-200/90 bg-white hover:border-purple-200 hover:bg-slate-50/80 dark:border-zinc-800 dark:bg-zinc-850 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-200",
  },
  {
    value: "Meetings",
    label: "Meetings",
    icon: Users,
    iconClass: "text-amber-600 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-900/50",
    selectedCardClass:
      "border-amber-500 bg-amber-50/70 text-amber-950 dark:border-amber-400 dark:bg-amber-950/40 dark:text-amber-100 ring-2 ring-amber-500/20",
    unselectedCardClass:
      "border-zinc-200/90 bg-white hover:border-amber-200 hover:bg-slate-50/80 dark:border-zinc-800 dark:bg-zinc-850 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-200",
  },
  {
    value: "Documentation",
    label: "Documentation",
    icon: BookOpen,
    iconClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/50",
    selectedCardClass:
      "border-emerald-500 bg-emerald-50/70 text-emerald-950 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-100 ring-2 ring-emerald-500/20",
    unselectedCardClass:
      "border-zinc-200/90 bg-white hover:border-emerald-200 hover:bg-slate-50/80 dark:border-zinc-800 dark:bg-zinc-850 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-200",
  },
  {
    value: "Refactoring",
    label: "Refactoring",
    icon: RefreshCw,
    iconClass: "text-cyan-600 dark:text-cyan-400 bg-cyan-100/70 dark:bg-cyan-900/50",
    selectedCardClass:
      "border-cyan-500 bg-cyan-50/70 text-cyan-950 dark:border-cyan-400 dark:bg-cyan-950/40 dark:text-cyan-100 ring-2 ring-cyan-500/20",
    unselectedCardClass:
      "border-zinc-200/90 bg-white hover:border-cyan-200 hover:bg-slate-50/80 dark:border-zinc-800 dark:bg-zinc-850 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-200",
  },
];

/**
 * Converts human hours and minutes to decimal hours for the backend.
 * Formula: hours + (minutes / 60)
 * Example: 1h 30m -> 1.50
 * Example: 2h 20m -> 2.33
 */
export function toDecimalHours(
  hours: number | string,
  minutes: number | string
): number {
  const h = Math.max(0, parseInt(String(hours), 10) || 0);
  const m = Math.max(0, Math.min(59, parseInt(String(minutes), 10) || 0));
  return parseFloat((h + m / 60).toFixed(2));
}

/**
 * Converts decimal hours back to hours and minutes (useful when editing).
 * Example: 2.33 -> { hours: 2, minutes: 20 }
 */
export function fromDecimalHours(decimal: number): {
  hours: number;
  minutes: number;
} {
  const totalMinutes = Math.round((Number(decimal) || 0) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
}

/**
 * Formats hours and minutes into clean human-readable text.
 * Example: 2, 20 -> "2h 20m"
 */
export function formatHoursMinutes(hours: number, minutes: number): string {
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  if (h === 0 && m === 0) return "0m";
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Reusable, intuitive Hours & Minutes Picker Component
 */
interface TimePickerInputProps {
  label: string;
  hours: number;
  minutes: number;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
  presets?: { label: string; h: number; m: number }[];
  accentColor?: "blue" | "emerald";
}

function TimePickerInput({
  label,
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  presets,
  accentColor = "blue",
}: TimePickerInputProps) {
  const decimal = toDecimalHours(hours, minutes);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200/90 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
      {/* Label and live calculated decimal preview */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Clock
            className={`h-3.5 w-3.5 ${
              accentColor === "emerald"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-blue-600 dark:text-blue-400"
            }`}
          />
          <span>{label}</span>
        </label>

        {/* Real-time decimal feedback badge */}
        <span
          className={`text-[11px] font-semibold rounded-md px-2 py-0.5 transition-colors ${
            accentColor === "emerald"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50"
              : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50"
          }`}
        >
          {formatHoursMinutes(hours, minutes)}{" "}
          <span className="opacity-75 font-normal">({decimal} hrs)</span>
        </span>
      </div>

      {/* Two discrete, simple inputs: Hours and Minutes */}
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
                onHoursChange(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-full text-xs font-semibold focus:outline-hidden bg-transparent text-slate-900 dark:text-zinc-100"
            />
            <span className="text-slate-400 text-[11px] font-medium ml-1">hrs</span>
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
                onMinutesChange(isNaN(val) ? 0 : Math.max(0, Math.min(59, val)));
              }}
              className="w-full text-xs font-semibold focus:outline-hidden bg-transparent text-slate-900 dark:text-zinc-100"
              placeholder="0"
            />
            <span className="text-slate-400 text-[11px] font-medium ml-1">mins</span>
          </div>
        </div>
      </div>

      {/* Quick-Pick Preset Pills */}
      {presets && presets.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mr-0.5">
            Presets:
          </span>
          {presets.map((preset) => {
            const isActive = hours === preset.h && minutes === preset.m;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  onHoursChange(preset.h);
                  onMinutesChange(preset.m);
                }}
                className={`rounded-md px-2 py-0.5 text-[11px] transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs"
                    : "bg-white text-slate-600 border border-zinc-200 hover:bg-slate-100 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700 font-medium"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function NewTaskModal({
  isOpen,
  onClose,
  defaultDayIndex,
  onCreateTask,
  daysInfo,
}: NewTaskModalProps) {
  // 1. Form Schema States
  const [category, setCategory] = useState<TaskCategory>("Feature");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [dayIndex, setDayIndex] = useState<number>(defaultDayIndex);
  const selectedDayInfo = daysInfo?.find((d) => d.index === Number(dayIndex));

  // 2. Simple Hours & Minutes States
  // Estimated Time (defaults to 2h 0m)
  const [estHours, setEstHours] = useState<number>(2);
  const [estMinutes, setEstMinutes] = useState<number>(0);

  // Actual / Logged Time (defaults to 0, collapsible)
  const [showActualTime, setShowActualTime] = useState<boolean>(false);
  const [actHours, setActHours] = useState<number>(0);
  const [actMinutes, setActMinutes] = useState<number>(0);

  // Reset or initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDayIndex(defaultDayIndex);
    }
  }, [isOpen, defaultDayIndex]);

  // Close on Escape key
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Convert hours and minutes to decimal hours for backend
    const estimatedDecimal = toDecimalHours(estHours, estMinutes);
    const actualDecimal = showActualTime
      ? toDecimalHours(actHours, actMinutes)
      : 0;

    // Automatically calculate planned date based on selected dayIndex
    const selectedDay = daysInfo?.find((d) => d.index === Number(dayIndex));
    const plannedDate = selectedDay ? selectedDay.formatted : null;

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
      // Compatibility fallbacks
      hours: estimatedDecimal,
      loggedHours: actualDecimal,
    });

    // Reset form fields
    setCategory("Feature");
    setTitle("");
    setCode("");
    setDescription("");
    setPriority("MEDIUM");
    setStatus("TODO");
    setEstHours(2);
    setEstMinutes(0);
    setActHours(0);
    setActMinutes(0);
    setShowActualTime(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 my-8 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 leading-none">
                Create New Task
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                Add an item to your weekly sprint plan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4 text-xs">
          {/* 1. CATEGORY SELECTOR (PROMINENT AT TOP) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Task Category</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                Selected: <span className="font-semibold text-slate-800 dark:text-zinc-200">{category}</span>
              </span>
            </div>

            {/* 3x2 Grid Cards: spacious, fully readable, zero truncation */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.value;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? `${cat.selectedCardClass} shadow-xs`
                        : `${cat.unselectedCardClass}`
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${cat.iconClass}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="whitespace-nowrap font-medium text-xs">
                        {cat.label}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-current/15 ml-1">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Title (Required) */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Auth token refresh & silent renewal pipeline"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 transition-all"
            />
          </div>

          {/* 3. Ticket ID / Code & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Hash className="h-3 w-3 text-slate-400" />
                <span>Ticket ID / Code</span>
                <span className="text-slate-400 font-normal text-[10px] ml-auto">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. FE-170"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Flag className="h-3 w-3 text-slate-400" />
                <span>Priority</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition-all cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* 4. Description (Optional) */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
              <FileText className="h-3 w-3 text-slate-400" />
              <span>Description / Notes</span>
              <span className="text-slate-400 font-normal text-[10px] ml-auto">
                (optional)
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add acceptance criteria, technical notes, or implementation links..."
              rows={2}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 resize-none transition-all"
            />
          </div>

          {/* 5. ESTIMATED TIME (Hours & Minutes with quick presets) */}
          <TimePickerInput
            label="Estimated Time"
            hours={estHours}
            minutes={estMinutes}
            onHoursChange={setEstHours}
            onMinutesChange={setEstMinutes}
            presets={[
              { label: "15m", h: 0, m: 15 },
              { label: "30m", h: 0, m: 30 },
              { label: "1h", h: 1, m: 0 },
              { label: "2h", h: 2, m: 0 },
              { label: "3h 30m", h: 3, m: 30 },
              { label: "4h", h: 4, m: 0 },
              { label: "8h", h: 8, m: 0 },
            ]}
            accentColor="blue"
          />

          {/* 6. ACTUAL TIME (Collapsible: "Already spent time on this?") */}
          <div className="rounded-xl border border-zinc-200/90 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-800/20 transition-all">
            <button
              type="button"
              onClick={() => setShowActualTime(!showActualTime)}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Already spent time on this?
              </span>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                <span>{showActualTime ? "Hide initial time" : "+ Add logged time"}</span>
                {showActualTime ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </div>
            </button>

            {showActualTime && (
              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in duration-150">
                <TimePickerInput
                  label="Initial Time Spent"
                  hours={actHours}
                  minutes={actMinutes}
                  onHoursChange={setActHours}
                  onMinutesChange={setActMinutes}
                  presets={[
                    { label: "15m", h: 0, m: 15 },
                    { label: "30m", h: 0, m: 30 },
                    { label: "1h", h: 1, m: 0 },
                    { label: "2h", h: 2, m: 0 },
                  ]}
                  accentColor="emerald"
                />
              </div>
            )}
          </div>

          {/* 7. DAY ASSIGNMENT & STATUS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span>Assign to Day</span>
              </label>
              <select
                value={dayIndex}
                onChange={(e) => setDayIndex(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition-all cursor-pointer"
              >
                {daysInfo && daysInfo.length > 0 ? (
                  daysInfo.map((d) => (
                    <option key={d.index} value={d.index}>
                      {d.dayName} {d.dayNumber}
                    </option>
                  ))
                ) : (
                  <>
                    <option value={0}>Monday</option>
                    <option value={1}>Tuesday</option>
                    <option value={2}>Wednesday</option>
                    <option value={3}>Thursday</option>
                    <option value={4}>Friday</option>
                  </>
                )}
                <option value={-1}>Unscheduled / Backlog</option>
              </select>
              <div className="mt-1 text-[10px] text-slate-400 dark:text-zinc-500">
                {selectedDayInfo ? (
                  <span>
                    Auto-planned for:{" "}
                    <strong className="text-slate-700 dark:text-zinc-300">
                      {selectedDayInfo.formatted}
                    </strong>
                  </span>
                ) : (
                  <span>No date (Unscheduled backlog item)</span>
                )}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition-all cursor-pointer"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
