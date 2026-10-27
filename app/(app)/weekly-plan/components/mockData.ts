import { Task } from "./types";

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const TARGET_CAPACITY_PER_DAY = 8.0;
export const TARGET_SPRINT_HOURS = 40.0;

export const INITIAL_TASKS: Task[] = [
  // Monday
  {
    id: "t-1",
    code: "BUG-079",
    title: "Fix race condition on sign-in redirect and auth token...",
    hours: 3.0,
    dayIndex: 0,
    status: "DONE",
    tag: "BUG",
  },
  {
    id: "t-2",
    code: "FE-139",
    title: "Setup Vitest mock environment for worker...",
    hours: 3.5,
    dayIndex: 0,
    status: "DONE",
    tag: "FE",
  },
  {
    id: "t-3",
    code: "MISC",
    title: "Sprint planning & architecture sync with...",
    hours: 1.5,
    dayIndex: 0,
    status: "DONE",
    tag: "MISC",
  },

  // Tuesday
  {
    id: "t-4",
    code: "FE-140",
    title: "API contract definition for token refresh & session...",
    hours: 4.5,
    dayIndex: 1,
    status: "DONE",
    tag: "FE",
  },
  {
    id: "t-5",
    code: "BUG-081",
    title: "Resolve CORS preflight caching headers in Edge...",
    hours: 2.5,
    dayIndex: 1,
    status: "DONE",
    tag: "BUG",
  },
  {
    id: "t-6",
    code: "MISC",
    title: "Frontend chapter sync & pull request code reviews",
    hours: 1.0,
    dayIndex: 1,
    status: "DONE",
    tag: "MISC",
  },

  // Wednesday (Today)
  {
    id: "t-7",
    code: "FE-142",
    title: "Auth token refresh & silent renewal pipeline...",
    hours: 3.5,
    loggedHours: 1.7,
    dayIndex: 2,
    status: "IN_PROGRESS",
    tag: "FE",
  },
  {
    id: "t-8",
    code: "BUG-083",
    title: "Memory leak in WebSocket reconnect...",
    hours: 2.5,
    dayIndex: 2,
    status: "DONE",
    tag: "BUG",
  },
  {
    id: "t-9",
    code: "FE-157",
    title: "Refactor user profile schema validation to Zod...",
    hours: 2.5,
    dayIndex: 2,
    status: "TODO",
    tag: "FE",
    quickAction: {
      label: "Move to Thu →",
      targetDayIndex: 3,
    },
  },

  // Thursday
  {
    id: "t-10",
    code: "FE-158",
    title: "Add schema migration scripts for Postgres user...",
    hours: 4.0,
    dayIndex: 3,
    status: "TODO",
    tag: "FE",
  },
  {
    id: "t-11",
    code: "FE-160",
    title: "Setup E2E smoke tests in CI pipeline via Playwright...",
    hours: 3.0,
    dayIndex: 3,
    status: "TODO",
    tag: "FE",
  },

  // Friday
  {
    id: "t-12",
    code: "TECH-102",
    title: "Dependency updates, audit pnpm lockfile &...",
    hours: 3.5,
    dayIndex: 4,
    status: "TODO",
    tag: "TECH",
  },
  {
    id: "t-13",
    code: "MISC",
    title: "Sprint retrospective preparation & end-of-cycl...",
    hours: 2.5,
    dayIndex: 4,
    status: "TODO",
    tag: "MISC",
  },

  // Backlog
  {
    id: "t-14",
    code: "FE-164",
    title: "Telemetry integration for time-to-first-byte and web vitals",
    hours: 2.0,
    dayIndex: -1,
    status: "TODO",
    priority: "P3 Low",
    tag: "FE",
  },
  {
    id: "t-15",
    code: "BUG-086",
    title: "Keyboard shortcut conflicts with Chrome Command+Shift+P menu",
    hours: 1.0,
    dayIndex: -1,
    status: "TODO",
    priority: "P2 Normal",
    tag: "BUG",
  },
];
