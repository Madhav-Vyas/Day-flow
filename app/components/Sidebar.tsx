"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Timer, SlidersHorizontal } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

// Custom icons to match the exact design in the reference
function WeeklyPlanIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="7.5" y1="4" x2="7.5" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="16.5" y1="4" x2="16.5" y2="20" />
    </svg>
  );
}

function SprintsRunnerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Speed lines behind runner */}
      <path d="M2.5 10.5h3" />
      <path d="M1.5 14h4" />
      <path d="M3 17.5h3" />
      {/* Runner head */}
      <circle cx="16.5" cy="5" r="1.75" fill="currentColor" stroke="none" />
      {/* Arms & Torso */}
      <path d="M10 12l3.2-2.2 3.3 1.8 3.5 3.5" />
      {/* Legs */}
      <path d="M13.2 9.8v5l3.8 4.2" />
      <path d="M13.2 14.8l-3.5 2.7" />
    </svg>
  );
}

function ReportsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="3.5" y="11" width="3.5" height="10" rx="1.2" />
      <rect x="10.25" y="4" width="3.5" height="17" rx="1.2" />
      <rect x="17" y="13.5" width="3.5" height="7.5" rx="1.2" />
    </svg>
  );
}

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
    exact: true,
  },
  {
    name: "Weekly Plan",
    href: "/weekly-plan",
    icon: WeeklyPlanIcon,
  },
  {
    name: "Time Tracking",
    href: "/time-tracking",
    icon: Timer,
  },
  {
    name: "Sprints",
    href: "/sprints",
    icon: SprintsRunnerIcon,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: ReportsIcon,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: SlidersHorizontal,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col justify-between border-r border-zinc-200/80 bg-white px-4 py-5 font-sans dark:border-zinc-800 dark:bg-zinc-950 transition-colors">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          {/* Logo Badge */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs dark:bg-zinc-800">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="12" cy="12" r="8" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
          </div>

          {/* Logo Info */}
          <div className="flex flex-col">
            <span className="text-[17px] font-semibold tracking-tight text-slate-800 dark:text-zinc-100 leading-tight">
              DayFlow
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Sprint 24 · Day 3
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <div key={item.name} className="flex flex-col">
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#EAF1FE] text-[#2955A6] dark:bg-blue-950/50 dark:text-blue-300 font-semibold"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      isActive
                        ? "text-[#2955A6] dark:text-blue-300"
                        : "text-slate-500 group-hover:text-slate-800 dark:text-zinc-400 dark:group-hover:text-zinc-200"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>

                {/* Sub-menu when Reports is active */}
                {item.href === "/reports" &&
                  pathname.startsWith("/reports") && (
                    <div className="flex flex-col gap-0.5 pl-11 pr-2 pt-1 pb-1">
                      <Link
                        href="/reports/daily"
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          pathname === "/reports/daily"
                            ? "text-[#2955A6] bg-blue-50/70 dark:bg-blue-950/40 dark:text-blue-300 font-semibold"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900"
                        }`}
                      >
                        Daily Report
                      </Link>
                      <Link
                        href="/reports/weekly"
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          pathname === "/reports/weekly"
                            ? "text-[#2955A6] bg-blue-50/70 dark:bg-blue-950/40 dark:text-blue-300 font-semibold"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900"
                        }`}
                      >
                        Weekly Report
                      </Link>
                    </div>
                  )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer with Theme Toggle */}
      <div className="border-t border-zinc-200/70 pt-4 dark:border-zinc-800/80">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            Theme
          </span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
