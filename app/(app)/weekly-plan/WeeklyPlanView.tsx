"use client";

import React, { useState, useMemo } from "react";
import {
  formatDateForUrl,
  addDays,
  addWeeks,
  formatWeekRange,
} from "@/app/lib/dateUtils";

import { Task, DayInfo, DayStats } from "./components/types";
import {
  INITIAL_TASKS,
  DAY_NAMES,
  TARGET_CAPACITY_PER_DAY,
  TARGET_SPRINT_HOURS,
} from "./components/mockData";
import { TopAppBar } from "./components/TopAppBar";
import { WeekHeader } from "./components/WeekHeader";
import { CapacityBanner } from "./components/CapacityBanner";
import { DayColumn } from "./components/DayColumn";
import { BacklogSection } from "./components/BacklogSection";
import { NewTaskModal } from "./components/NewTaskModal";
import { LogTimeModal } from "./components/LogTimeModal";

interface WeeklyPlanViewProps {
  initialMondayDate: string; // "YYYY-MM-DD"
}

export function WeeklyPlanView({ initialMondayDate }: WeeklyPlanViewProps) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);
  const [isBacklogExpanded, setIsBacklogExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isLogTimeModalOpen, setIsLogTimeModalOpen] = useState(false);
  const [targetColumnForNewTask, setTargetColumnForNewTask] = useState<number>(2);

  // Parse current week dates
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

  // Check if today is in this week
  const todayIndex = useMemo(() => {
    const today = new Date();
    const todayStr = formatDateForUrl(today);
    return daysInfo.findIndex((d) => d.formatted === todayStr);
  }, [daysInfo]);

  // Active "Today" indicator (default to Wednesday index 2 if outside current week)
  const activeTodayIndex = todayIndex !== -1 ? todayIndex : 2;

  // Filter tasks based on live search
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  // Calculate day metrics
  const dayStats: DayStats[] = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const dayTasks = tasks.filter((t) => t.dayIndex === i);
      const totalHours = dayTasks.reduce((sum, t) => sum + t.hours, 0);
      const isOver = totalHours > TARGET_CAPACITY_PER_DAY;
      const isUnder = totalHours < TARGET_CAPACITY_PER_DAY;
      const diff = totalHours - TARGET_CAPACITY_PER_DAY;
      const isDone = dayTasks.length > 0 && dayTasks.every((t) => t.status === "DONE");

      let statusLabel = "Balanced";
      if (i === activeTodayIndex) {
        statusLabel = "Today";
      } else if (i === 3) {
        statusLabel = "Capacity";
      } else if (i === 4) {
        statusLabel = "Buffer";
      }

      return {
        totalHours,
        isOver,
        isUnder,
        diff,
        isDone,
        statusLabel,
      };
    });
  }, [tasks, activeTodayIndex]);

  // Overall sprint capacity
  const totalPlannedHours = useMemo(() => {
    return tasks
      .filter((t) => t.dayIndex >= 0 && t.dayIndex < 5)
      .reduce((sum, t) => sum + t.hours, 0);
  }, [tasks]);

  const sprintPercentage = Math.min(
    Math.round((totalPlannedHours / TARGET_SPRINT_HOURS) * 100),
    100
  );
  const sprintBuffer = Math.max(0, TARGET_SPRINT_HOURS - totalPlannedHours);

  // Actions
  const handleRescheduleFE157 = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.code === "FE-157" ? { ...t, dayIndex: 3, quickAction: undefined } : t
      )
    );
    setIsWarningDismissed(true);
  };

  const handlePlaceIntoFriday = () => {
    setTasks((prev) =>
      prev.map((t) => (t.code === "BUG-086" ? { ...t, dayIndex: 4 } : t))
    );
  };

  const handleAddToPlan = (taskId: string) => {
    let targetDay = 3;
    const openDay = dayStats.findIndex((d) => d.totalHours < TARGET_CAPACITY_PER_DAY);
    if (openDay !== -1) targetDay = openDay;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dayIndex: targetDay } : t))
    );
  };

  const handleCycleStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus =
          t.status === "TODO"
            ? "IN_PROGRESS"
            : t.status === "IN_PROGRESS"
            ? "DONE"
            : "TODO";
        return { ...t, status: nextStatus };
      })
    );
  };

  const handleCreateTask = (taskData: Omit<Task, "id">) => {
    const newTask: Task = {
      ...taskData,
      id: `t-${Date.now()}`,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleLogTime = (hours: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === "t-7"
          ? { ...t, loggedHours: (t.loggedHours || 0) + hours }
          : t
      )
    );
  };

  // Week navigation URLs
  const prevWeekMonday = formatDateForUrl(addWeeks(mondayDate, -1));
  const nextWeekMonday = formatDateForUrl(addWeeks(mondayDate, 1));
  const weekRangeDisplay = formatWeekRange(mondayDate);

  const backlogTasks = filteredTasks.filter((t) => t.dayIndex === -1);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 transition-colors">
      {/* 1. TOP APP BAR */}
      <TopAppBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenLogTime={() => setIsLogTimeModalOpen(true)}
        onOpenNewTask={() => {
          setTargetColumnForNewTask(activeTodayIndex);
          setIsNewTaskModalOpen(true);
        }}
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
          onDuplicateLastWeek={() =>
            alert("Previous week tasks duplicated into plan.")
          }
          onOpenNewTask={() => {
            setTargetColumnForNewTask(activeTodayIndex);
            setIsNewTaskModalOpen(true);
          }}
        />

        {/* 3. CAPACITY OVERLOAD WARNING BANNER */}
        <CapacityBanner
          isDismissed={isWarningDismissed}
          onDismiss={() => setIsWarningDismissed(true)}
          onReschedule={handleRescheduleFE157}
        />

        {/* 4. 5-DAY WEEKLY GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {daysInfo.map((day) => (
            <DayColumn
              key={day.index}
              day={day}
              stats={dayStats[day.index]}
              tasks={filteredTasks.filter((t) => t.dayIndex === day.index)}
              isToday={day.index === activeTodayIndex}
              onCycleStatus={handleCycleStatus}
              onLogTime={() => setIsLogTimeModalOpen(true)}
              onRescheduleFE157={handleRescheduleFE157}
              onOpenSlotClick={(dayIdx) => {
                setTargetColumnForNewTask(dayIdx);
                setIsNewTaskModalOpen(true);
              }}
            />
          ))}
        </div>

        {/* 5. UNSCHEDULED & BACKLOG CARRY-OVER */}
        <BacklogSection
          tasks={backlogTasks}
          isExpanded={isBacklogExpanded}
          onToggleExpanded={() => setIsBacklogExpanded(!isBacklogExpanded)}
          onOpenNewBacklogItem={() => {
            setTargetColumnForNewTask(-1);
            setIsNewTaskModalOpen(true);
          }}
          onAddToPlan={handleAddToPlan}
          onPlaceIntoFriday={handlePlaceIntoFriday}
        />
      </div>

      {/* MODALS */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        defaultDayIndex={targetColumnForNewTask}
        onCreateTask={handleCreateTask}
      />

      <LogTimeModal
        isOpen={isLogTimeModalOpen}
        onClose={() => setIsLogTimeModalOpen(false)}
        onSubmitLog={handleLogTime}
      />
    </div>
  );
}
