"use client";

import { getTodaysTask } from "@/lib/services/todaysTask-service";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import React, { useState } from "react";

export default function TimeTracking() {
  const [todayDate] = useState(() => dayjs().format("YYYY-MM-DD"));

  const { data, isLoading, error } = useQuery({
    queryKey: ["todaystask", todayDate],
    queryFn: () => getTodaysTask(todayDate),
  });

  if (error) {
    return <div>{error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading.........</div>;
  }

  return (
    <div>
      <div>TimeTracking ({todayDate})</div>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : null}
    </div>
  );
}
