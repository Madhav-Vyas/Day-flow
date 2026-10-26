import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="flex flex-col">
      <Link href="/reports">Reports</Link>
      <Link href="/sprints">Sprints</Link>
      <Link href="/time-tracking">Time Tracking</Link>
      <Link href="/weekly-plan">Weekly Plan</Link>
    </div>
  );
}
