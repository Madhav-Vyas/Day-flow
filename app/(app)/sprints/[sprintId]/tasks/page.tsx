export default async function SprintTasks({
  params,
}: {
  params: Promise<{ sprintId: string }>;
}) {
  const { sprintId } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold">Sprint Tasks for {sprintId}</h1>
    </div>
  );
}

