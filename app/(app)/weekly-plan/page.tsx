import { Suspense } from "react";
import {
  formatDateForUrl,
  getEndOfWeek,
  getStartOfWeek,
  addWeeks,
  formatWeekRange,
} from "@/app/lib/dateUtils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

async function WeeklyPlanContent({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;

  // Resolve Monday of the requested week (or current week if missing/invalid)
  const monday = getStartOfWeek(params?.week);
  const formattedMonday = formatDateForUrl(monday);

  // If ?week= is not provided or not normalized to "YYYY-MM-DD" of Monday, redirect cleanly
  if (params?.week !== formattedMonday) {
    redirect(`/weekly-plan?week=${formattedMonday}`);
  }

  const endOfWeek = getEndOfWeek(monday);
  const prevWeekMonday = formatDateForUrl(addWeeks(monday, -1));
  const nextWeekMonday = formatDateForUrl(addWeeks(monday, 1));
  const currentWeekMonday = formatDateForUrl(getStartOfWeek(new Date()));

  return (
    <div className="flex flex-col gap-6">
      {/* Header with week navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Weekly Plan
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {formatWeekRange(monday)}
          </p>
        </div>

        {/* Week Switcher Controls */}
        <div className="flex items-center gap-2">
          {formattedMonday !== currentWeekMonday && (
            <Link
              href={`/weekly-plan?week=${currentWeekMonday}`}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Current Week
            </Link>
          )}

          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5">
            <Link
              href={`/weekly-plan?week=${prevWeekMonday}`}
              aria-label="Previous week"
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>

            <span className="flex items-center gap-1.5 px-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              {formattedMonday}
            </span>

            <Link
              href={`/weekly-plan?week=${nextWeekMonday}`}
              aria-label="Next week"
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Placeholder content for weekly plan */}
      <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-500 dark:text-zinc-400">
        Planning workspace for week {formattedMonday} to {formatDateForUrl(endOfWeek)}
      </div>
    </div>
  );
}

export default function WeeklyPlan({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" />
        </div>
      }
    >
      <WeeklyPlanContent searchParams={searchParams} />
    </Suspense>
  );
}


