"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  Mail,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  FileText,
  CheckCircle2,
  ListTodo,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDailyReports } from "@/lib/services/report-service";
// Types for Daily Report
export interface DailyReportItem {
  id: string;
  code: string;
  title: string;
  category: string;
  status: "DONE" | "IN_PROGRESS" | "TODO";
  spentHours: number; // Decimal hours (e.g., 2.5)
  notes?: string;
}

export interface DayReportGroup {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Wednesday, Nov 11, 2026"
  isToday?: boolean;
  tasks: DailyReportItem[];
}

function formatHoursToReadable(decimalHours: number): string {
  const totalMinutes = Math.round(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0 && minutes === 0) return "0m";
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export default function DailyReportPage() {
  const { data: serverReports = [] } = useQuery<DayReportGroup[]>({
    queryKey: ["daily-reports"],
    queryFn: getDailyReports,
  });

  const [localReports, setLocalReports] = useState<DayReportGroup[] | null>(null);
  const reports = useMemo(() => {
    return localReports ?? serverReports;
  }, [localReports, serverReports]);

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    dayjs().format("YYYY-MM-DD"),
  );

  const setReports = (
    updater: (prev: DayReportGroup[]) => DayReportGroup[],
  ) => {
    setLocalReports((prev) => updater(prev ?? serverReports));
  };
  const [recipientGreeting, setRecipientGreeting] =
    useState<string>("Hi Team,");
  const [copiedType, setCopiedType] = useState<"html" | "text" | null>(null);

  // Quick manual task addition state for custom dates with no logs
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTaskCode, setNewTaskCode] = useState<string>("FE-199");
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskCategory, setNewTaskCategory] = useState<string>("Feature");
  const [newTaskHours, setNewTaskHours] = useState<number>(2.0);

  // Active selected day's report (resolves existing or generates fallback template)
  const activeReport = useMemo<DayReportGroup>(() => {
    const found = reports.find((r) => r.date === selectedDate);
    if (found) return found;

    return {
      date: selectedDate,
      dayLabel: dayjs(selectedDate).format("dddd, MMM D, YYYY"),
      tasks: [],
    };
  }, [reports, selectedDate]);

  // Total hours for active report
  const totalSpentHours = useMemo(() => {
    return activeReport.tasks.reduce((sum, t) => sum + (t.spentHours || 0), 0);
  }, [activeReport]);

  const emailSubject = `[Daily Report] Work Summary — ${activeReport.dayLabel}`;

  // Date navigation handlers
  const handlePrevDay = () => {
    const prev = dayjs(selectedDate).subtract(1, "day").format("YYYY-MM-DD");
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = dayjs(selectedDate).add(1, "day").format("YYYY-MM-DD");
    setSelectedDate(next);
  };

  const handleJumpToToday = () => {
    setSelectedDate(dayjs().format("YYYY-MM-DD"));
  };

  const handleJumpToYesterday = () => {
    setSelectedDate(dayjs().subtract(1, "day").format("YYYY-MM-DD"));
  };

  // Add custom task to current active day
  const handleAddTaskToDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: DailyReportItem = {
      id: `custom_${Date.now()}`,
      code: newTaskCode.trim() || "TASK",
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      status: "DONE",
      spentHours: Math.max(0.25, Number(newTaskHours) || 1.0),
    };

    setReports((prev) => {
      const existing = prev.find((r) => r.date === selectedDate);
      if (existing) {
        return prev.map((r) =>
          r.date === selectedDate ? { ...r, tasks: [...r.tasks, newTask] } : r,
        );
      }
      return [
        {
          date: selectedDate,
          dayLabel: dayjs(selectedDate).format("dddd, MMM D, YYYY"),
          tasks: [newTask],
        },
        ...prev,
      ];
    });

    setNewTaskTitle("");
    setShowAddForm(false);
  };

  // Delete task from day
  const handleDeleteTaskFromDay = (taskId: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.date === selectedDate) {
          return {
            ...r,
            tasks: r.tasks.filter((t) => t.id !== taskId),
          };
        }
        return r;
      }),
    );
  };

  // Generate plain text version (for Slack, Teams, or plain text email)
  const plainTextEmail = useMemo(() => {
    const lines = [
      emailSubject,
      "",
      recipientGreeting,
      "",
      `Here is my daily work summary for ${activeReport.dayLabel}:`,
      "",
      "----------------------------------------------------------------------",
      "TASK                          | CATEGORY    | SPENT TIME | STATUS",
      "----------------------------------------------------------------------",
    ];

    if (activeReport.tasks.length === 0) {
      lines.push("  No tasks logged for this day.");
    } else {
      activeReport.tasks.forEach((t) => {
        const taskStr = `[${t.code}] ${t.title}`.padEnd(29, " ").slice(0, 29);
        const catStr = t.category.padEnd(11, " ").slice(0, 11);
        const timeStr =
          `${t.spentHours.toFixed(2)}h (${formatHoursToReadable(t.spentHours)})`.padEnd(
            10,
            " ",
          );
        const statusStr = t.status;
        lines.push(`${taskStr} | ${catStr} | ${timeStr} | ${statusStr}`);
        if (t.notes) {
          lines.push(`   └ Notes: ${t.notes}`);
        }
      });
    }

    lines.push(
      "----------------------------------------------------------------------",
    );
    lines.push(
      `TOTAL TIME LOGGED: ${totalSpentHours.toFixed(2)} hrs (${formatHoursToReadable(totalSpentHours)})`,
    );
    lines.push("");
    lines.push("Best regards,");
    lines.push("DayFlow Workspace");

    return lines.join("\n");
  }, [emailSubject, recipientGreeting, activeReport, totalSpentHours]);

  // Generate rich HTML table that pastes cleanly into Gmail / Outlook / Apple Mail
  const richHtmlEmail = useMemo(() => {
    const rows =
      activeReport.tasks.length > 0
        ? activeReport.tasks
            .map(
              (t) => `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #1e293b;">
              <strong style="color: #2563eb;">[${t.code}]</strong> ${t.title}
              ${t.notes ? `<div style="font-size: 11px; color: #64748b; margin-top: 3px;"><em>Note:</em> ${t.notes}</div>` : ""}
            </td>
            <td style="padding: 10px 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #475569; text-align: center;">
              <span style="background-color: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-weight: 500;">${t.category}</span>
            </td>
            <td style="padding: 10px 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #059669; text-align: center; font-weight: 600;">
              ${t.status}
            </td>
            <td style="padding: 10px 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #0f172a; text-align: right; font-weight: 700;">
              ${formatHoursToReadable(t.spentHours)} <span style="font-size: 11px; color: #64748b; font-weight: 400;">(${t.spentHours.toFixed(2)}h)</span>
            </td>
          </tr>`,
            )
            .join("")
        : `
          <tr>
            <td colspan="4" style="padding: 24px; text-align: center; color: #64748b; font-size: 13px;">
              No tasks recorded for this workday.
            </td>
          </tr>
        `;

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.5; max-width: 650px;">
        <p style="margin-bottom: 12px; font-size: 14px;">${recipientGreeting}</p>
        <p style="margin-bottom: 16px; font-size: 14px;">Here is my daily work summary for <strong>${activeReport.dayLabel}</strong>:</p>
        
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left;">
              <th style="padding: 10px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Task</th>
              <th style="padding: 10px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; text-align: center;">Category</th>
              <th style="padding: 10px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; text-align: center;">Status</th>
              <th style="padding: 10px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; text-align: right;">Spent Time</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8fafc; border-top: 2px solid #cbd5e1;">
              <td colspan="3" style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right;">
                Total Time Logged:
              </td>
              <td style="padding: 12px 14px; font-size: 14px; font-weight: 800; color: #2563eb; text-align: right;">
                ${formatHoursToReadable(totalSpentHours)} <span style="font-size: 11px; color: #64748b; font-weight: 500;">(${totalSpentHours.toFixed(2)}h)</span>
              </td>
            </tr>
          </tfoot>
        </table>
        
        <p style="font-size: 13px; color: #64748b; margin-top: 16px;">Sent via DayFlow</p>
      </div>
    `;
  }, [recipientGreeting, activeReport, totalSpentHours]);

  // Dual clipboard copy handler (rich HTML + plain text fallback)
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

  const handleCopyPlainText = async () => {
    try {
      await navigator.clipboard.writeText(plainTextEmail);
      setCopiedType("text");
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.error("Failed to copy plain text:", err);
    }
  };

  // Mailto link for direct desktop email client opening
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
              Daily Report
            </span>
          </div>
        </div>

        {/* Navigation Tabs between Daily and Weekly Reports */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg">
          <Link
            href="/reports/daily"
            className="rounded-md bg-white dark:bg-zinc-800 px-3 py-1 text-xs font-semibold text-slate-900 dark:text-zinc-100 shadow-2xs"
          >
            Daily Report
          </Link>
          <Link
            href="/reports/weekly"
            className="rounded-md px-3 py-1 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors"
          >
            Weekly Summary
          </Link>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Title & Quick Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Mail className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Daily Work Reports
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Select any workday to preview and copy your formatted end-of-day
              email report.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-zinc-200/80 bg-white px-3.5 py-2 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/60">
              <span className="text-[10px] font-medium uppercase text-slate-400">
                Tasks for Day
              </span>
              <p className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                {activeReport.tasks.length}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200/80 bg-white px-3.5 py-2 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/60">
              <span className="text-[10px] font-medium uppercase text-slate-400">
                Logged Hours
              </span>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {totalSpentHours.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>

        {/* 3. INTERACTIVE DATE PICKER TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-zinc-200/90 bg-white p-3.5 px-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 mr-1">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <span>Select Workday:</span>
            </span>

            {/* Stepper buttons (< and >) */}
            <div className="flex items-center rounded-lg border border-zinc-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60 p-0.5">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-white dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextDay}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-white dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Native Date Picker Input */}
            <div className="relative flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                className="h-9 rounded-xl border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 cursor-pointer shadow-2xs"
              />
            </div>

            {/* Quick jump pills */}
            <div className="flex items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={handleJumpToToday}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  selectedDate === dayjs().format("YYYY-MM-DD")
                    ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleJumpToYesterday}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  selectedDate ===
                  dayjs().subtract(1, "day").format("YYYY-MM-DD")
                    ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                Yesterday
              </button>
            </div>
          </div>

          {/* Currently selected date badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              {activeReport.dayLabel}
            </span>
            {activeReport.tasks.length > 0 ? (
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                {totalSpentHours.toFixed(1)}h logged
              </span>
            ) : (
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                No logs yet
              </span>
            )}
          </div>
        </div>

        {/* 4. TWO-COLUMN LAYOUT: DAYS LIST & EMAIL PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (4 Cols): Recent Workdays Shortcuts */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <span>Recorded Workdays</span>
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">
                {reports.length} days
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {reports.map((report) => {
                const isSelected = report.date === selectedDate;
                const dayHours = report.tasks.reduce(
                  (sum, t) => sum + (t.spentHours || 0),
                  0,
                );

                return (
                  <button
                    key={report.date}
                    type="button"
                    onClick={() => setSelectedDate(report.date)}
                    className={`group relative flex items-center justify-between rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 dark:border-blue-500 dark:bg-blue-950/20 shadow-xs ring-1 ring-blue-500/30"
                        : "border-zinc-200/80 bg-white hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {report.dayLabel}
                        </span>
                        {report.isToday && (
                          <span className="rounded-md bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                            Today
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        {report.tasks.length} task
                        {report.tasks.length === 1 ? "" : "s"} logged
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-lg bg-slate-100 dark:bg-zinc-800 px-2 py-1 text-xs font-bold text-slate-700 dark:text-zinc-300">
                        {dayHours.toFixed(1)}h
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          isSelected
                            ? "text-blue-600 translate-x-0.5"
                            : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN (8 Cols): Email Draft Card & One-Click Copy */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Card Header & Primary Copy Actions */}
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>Formatted Email Preview</span>
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
                    disabled={activeReport.tasks.length === 0}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-semibold shadow-xs transition-all ${
                      activeReport.tasks.length === 0
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500"
                        : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95 cursor-pointer"
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
                    disabled={activeReport.tasks.length === 0}
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

              {/* Email Meta Fields (Subject & Greeting) */}
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
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* The Live Email Table Container */}
              <div className="mt-2 rounded-xl border border-zinc-200 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60 overflow-x-auto">
                <div className="mb-3 text-xs font-medium text-slate-600 dark:text-zinc-400">
                  <p>{recipientGreeting}</p>
                  <p className="mt-1">
                    Here is my daily work summary for{" "}
                    <strong>{activeReport.dayLabel}</strong>:
                  </p>
                </div>

                {activeReport.tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 mb-2">
                      <Info className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      No tasks logged for {activeReport.dayLabel}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 max-w-sm">
                      Select another date using the date picker above, or add a
                      task below to generate this day&apos;s email report.
                    </p>
                    {!showAddForm && (
                      <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Task for this Day</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Task</th>
                        <th className="py-2.5 px-3 text-center">Category</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Spent Time</th>
                        <th className="py-2.5 px-2 text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                      {activeReport.tasks.map((task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-white/60 dark:hover:bg-zinc-900/40 transition-colors group"
                        >
                          <td className="py-3 px-3 max-w-xs sm:max-w-md">
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
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                              {task.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <span className="font-bold text-slate-900 dark:text-zinc-100">
                              {formatHoursToReadable(task.spentHours)}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500 ml-1">
                              ({task.spentHours.toFixed(2)}h)
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteTaskFromDay(task.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
                              title="Remove from report"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-zinc-300 dark:border-zinc-700 font-bold bg-white/70 dark:bg-zinc-900/60">
                        <td
                          colSpan={3}
                          className="py-3 px-3 text-right text-slate-700 dark:text-zinc-300"
                        >
                          Total Time Logged:
                        </td>
                        <td className="py-3 px-3 text-right text-blue-600 dark:text-blue-400 text-sm">
                          {formatHoursToReadable(totalSpentHours)}{" "}
                          <span className="text-xs text-slate-400 dark:text-zinc-500 font-normal">
                            ({totalSpentHours.toFixed(2)}h)
                          </span>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                )}

                <div className="mt-3 text-[11px] text-slate-400 dark:text-zinc-500">
                  <p>Best regards,</p>
                  <p className="font-semibold text-slate-600 dark:text-zinc-400 mt-0.5">
                    DayFlow Workspace
                  </p>
                </div>
              </div>

              {/* Inline Quick-Add Task Box (lets user test custom tasks on any day) */}
              {showAddForm ? (
                <form
                  onSubmit={handleAddTaskToDay}
                  className="rounded-xl border border-blue-200 bg-blue-50/30 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/20 flex flex-col gap-3 text-xs animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-zinc-200">
                    <span>Add Task Log to {activeReport.dayLabel}</span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                        Code
                      </label>
                      <input
                        type="text"
                        value={newTaskCode}
                        onChange={(e) => setNewTaskCode(e.target.value)}
                        placeholder="FE-101"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="e.g. Implement payment webhook verification"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                        Category
                      </label>
                      <select
                        value={newTaskCategory}
                        onChange={(e) => setNewTaskCategory(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        <option value="Feature">Feature</option>
                        <option value="Bug">Bug</option>
                        <option value="Enhancement">Enhancement</option>
                        <option value="Meetings">Meetings</option>
                        <option value="Documentation">Documentation</option>
                        <option value="Refactoring">Refactoring</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                        Hours Spent
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        min="0.25"
                        max="24"
                        value={newTaskHours}
                        onChange={(e) =>
                          setNewTaskHours(parseFloat(e.target.value) || 1)
                        }
                        className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-500 cursor-pointer"
                    >
                      Add to Report
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Task to this Report</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
