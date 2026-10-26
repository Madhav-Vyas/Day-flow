import SideBar from "../components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="w-72">
        <SideBar />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
