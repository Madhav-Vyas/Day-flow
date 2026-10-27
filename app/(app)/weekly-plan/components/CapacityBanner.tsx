"use client";

import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";

interface CapacityBannerProps {
  isDismissed: boolean;
  onDismiss: () => void;
  onReschedule: () => void;
}

export function CapacityBanner({
  isDismissed,
  onDismiss,
  onReschedule,
}: CapacityBannerProps) {
  if (isDismissed) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200/90 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200 transition-all">
      <div className="flex items-center gap-2.5">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          <strong>Wednesday Planned Capacity Exceeded</strong> (+0.5h over
          8.0h) — Consider shifting FE-157 (2.5h) to Thursday&apos;s open slot.
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 cursor-pointer"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={onReschedule}
          className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white/90 px-2.5 py-1 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-white dark:border-amber-800 dark:bg-zinc-900 dark:text-amber-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <span>Reschedule FE-157</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
