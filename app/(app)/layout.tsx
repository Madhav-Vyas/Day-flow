import { Suspense } from "react";
import Sidebar from "../components/Sidebar";
import { GlobalTimerBar } from "../components/GlobalTimerBar";
import { TimerConflictModal } from "../components/TimerConflictModal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Suspense fallback={<aside className="w-64 shrink-0 h-screen border-r border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 min-w-0 overflow-y-auto flex flex-col relative">
        {children}
        <GlobalTimerBar />
        <TimerConflictModal />
      </main>
    </div>
  );
}


