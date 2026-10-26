import Sidebar from "../components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}

