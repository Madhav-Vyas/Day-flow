export default async function SprintDetails({
  params,
}: {
  params: Promise<{ sprintId: string }>;
}) {
  const { sprintId } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold">Sprint Details {sprintId}</h1>
    </div>
  );
}

