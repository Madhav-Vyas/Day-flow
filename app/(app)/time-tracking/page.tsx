"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  Pencil,
  Trash2,
  TrendingUp,
  Target,
  Sparkles,
} from "lucide-react";

import { TopAppBar } from "@/app/(app)/weekly-plan/components/TopAppBar";
import { NewTaskModal } from "@/app/(app)/weekly-plan/components/NewTaskModal";
import { LogTimeModal } from "@/app/(app)/weekly-plan/components/LogTimeModal";
import {
  Task,
  TaskStatus,
  CreateTaskInput,
} from "@/app/(app)/weekly-plan/components/types";
import { TARGET_CAPACITY_PER_DAY } from "@/app/(app)/weekly-plan/components/mockData";
import { getTodaysTask } from "@/lib/services/todaysTask-service";
import {
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/services/task-service";
import { useTodaysTaskStore, StatusFilter } from "@/lib/stores/todaysTaskStore";
import { useTimerStore } from "@/lib/stores/timerStore";
import { TaskTimerControls } from "./components/TaskTimerControls";

const PRIORITY_STYLES: Record<string, { label: string; className: string }> = {
  URGENT: {
    label: "Urgent",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60",
  },
  HIGH: {
    label: "High",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60",
  },
  LOW: {
    label: "Low",
    className: "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  },
};

export default function TimeTrackingPage() {
  const queryClient = useQueryClient();

  // Date setup (evaluated once in state to preserve render purity)
  const [todayDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [dateDisplay] = useState(() => dayjs().format("dddd, MMM D, YYYY"));

  // Zustand state
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isNewTaskModalOpen,
    setIsNewTaskModalOpen,
    isLogTimeModalOpen,
    setIsLogTimeModalOpen,
  } = useTodaysTaskStore();

  // Selected task state for modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");

  // Determine ISO weekday index (0 = Mon, 1 = Tue, ..., 4 = Fri, -1 = Weekend/Backlog)
  const todayDayIndex = useMemo(() => {
    const d = dayjs().day();
    return d >= 1 && d <= 5 ? d - 1 : -1;
  }, []);

  // Fetch today's tasks
  const {
    data: rawTasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Task[]>({
    queryKey: ["todaystask", todayDate],
    queryFn: () => getTodaysTask(todayDate),
  });

  // Normalize tasks
  const tasks: Task[] = useMemo(() => {
    if (!Array.isArray(rawTasks)) return [];
    return rawTasks.map((t: Task) => ({
      ...t,
      id: t.id || t._id,
    }));
  }, [rawTasks]);

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todaystask", todayDate] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todaystask", todayDate] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todaystask", todayDate] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Handlers for task actions
  const handleOpenNewTask = () => {
    setSelectedTask(null);
    setModalMode("create");
    setIsNewTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setModalMode("update");
    setIsNewTaskModalOpen(true);
  };

  const handleOpenLogTime = (task?: Task) => {
    setSelectedTask(task ?? tasks[0] ?? null);
    setIsLogTimeModalOpen(true);
  };

  const handleCreateTask = (taskData: CreateTaskInput) => {
    createTaskMutation.mutate({
      ...taskData,
      plannedDate: taskData.plannedDate || todayDate,
      dayIndex: taskData.dayIndex !== undefined ? taskData.dayIndex : todayDayIndex,
    });
  };

  const handleUpdateTask = (taskData: Task) => {
    updateTaskMutation.mutate(taskData);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleTaskCompleted = useTimerStore((state) => state.handleTaskCompleted);

  const handleToggleStatus = (task: Task) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      TODO: "IN_PROGRESS",
      IN_PROGRESS: "DONE",
      DONE: "TODO",
    };
    const current = (task.status as TaskStatus) || "TODO";
    const newStatus = nextStatus[current] || "TODO";
    const taskId = task.id || task._id || "";

    if (newStatus === "DONE") {
      handleTaskCompleted(taskId, (tId, totalHours) => {
        updateTaskMutation.mutate({
          ...task,
          status: "DONE",
          actualHours: totalHours,
          loggedHours: totalHours,
        });
      });
      return;
    }

    updateTaskMutation.mutate({
      ...task,
      status: newStatus,
    });
  };

  const handleSaveTrackedTime = (taskId: string, totalHours: number) => {
    const target = tasks.find((t) => (t.id || t._id) === taskId);
    if (!target) return;
    updateTaskMutation.mutate({
      ...target,
      actualHours: totalHours,
      loggedHours: totalHours,
    });
  };

  const handleSubmitLog = (loggedHours: number) => {
    if (!selectedTask) return;
    const currentLogged = Number(selectedTask.loggedHours || selectedTask.actualHours || 0);
    const newTotal = parseFloat((currentLogged + loggedHours).toFixed(2));
    updateTaskMutation.mutate({
      ...selectedTask,
      loggedHours: newTotal,
      actualHours: newTotal,
    });
  };

  // Metrics calculations
  const totalPlannedHours = useMemo(() => {
    return tasks.reduce(
      (sum, t) => sum + Number(t.estimatedHours ?? t.hours ?? 0),
      0,
    );
  }, [tasks]);

  const totalLoggedHours = useMemo(() => {
    return tasks.reduce(
      (sum, t) => sum + Number(t.loggedHours ?? t.actualHours ?? 0),
      0,
    );
  }, [tasks]);

  const completedCount = useMemo(() => {
    return tasks.filter((t) => t.status === "DONE").length;
  }, [tasks]);

  const inProgressCount = useMemo(() => {
    return tasks.filter((t) => t.status === "IN_PROGRESS").length;
  }, [tasks]);

  const todoCount = useMemo(() => {
    return tasks.filter((t) => t.status === "TODO" || !t.status).length;
  }, [tasks]);

  const remainingHours = Math.max(0, TARGET_CAPACITY_PER_DAY - totalLoggedHours);
  const completionPercentage = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  // Filter tasks by search query and status filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (statusFilter === "TODO" && task.status !== "TODO" && task.status) {
        return false;
      }
      if (statusFilter === "IN_PROGRESS" && task.status !== "IN_PROGRESS") {
        return false;
      }
      if (statusFilter === "DONE" && task.status !== "DONE") {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(q);
        const matchesCode = task.code?.toLowerCase().includes(q);
        const matchesCategory = task.category?.toLowerCase().includes(q);
        const matchesDescription = task.description?.toLowerCase().includes(q);
        return matchesTitle || matchesCode || matchesCategory || matchesDescription;
      }

      return true;
    });
  }, [tasks, statusFilter, searchQuery]);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 transition-colors">
      {/* 1. TOP NAVBAR (Shared styling with Weekly Plan) */}
      <TopAppBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenLogTime={() => handleOpenLogTime()}
        onOpenNewTask={handleOpenNewTask}
        totalPlannedHours={totalPlannedHours}
        loggedHours={totalLoggedHours}
        targetHours={TARGET_CAPACITY_PER_DAY}
        dateLabel={dateDisplay}
        breadcrumbPage="Time Tracking"
      />

      <main className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* 2. PAGE HEADER & SUMMARY CARDS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Today&apos;s Time &amp; Tasks
              </h1>
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                <Calendar className="h-3 w-3" />
                {todayDate}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Log time, track progress, and manage your focus items for today.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenLogTime()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Clock className="h-4 w-4 text-slate-500" />
              <span>Quick Log</span>
            </button>
            <button
              type="button"
              onClick={handleOpenNewTask}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* 3. METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Logged Hours */}
          <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-medium">Time Logged Today</span>
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                {totalLoggedHours.toFixed(1)}h
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">
                / {TARGET_CAPACITY_PER_DAY.toFixed(1)}h goal
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                style={{
                  width: `${Math.min(
                    Math.round((totalLoggedHours / TARGET_CAPACITY_PER_DAY) * 100),
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Card 2: Planned Hours */}
          <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-medium">Planned Today</span>
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                {totalPlannedHours.toFixed(1)}h
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">
                across {tasks.length} task{tasks.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="mt-3 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-purple-500" />
              <span>Target: {TARGET_CAPACITY_PER_DAY.toFixed(1)}h per day</span>
            </p>
          </div>

          {/* Card 3: Remaining Capacity */}
          <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-medium">Remaining Capacity</span>
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                {remainingHours.toFixed(1)}h
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">
                open
              </span>
            </div>
            <p className="mt-3 text-[11px] text-slate-500 dark:text-zinc-400">
              {remainingHours === 0
                ? "Daily capacity fully logged!"
                : `${remainingHours.toFixed(1)}h left to complete day`}
            </p>
          </div>

          {/* Card 4: Task Progress */}
          <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-medium">Completed Tasks</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                {completedCount}
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">
                / {tasks.length} ({completionPercentage}%)
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
              <div
                className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. FILTER TABS & TASK COUNT */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-200/80 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-1.5">
            {(
              [
                { key: "ALL", label: "All", count: tasks.length },
                { key: "IN_PROGRESS", label: "In Progress", count: inProgressCount },
                { key: "TODO", label: "To Do", count: todoCount },
                { key: "DONE", label: "Completed", count: completedCount },
              ] as { key: StatusFilter; label: string; count: number }[]
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    statusFilter === tab.key
                      ? "bg-slate-700 text-white dark:bg-zinc-300 dark:text-zinc-900"
                      : "bg-slate-200/80 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </span>
        </div>

        {/* 5. TASK LIST CONTENT */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 w-full rounded-xl border border-zinc-200/80 bg-white p-4 animate-pulse dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-900/60 dark:bg-red-950/20">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mb-2" />
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-300">
              Failed to load today&apos;s tasks
            </h3>
            <p className="text-xs text-red-700 dark:text-red-400 mt-1 max-w-sm">
              {error instanceof Error ? error.message : "An unexpected error occurred."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 mb-3">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              {searchQuery.trim()
                ? "No matching tasks found"
                : "No tasks planned for today"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs">
              {searchQuery.trim()
                ? "Try searching with a different term or clear the filter."
                : "Add a task scheduled for today to start tracking your time and progress."}
            </p>
            {!searchQuery.trim() && (
              <button
                type="button"
                onClick={handleOpenNewTask}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Task for Today</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTasks.map((task) => {
              const taskId = task.id || task._id || "";
              const priority =
                PRIORITY_STYLES[task.priority as string] || PRIORITY_STYLES.MEDIUM;
              const est = Number(task.estimatedHours ?? task.hours ?? 0);
              const act = Number(task.loggedHours ?? task.actualHours ?? 0);
              const isDone = task.status === "DONE";
              const isInProgress = task.status === "IN_PROGRESS";
              const taskProgressPercent = est > 0 ? Math.min(Math.round((act / est) * 100), 100) : 0;

              return (
                <div
                  key={taskId}
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 shadow-2xs transition-all ${
                    isDone
                      ? "border-emerald-200/80 bg-emerald-50/15 dark:border-emerald-900/40 dark:bg-emerald-950/10"
                      : "border-zinc-200/80 bg-white hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-700"
                  }`}
                >
                  {/* Left: Status toggle, Code, Category, Title */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(task)}
                      title={`Click to mark ${
                        isDone
                          ? "TODO"
                          : isInProgress
                            ? "DONE"
                            : "IN PROGRESS"
                      }`}
                      className="mt-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : isInProgress ? (
                        <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300 dark:text-zinc-600 hover:text-blue-500" />
                      )}
                    </button>

                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-semibold text-slate-500 dark:text-zinc-400 tracking-tight">
                          {task.code || "TASK"}
                        </span>

                        {task.category && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {task.category}
                          </span>
                        )}

                        <span
                          className={`rounded border px-1.5 py-0.2 text-[10px] font-medium ${priority.className}`}
                        >
                          {priority.label}
                        </span>

                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                            isDone
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : isInProgress
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {task.status || "TODO"}
                        </span>
                      </div>

                      <h3
                        className={`text-sm font-semibold truncate ${
                          isDone
                            ? "text-slate-400 line-through dark:text-zinc-500"
                            : "text-slate-900 dark:text-zinc-100"
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Hours breakdown, Progress bar, Actions */}
                  <div className="flex items-center gap-4 shrink-0 sm:self-center justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                    <div className="flex flex-col items-end gap-1 min-w-[90px]">
                      <div className="flex items-baseline gap-1 text-xs">
                        <span className="font-bold text-slate-900 dark:text-zinc-100">
                          {act.toFixed(1)}h
                        </span>
                        <span className="text-slate-400 dark:text-zinc-500 text-[11px]">
                          / {est.toFixed(1)}h
                        </span>
                      </div>
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                        <div
                          className={`h-full transition-all duration-300 ${
                            act > est && est > 0
                              ? "bg-amber-500"
                              : "bg-blue-600 dark:bg-blue-500"
                          }`}
                          style={{ width: `${taskProgressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <TaskTimerControls
                        task={task}
                        onSaveTime={handleSaveTrackedTime}
                      />

                      {!isDone && (
                        <button
                          type="button"
                          onClick={() => handleOpenLogTime(task)}
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Manual log time on this task"
                        >
                          <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span className="hidden md:inline">Log</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEditTask(task)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-blue-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Edit task"
                        aria-label="Edit task"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(taskId)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete task"
                        aria-label="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 6. MODALS */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => {
          setIsNewTaskModalOpen(false);
          setSelectedTask(null);
        }}
        defaultDayIndex={todayDayIndex}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
        mode={modalMode}
        initialTask={selectedTask}
      />

      <LogTimeModal
        isOpen={isLogTimeModalOpen}
        onClose={() => {
          setIsLogTimeModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmitLog={handleSubmitLog}
        taskTitle={selectedTask?.title || "Today's Task"}
        taskCode={selectedTask?.code || undefined}
      />
    </div>
  );
}
