"use client";

import React, { useMemo, useState } from "react";
import {
  formatDateForUrl,
  addDays,
  addWeeks,
  formatWeekRange,
} from "@/lib/dateUtils";

import { Task, DayInfo, CreateTaskInput } from "./components/types";
import {
  DAY_NAMES,
  TARGET_SPRINT_HOURS,
} from "./components/mockData";
import { useWeeklyPlanStore } from "@/lib/stores/weeklyPlanStore";

import { TopAppBar } from "./components/TopAppBar";
import { WeekHeader } from "./components/WeekHeader";
import { DayColumn } from "./components/DayColumn";
import { BacklogSection } from "./components/BacklogSection";
import { NewTaskModal } from "./components/NewTaskModal";
import { LogTimeModal } from "./components/LogTimeModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, getWeekTasks, updateTask } from "@/lib/services/task-service";

interface WeeklyPlanViewProps {
  initialMondayDate: string; // "YYYY-MM-DD"
}

export function WeeklyPlanView({ initialMondayDate }: WeeklyPlanViewProps) {
  // Client UI state via Zustand
  const queryClient = useQueryClient();
  const {
    searchQuery,
    setSearchQuery,
    isNewTaskModalOpen,
    setIsNewTaskModalOpen,
    targetDayIndex,
    setTargetDayIndex,
    isBacklogExpanded,
    toggleBacklogExpanded,
  } = useWeeklyPlanStore();

  const [isLogTimeModalOpen, setIsLogTimeModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Parse current week dates (Monday to Friday: 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri)
  const mondayDate = useMemo(() => {
    const parts = initialMondayDate.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }, [initialMondayDate]);

  const daysInfo: DayInfo[] = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = addDays(mondayDate, i);
      return {
        index: i,
        dayName: DAY_NAMES[i],
        dayNumber: d.getDate(),
        fullDate: d,
        formatted: formatDateForUrl(d),
      };
    });
  }, [mondayDate]);

  // Check if today falls in this week
  const todayIndex = useMemo(() => {
    const today = new Date();
    const todayStr = formatDateForUrl(today);
    return daysInfo.findIndex((d) => d.formatted === todayStr);
  }, [daysInfo]);

  const activeTodayIndex = todayIndex !== -1 ? todayIndex : 2;

  // Server state: Fetch tasks for current week
  const { data: rawTasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks", initialMondayDate],
    queryFn: () => getWeekTasks(initialMondayDate),
  });

  // Ensure tasks have consistent id and array shape
  const tasks: Task[] = useMemo(() => {
    const list = Array.isArray(rawTasks)
      ? rawTasks
      : (rawTasks as any)?.data ?? (rawTasks as any)?.tasks ?? [];
    return list.map((t: any) => ({
      ...t,
      id: t.id || t._id,
    }));
  }, [rawTasks]);

  // Filter tasks based on live search
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    if (!searchQuery.trim()) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query) ||
        t.code?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  // Overall sprint capacity
  const totalPlannedHours = useMemo(() => {
    return filteredTasks
      .filter((t) => Number(t.dayIndex) >= 0 && Number(t.dayIndex) < 5)
      .reduce((sum, t) => sum + (t.estimatedHours ?? t.hours ?? 0), 0);
  }, [filteredTasks]);

  const sprintPercentage = Math.min(
    Math.round((totalPlannedHours / TARGET_SPRINT_HOURS) * 100),
    100,
  );
  const sprintBuffer = Math.max(0, TARGET_SPRINT_HOURS - totalPlannedHours);

  // Week navigation URLs
  const prevWeekMonday = formatDateForUrl(addWeeks(mondayDate, -1));
  const nextWeekMonday = formatDateForUrl(addWeeks(mondayDate, 1));
  const weekRangeDisplay = formatWeekRange(mondayDate);

  // Backlog tasks (dayIndex === -1)
  const backlogTasks = useMemo(() => {
    return filteredTasks.filter((t) => Number(t.dayIndex) === -1);
  }, [filteredTasks]);

  // Handlers for TanStack Query mutations
  const handleCycleStatus = (_taskId: string) => {
    // Optional: Wire with task status update mutation
  };

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleCreateTask = (taskData: CreateTaskInput) => {
    createTaskMutation.mutate(taskData);
  };

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleUpdateTask = (taskData: Task) => {
    updateTaskMutation.mutate(taskData);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTargetDayIndex(task.dayIndex !== undefined ? task.dayIndex : activeTodayIndex);
    setIsNewTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    console.log("Delete requested for task:", taskId);
  };

  const handleOpenNewTask = (dayIdx: number) => {
    setEditingTask(null);
    setTargetDayIndex(dayIdx);
    setIsNewTaskModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsNewTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleLogTime = (_hours: number) => {
    // Optional: Wire with log time mutation
  };

  const handleAddToPlan = (_taskId: string) => {
    // Optional: Wire with add to plan mutation
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 transition-colors">
      {/* 1. TOP APP BAR */}
      <TopAppBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenLogTime={() => setIsLogTimeModalOpen(true)}
        onOpenNewTask={() => handleOpenNewTask(activeTodayIndex)}
        totalPlannedHours={totalPlannedHours}
      />

      <div className="flex flex-col gap-5 p-6 md:p-8">
        {/* 2. WEEK CONTROLLER & SPRINT STATS */}
        <WeekHeader
          prevWeekMonday={prevWeekMonday}
          nextWeekMonday={nextWeekMonday}
          weekRangeDisplay={weekRangeDisplay}
          totalPlannedHours={totalPlannedHours}
          targetSprintHours={TARGET_SPRINT_HOURS}
          sprintPercentage={sprintPercentage}
          sprintBuffer={sprintBuffer}
          onDuplicateLastWeek={() => {}}
          onOpenNewTask={() => handleOpenNewTask(activeTodayIndex)}
        />

        {/* 3. 5-DAY WEEKLY GRID (0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {daysInfo.map((day) => {
            const dayTasks = filteredTasks.filter(
              (t) => Number(t.dayIndex) === day.index
            );
            return (
              <DayColumn
                key={day.index}
                day={day}
                tasks={dayTasks}
                isToday={day.index === activeTodayIndex}
                onCycleStatus={handleCycleStatus}
                onLogTime={() => setIsLogTimeModalOpen(true)}
                onAddTask={handleOpenNewTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            );
          })}
        </div>

        {/* 4. UNSCHEDULED & BACKLOG CARRY-OVER */}
        <BacklogSection
          tasks={backlogTasks}
          isExpanded={isBacklogExpanded}
          onToggleExpanded={toggleBacklogExpanded}
          onOpenNewBacklogItem={() => handleOpenNewTask(-1)}
          onAddToPlan={handleAddToPlan}
          onPlaceIntoFriday={() => {}}
        />
      </div>

      {/* MODALS */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={handleCloseModal}
        defaultDayIndex={targetDayIndex}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
        initialTask={editingTask}
        mode={editingTask ? "update" : "create"}
        daysInfo={daysInfo}
      />

      <LogTimeModal
        isOpen={isLogTimeModalOpen}
        onClose={() => setIsLogTimeModalOpen(false)}
        onSubmitLog={handleLogTime}
      />
    </div>
  );
}
