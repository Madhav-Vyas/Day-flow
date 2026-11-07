"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  CalendarDays,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  FileText,
  BarChart3,
  CheckCircle2,
  Clock,
  Briefcase,
  ListTodo,
  TrendingUp,
  FolderGit2,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getWeeklyReport,
  WeeklyReportData,
} from "@/lib/services/report-service";
import { getMonday, formatDateForUrl } from "@/lib/dateUtils";

function formatHoursToReadable(decimalHours: number): string {
  const totalMinutes = Math.round((decimalHours || 0) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0 && minutes === 0) return "0m";
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export default function WeeklyReportPage() {
  // Current Monday as the initial week selection
  const [selectedWeek, setSelectedWeek] = useState<string>(() =>
    formatDateForUrl(getMonday()),
  );

  const [recipientGreeting, setRecipientGreeting] =
    useState<string>("Hi Team,");
  const [copiedType, setCopiedType] = useState<"html" | "text" | null>(null);

  // Fetch weekly report from backend API
  const { data: reportData, isLoading } = useQuery<WeeklyReportData>({
    queryKey: ["weekly-report", selectedWeek],
    queryFn: () => getWeeklyReport(selectedWeek),
  });

  // Safe fallback default if data is loading or empty
  const report = useMemo<WeeklyReportData>(() => {
    if (reportData) return reportData;

    const [mY, mM, mD] = selectedWeek.split("-").map(Number);
    const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const fallbackDays = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(Date.UTC(mY, mM - 1, mD + i));
      const dateStr = d.toISOString().split("T")[0];
      return {
        date: dateStr,
        dayName: DAY_NAMES[i],
        dayNumber: d.getUTCDate(),
        dayLabel: d.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        }),
        totalHours: 0,
        tasks: [],
      };
    });

    return {
      week: selectedWeek,
      startStr: selectedWeek,
      endStr: dayjs(selectedWeek).add(6, "day").format("YYYY-MM-DD"),
      weekRangeLabel: `${dayjs(selectedWeek).format("MMM D, YYYY")} – ${dayjs(selectedWeek).add(6, "day").format("MMM D, YYYY")}`,
      totalLoggedHours: 0,
      totalEstimatedHours: 0,
      targetHours: 40.0,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      completionRate: 0,
      byDay: fallbackDays,
      byCategory: [],
      tasks: [],
    };
  }, [reportData, selectedWeek]);

  // Week navigation
  const handlePrevWeek = () => {
    const prev = dayjs(selectedWeek).subtract(1, "week").toDate();
    setSelectedWeek(formatDateForUrl(getMonday(prev)));
  };

  const handleNextWeek = () => {
    const next = dayjs(selectedWeek).add(1, "week").toDate();
    setSelectedWeek(formatDateForUrl(getMonday(next)));
  };

  const handleJumpToCurrentWeek = () => {
    setSelectedWeek(formatDateForUrl(getMonday()));
  };

  const handleJumpToLastWeek = () => {
    const last = dayjs(getMonday()).subtract(1, "week").toDate();
    setSelectedWeek(formatDateForUrl(getMonday(last)));
  };

  const isCurrentWeek = useMemo(() => {
    return selectedWeek === formatDateForUrl(getMonday());
  }, [selectedWeek]);

  const emailSubject = `[Weekly Report] Sprint & Work Summary — ${report.weekRangeLabel}`;

  // Find the busiest day
  const busiestDay = useMemo(() => {
    if (!report.byDay.length) return null;
    return [...report.byDay].sort((a, b) => b.totalHours - a.totalHours)[0];
  }, [report.byDay]);

  // Capacity calculations (against 40h standard week)
  const capacityPct = useMemo(() => {
    if (!report.targetHours) return 0;
    return Math.min(
      100,
      Math.round((report.totalLoggedHours / report.targetHours) * 100),
    );
  }, [report.totalLoggedHours, report.targetHours]);

  // Plain Text Version (Slack / Teams / Text email)
  const plainTextEmail = useMemo(() => {
    const lines = [
      emailSubject,
      "",
      recipientGreeting,
      "",
      `Here is my weekly work summary for ${report.weekRangeLabel}:`,
      "",
      "======================================================================",
      "WEEKLY OVERVIEW",
      "======================================================================",
      `Total Hours Logged : ${report.totalLoggedHours.toFixed(2)}h / ${report.targetHours}h (${capacityPct}% capacity)`,
      `Tasks Completed    : ${report.completedTasks} / ${report.totalTasks} (${report.completionRate}% completion)`,
      "",
      "----------------------------------------------------------------------",
      "DAILY CAPACITY BREAKDOWN",
      "----------------------------------------------------------------------",
    ];

    report.byDay.forEach((day) => {
      const dayPct = Math.round((day.totalHours / 8.0) * 100);
      lines.push(
        `${day.dayName} (${day.date}): ${day.totalHours.toFixed(2)}h logged (${dayPct}% of 8h) — ${day.tasks.length} task(s)`,
      );
    });

    if (report.byCategory.length > 0) {
      lines.push("");
      lines.push(
        "----------------------------------------------------------------------",
      );
      lines.push("HOURS BY CATEGORY");
      lines.push(
        "----------------------------------------------------------------------",
      );
      report.byCategory.forEach((cat) => {
        lines.push(
          `- ${cat.category.padEnd(16, " ")}: ${cat.totalHours.toFixed(2)}h (${cat.percentage}%, ${cat.count} tasks)`,
        );
      });
    }

    lines.push("");
    lines.push(
      "----------------------------------------------------------------------",
    );
    lines.push("TASK DETAILS");
    lines.push(
      "----------------------------------------------------------------------",
    );

    if (report.tasks.length === 0) {
      lines.push("  No tasks recorded for this week.");
    } else {
      report.byDay.forEach((day) => {
        if (day.tasks.length > 0) {
          lines.push(`\n[${day.dayLabel}]`);
          day.tasks.forEach((t) => {
            lines.push(
              `  * [${t.code}] ${t.title} (${t.spentHours.toFixed(2)}h) [${t.status}] - ${t.category}`,
            );
            if (t.notes) {
              lines.push(`    Notes: ${t.notes}`);
            }
          });
        }
      });
    }

    lines.push("");
    lines.push("======================================================================");
    lines.push(
      `TOTAL HOURS: ${report.totalLoggedHours.toFixed(2)} hrs (${formatHoursToReadable(report.totalLoggedHours)})`,
    );
    lines.push("Best regards,");
    lines.push("DayFlow Workspace");

    return lines.join("\n");
  }, [emailSubject, recipientGreeting, report, capacityPct]);

  // Rich HTML Email for Gmail / Outlook
  const richHtmlEmail = useMemo(() => {
    // Generate category badges HTML
    const categoryRows = report.byCategory
      .map(
        (cat) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; font-size: 12px; color: #1e293b; font-weight: 600;">${cat.category}</td>
          <td style="padding: 8px 12px; font-size: 12px; color: #475569; text-align: center;">${cat.count}</td>
          <td style="padding: 8px 12px; font-size: 12px; color: #2563eb; font-weight: 700; text-align: right;">${cat.totalHours.toFixed(2)}h (${cat.percentage}%)</td>
        </tr>`,
      )
      .join("");

    // Generate daily breakdown rows
    const dayRows = report.byDay
      .map((day) => {
        const dayTasksHtml =
          day.tasks.length > 0
            ? day.tasks
                .map(
                  (t) => `
                <div style="margin-bottom: 6px; font-size: 12px; line-height: 1.4;">
                  <strong style="color: #2563eb;">[${t.code}]</strong> ${t.title} 
                  <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 10px; color: #475569; margin-left: 4px;">${t.category}</span>
                  <span style="color: ${t.status === "DONE" ? "#059669" : "#d97706"}; font-weight: 600; font-size: 11px; margin-left: 4px;">(${t.status})</span>
                  <span style="font-weight: 700; color: #0f172a; float: right;">${formatHoursToReadable(t.spentHours)}</span>
                  ${t.notes ? `<div style="color: #64748b; font-size: 11px; margin-top: 2px; padding-left: 8px;">↳ ${t.notes}</div>` : ""}
                </div>`,
                )
                .join("")
            : `<span style="color: #94a3b8; font-style: italic; font-size: 12px;">No logged tasks</span>`;

        return `
          <tr style="border-bottom: 1px solid #cbd5e1; vertical-align: top;">
            <td style="padding: 12px; font-size: 12px; font-weight: 700; color: #0f172a; width: 140px; background-color: #f8fafc;">
              ${day.dayLabel}
              <div style="font-size: 11px; color: #2563eb; font-weight: 600; margin-top: 4px;">
                ${day.totalHours.toFixed(2)}h logged
              </div>
            </td>
            <td style="padding: 12px; font-size: 12px;">
              ${dayTasksHtml}
            </td>
          </tr>
        `;
      })
      .join("");

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.5; max-width: 680px;">
        <p style="margin-bottom: 8px; font-size: 14px;">${recipientGreeting}</p>
        <p style="margin-bottom: 16px; font-size: 14px;">Here is my weekly work summary for <strong>${report.weekRangeLabel}</strong>:</p>

        <!-- KPI SUMMARY BOX -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 14px 18px; border-right: 1px solid #e2e8f0; width: 50%;">
              <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px;">Weekly Hours Logged</div>
              <div style="font-size: 20px; font-weight: 800; color: #2563eb; margin-top: 4px;">
                ${report.totalLoggedHours.toFixed(2)}h <span style="font-size: 13px; font-weight: 500; color: #64748b;">/ ${report.targetHours}h (${capacityPct}%)</span>
              </div>
            </td>
            <td style="padding: 14px 18px; width: 50%;">
              <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px;">Tasks Completed</div>
              <div style="font-size: 20px; font-weight: 800; color: #059669; margin-top: 4px;">
                ${report.completedTasks} <span style="font-size: 13px; font-weight: 500; color: #64748b;">of ${report.totalTasks} (${report.completionRate}%)</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- CATEGORY DISTRIBUTION TABLE -->
        ${
          report.byCategory.length > 0
            ? `
        <h4 style="margin: 16px 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Time by Category</h4>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; margin-bottom: 20px; border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left;">
              <th style="padding: 8px 12px; font-size: 11px; color: #475569; text-transform: uppercase;">Category</th>
              <th style="padding: 8px 12px; font-size: 11px; color: #475569; text-transform: uppercase; text-align: center;">Tasks</th>
              <th style="padding: 8px 12px; font-size: 11px; color: #475569; text-transform: uppercase; text-align: right;">Time Spent</th>
            </tr>
          </thead>
          <tbody>
            ${categoryRows}
          </tbody>
        </table>
        `
            : ""
        }

        <!-- DAY-BY-DAY BREAKDOWN -->
        <h4 style="margin: 16px 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Daily Work Breakdown</h4>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #475569;">Workday</th>
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #475569;">Tasks & Accomplishments</th>
            </tr>
          </thead>
          <tbody>
            ${dayRows}
          </tbody>
        </table>

        <p style="font-size: 13px; color: #64748b; margin-top: 18px;">Best regards,<br><strong>DayFlow Workspace</strong></p>
      </div>
    `;
  }, [recipientGreeting, report, capacityPct]);

  // Copy HTML to Clipboard
  const handleCopyRichHtml = async () => {
    try {
      if (
        typeof window !== "undefined" &&
        navigator.clipboard &&
        window.ClipboardItem
      ) {
        const textBlob = new Blob([plainTextEmail], { type: "text/plain" });
        const htmlBlob = new Blob([richHtmlEmail], { type: "text/html" });
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": textBlob,
            "text/html": htmlBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plainTextEmail);
      }
      setCopiedType("html");
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.error("Failed to copy rich HTML:", err);
      await navigator.clipboard.writeText(plainTextEmail);
      setCopiedType("html");
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  // Copy Plain Text to Clipboard
  const handleCopyPlainText = async () => {
    try {
      await navigator.clipboard.writeText(plainTextEmail);
      setCopiedType("text");
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.error("Failed to copy plain text:", err);
    }
  };

  // Mailto Link
  const mailtoLink = useMemo(() => {
    const encodedSubject = encodeURIComponent(emailSubject);
    const encodedBody = encodeURIComponent(plainTextEmail);
    return `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
  }, [emailSubject, plainTextEmail]);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 transition-colors">
      {/* 1. TOP HEADER / BREADCRUMBS */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-200/80 bg-white/95 px-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <span>DayFlow</span>
            <span>&gt;</span>
            <span>Reports</span>
            <span>&gt;</span>
            <span className="text-slate-800 dark:text-zinc-200 font-semibold">
              Weekly Summary
            </span>
          </div>
        </div>

        {/* Navigation Tabs between Daily and Weekly Reports */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg">
          <Link
            href="/reports/daily"
            className="rounded-md px-3 py-1 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors"
          >
            Daily Report
          </Link>
          <Link
            href="/reports/weekly"
            className="rounded-md bg-white dark:bg-zinc-800 px-3 py-1 text-xs font-semibold text-slate-900 dark:text-zinc-100 shadow-2xs"
          >
            Weekly Summary
          </Link>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Title & Quick High-Level Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Weekly Timesheet & Report
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Review sprint accomplishments, 40-hour capacity utilization, and
              export formatted weekly summaries.
            </p>
          </div>

          {/* Week Status Indicator */}
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-950 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300 animate-pulse">
                Updating...
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-zinc-300">
              <CalendarCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>{report.weekRangeLabel}</span>
            </span>
            {isCurrentWeek && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                Current Week
              </span>
            )}
          </div>
        </div>

        {/* 3. INTERACTIVE WEEK SELECTOR TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-zinc-200/90 bg-white p-3.5 px-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 mr-1">
              <CalendarDays className="h-4 w-4 text-violet-600" />
              <span>Select Week:</span>
            </span>

            {/* Previous / Next Week Steppers */}
            <div className="flex items-center rounded-lg border border-zinc-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60 p-0.5">
              <button
                type="button"
                onClick={handlePrevWeek}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-white dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextWeek}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-white dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Direct date picker snapping to ISO Monday */}
            <div className="relative flex items-center">
              <input
                type="date"
                value={selectedWeek}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedWeek(formatDateForUrl(getMonday(e.target.value)));
                  }
                }}
                className="h-9 rounded-xl border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 focus:border-violet-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 cursor-pointer shadow-2xs"
              />
            </div>

            {/* Quick jump pills */}
            <div className="flex items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={handleJumpToCurrentWeek}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  isCurrentWeek
                    ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                This Week
              </button>
              <button
                type="button"
                onClick={handleJumpToLastWeek}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  selectedWeek ===
                  formatDateForUrl(
                    dayjs(getMonday()).subtract(1, "week").toDate(),
                  )
                    ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                Last Week
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              {report.totalLoggedHours.toFixed(1)} hrs logged
            </span>
            <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
              {capacityPct}% capacity
            </span>
          </div>
        </div>

        {/* 4. KPI METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Logged vs 40h Goal */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/90 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Weekly Hours
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                  {report.totalLoggedHours.toFixed(1)}h
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  / {report.targetHours}h target
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    capacityPct >= 100
                      ? "bg-emerald-500"
                      : capacityPct >= 75
                        ? "bg-blue-600"
                        : "bg-amber-500"
                  }`}
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
              <span>{capacityPct}% of sprint goal</span>
              <span>
                {report.totalLoggedHours >= report.targetHours
                  ? "Goal achieved!"
                  : `${(report.targetHours - report.totalLoggedHours).toFixed(1)}h remaining`}
              </span>
            </div>
          </div>

          {/* Card 2: Tasks Completed & Rate */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/90 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Completion Rate
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {report.completionRate}%
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  ({report.completedTasks}/{report.totalTasks} tasks)
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${report.completionRate}%` }}
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
              <span>{report.inProgressTasks} In Progress</span>
              <span>{report.todoTasks} To Do</span>
            </div>
          </div>

          {/* Card 3: Daily Average & Busiest Day */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/90 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Sprint Pace
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                  {(report.totalLoggedHours / 5).toFixed(1)}h
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  avg / workday
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-zinc-400 truncate">
                {busiestDay && busiestDay.totalHours > 0
                  ? `Peak: ${busiestDay.dayName} (${busiestDay.totalHours.toFixed(1)}h)`
                  : "Evenly distributed"}
              </p>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 dark:text-zinc-500">
              Estimated: {report.totalEstimatedHours.toFixed(1)}h
            </div>
          </div>

          {/* Card 4: Top Category / Primary Focus */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/90 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Top Focus Area
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900 dark:text-zinc-100 truncate">
                  {report.byCategory[0]?.category || "General"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                {report.byCategory[0]
                  ? `${report.byCategory[0].totalHours.toFixed(1)}h (${report.byCategory[0].percentage}% of total)`
                  : "No category logs"}
              </p>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 dark:text-zinc-500">
              {report.byCategory.length} active categories
            </div>
          </div>
        </div>

        {/* 5. 5-DAY CAPACITY BREAKDOWN (MON - FRI) */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-violet-600" />
                <span>Workday Capacity & Progress</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Daily hours logged against the 8.0-hour standard benchmark.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400">
              Standard: 8h / day
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {report.byDay.map((day) => {
              const dayPct = Math.min(100, Math.round((day.totalHours / 8.0) * 100));
              const isToday = day.date === dayjs().format("YYYY-MM-DD");

              return (
                <div
                  key={day.date}
                  className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all ${
                    isToday
                      ? "border-violet-500 bg-violet-50/20 dark:border-violet-600 dark:bg-violet-950/20 ring-1 ring-violet-500/30"
                      : "border-zinc-200/80 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        {day.dayName}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                        {day.date.slice(5)}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-baseline gap-1">
                      <span className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                        {day.totalHours.toFixed(1)}h
                      </span>
                      <span className="text-[11px] text-slate-400">/ 8h</span>
                    </div>

                    {/* Mini progress bar */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
                      <div
                        className={`h-full ${
                          dayPct >= 100
                            ? "bg-emerald-500"
                            : dayPct >= 50
                              ? "bg-violet-600"
                              : "bg-slate-400"
                        }`}
                        style={{ width: `${dayPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>{day.tasks.length} task{day.tasks.length === 1 ? "" : "s"}</span>
                    {day.totalHours > 8 ? (
                      <span className="text-amber-600 font-semibold text-[10px]">Overtime</span>
                    ) : day.totalHours === 8 ? (
                      <span className="text-emerald-600 font-semibold text-[10px]">Full</span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">{8 - day.totalHours > 0 ? `${(8 - day.totalHours).toFixed(1)}h open` : ""}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. TWO-COLUMN LAYOUT: CATEGORIES & EMAIL EXPORT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (4 Cols): Category Breakdown List */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/90 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <FolderGit2 className="h-3.5 w-3.5 text-violet-600" />
                  <span>Category Distribution</span>
                </span>
                <span className="text-xs text-slate-400">
                  {report.byCategory.length} categories
                </span>
              </div>

              {report.byCategory.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No categorized tasks recorded this week.
                </p>
              ) : (
                <div className="flex flex-col gap-3 pt-1">
                  {report.byCategory.map((cat) => (
                    <div key={cat.category} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">
                          {cat.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-zinc-100">
                            {cat.totalHours.toFixed(1)}h
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({cat.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                        <div
                          className="h-full bg-violet-600 rounded-full"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Tip Card */}
            <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 dark:border-violet-900/30 dark:bg-violet-950/20 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-zinc-300">
                <p className="font-bold text-slate-800 dark:text-zinc-100">
                  Ready for Weekly Standup?
                </p>
                <p className="mt-1 leading-relaxed">
                  Use the <strong>Copy Email</strong> button to send a clean
                  formatted table to your team or manager, or paste it directly
                  into Jira/Slack sprint retrospective threads.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (8 Cols): Formatted Weekly Email Report Preview */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-violet-600" />
                    <span>Formatted Weekly Report Preview</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Click copy to paste a clean HTML table directly into Gmail,
                    Outlook, or Slack.
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyRichHtml}
                    disabled={report.tasks.length === 0}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-semibold shadow-xs transition-all ${
                      report.tasks.length === 0
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500"
                        : "bg-violet-600 text-white hover:bg-violet-500 active:scale-95 cursor-pointer"
                    }`}
                    title="Copies a rich table formatted for Gmail/Outlook"
                  >
                    {copiedType === "html" ? (
                      <>
                        <Check className="h-4 w-4 text-white" />
                        <span>Copied Table!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Email (Table)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPlainText}
                    disabled={report.tasks.length === 0}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Copies plain text suitable for Slack/Teams"
                  >
                    {copiedType === "text" ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Copied Text</span>
                      </>
                    ) : (
                      <>
                        <ListTodo className="h-3.5 w-3.5 text-slate-500" />
                        <span>Plain Text</span>
                      </>
                    )}
                  </button>

                  <a
                    href={mailtoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Open draft in default desktop email app"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Open Mail</span>
                  </a>
                </div>
              </div>

              {/* Email Meta Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Subject Line
                  </label>
                  <div className="flex items-center rounded-xl border border-zinc-200 bg-slate-50/80 px-3 py-2 font-medium text-slate-800 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-200 truncate">
                    {emailSubject}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Greeting Line
                  </label>
                  <input
                    type="text"
                    value={recipientGreeting}
                    onChange={(e) => setRecipientGreeting(e.target.value)}
                    placeholder="e.g. Hi Team,"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-violet-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* The Live Email Table Container */}
              <div className="mt-2 rounded-xl border border-zinc-200 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60 overflow-x-auto">
                <div className="mb-3 text-xs font-medium text-slate-600 dark:text-zinc-400">
                  <p>{recipientGreeting}</p>
                  <p className="mt-1">
                    Here is my weekly work summary for{" "}
                    <strong>{report.weekRangeLabel}</strong>:
                  </p>
                </div>

                {report.tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 mb-2">
                      <Clock className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      No tasks logged for {report.weekRangeLabel}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 max-w-sm">
                      Tasks logged in your DayFlow Weekly Plan or Time Tracker
                      for this week will automatically show up here.
                    </p>
                    <Link
                      href="/weekly-plan"
                      className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                    >
                      <span>Open Weekly Plan</span>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Day-by-Day Section in the Preview Table */}
                    {report.byDay.map((day) => {
                      if (day.tasks.length === 0) return null;

                      return (
                        <div
                          key={day.date}
                          className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/70 overflow-hidden"
                        >
                          <div className="flex items-center justify-between bg-slate-100/70 px-3 py-2 text-xs font-bold text-slate-800 dark:bg-zinc-800/60 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800">
                            <span>{day.dayLabel}</span>
                            <span className="text-violet-600 dark:text-violet-400">
                              {day.totalHours.toFixed(1)}h logged
                            </span>
                          </div>

                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-2 px-3">Task</th>
                                <th className="py-2 px-3 text-center">Category</th>
                                <th className="py-2 px-3 text-center">Status</th>
                                <th className="py-2 px-3 text-right">Spent Time</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                              {day.tasks.map((task) => (
                                <tr
                                  key={task.id}
                                  className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                                >
                                  <td className="py-2.5 px-3 max-w-xs sm:max-w-md">
                                    <div className="font-semibold text-slate-900 dark:text-zinc-100">
                                      <span className="text-blue-600 dark:text-blue-400 font-bold mr-1.5">
                                        [{task.code}]
                                      </span>
                                      {task.title}
                                    </div>
                                    {task.notes && (
                                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                        {task.notes}
                                      </p>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                                      {task.category}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                        task.status === "DONE"
                                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                                      }`}
                                    >
                                      {task.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-slate-900 dark:text-zinc-100">
                                    {formatHoursToReadable(task.spentHours)}
                                    <span className="text-[11px] text-slate-400 ml-1 font-normal">
                                      ({task.spentHours.toFixed(2)}h)
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}

                    {/* Total Summary Footer */}
                    <div className="flex items-center justify-between rounded-lg bg-violet-50/70 p-3 text-xs font-bold text-slate-800 dark:bg-violet-950/40 dark:text-zinc-200 border border-violet-100 dark:border-violet-900/40">
                      <span>Total Time Logged for Week:</span>
                      <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400">
                        {formatHoursToReadable(report.totalLoggedHours)} ({report.totalLoggedHours.toFixed(2)}h)
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-[11px] text-slate-400 dark:text-zinc-500">
                  <p>Best regards,</p>
                  <p className="font-semibold text-slate-600 dark:text-zinc-400 mt-0.5">
                    DayFlow Workspace
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
