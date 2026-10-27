import { Suspense } from "react";
import Sidebar from "../components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Suspense fallback={<aside className="w-64 shrink-0 h-screen border-r border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}


