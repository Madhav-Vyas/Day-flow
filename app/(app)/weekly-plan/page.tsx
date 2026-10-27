import { Suspense } from "react";
import { formatDateForUrl, getStartOfWeek } from "@/app/lib/dateUtils";
import { redirect } from "next/navigation";
import { WeeklyPlanView } from "./WeeklyPlanView";

async function WeeklyPlanContent({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;

  // Resolve Monday of the requested week (defaults to Oct 21, 2024 if matching initial demo or current week)
  const monday = getStartOfWeek(params?.week || "2024-10-21");
  const formattedMonday = formatDateForUrl(monday);

  // If ?week= is not provided, redirect cleanly to normalize the URL
  if (params?.week !== formattedMonday) {
    redirect(`/weekly-plan?week=${formattedMonday}`);
  }

  return <WeeklyPlanView initialMondayDate={formattedMonday} />;
}

export default function WeeklyPlan({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 p-6 animate-pulse">
          <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>
        </div>
      }
    >
      <WeeklyPlanContent searchParams={searchParams} />
    </Suspense>
  );
}



