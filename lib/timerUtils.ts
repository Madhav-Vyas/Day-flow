export interface TimeSession {
  id: string;
  startTime: number; // Epoch timestamp in ms
  endTime: number | null; // Epoch timestamp in ms, or null if running
  durationSeconds: number; // Stored duration in seconds
}

/**
 * Formats total seconds into HH:MM:SS or MM:SS
 */
export function formatSecondsToHMS(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Converts seconds to decimal hours rounded to 2 decimal places.
 * Example: 5400s -> 1.50h
 */
export function secondsToDecimalHours(seconds: number): number {
  return parseFloat((Math.max(0, seconds) / 3600).toFixed(2));
}

/**
 * Converts decimal hours to seconds.
 * Example: 1.5h -> 5400s
 */
export function decimalHoursToSeconds(decimalHours: number): number {
  return Math.round((Number(decimalHours) || 0) * 3600);
}

/**
 * Calculates the current total elapsed seconds for a task from its sessions
 * and current running timestamp (if active).
 */
export function calculateTotalTaskSeconds(
  sessions: TimeSession[] = [],
  activeSessionStartTime: number | null = null,
  isRunning: boolean = false
): number {
  const completedSeconds = sessions.reduce((acc, session) => {
    return acc + (session.durationSeconds || 0);
  }, 0);

  if (isRunning && activeSessionStartTime) {
    const currentRunningSeconds = Math.max(
      0,
      Math.floor((Date.now() - activeSessionStartTime) / 1000)
    );
    return completedSeconds + currentRunningSeconds;
  }

  return completedSeconds;
}

