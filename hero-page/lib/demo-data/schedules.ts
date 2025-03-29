import { DEMO_DOMAIN_ROOTS } from "./domain";

// Define Schedule interface based on the frontend structure
export interface Schedule {
  id: string;
  domains: string[];  // Domain names
  type: "hourly" | "daily" | "weekly" | "custom";
  customHours: number | null;
  createdAt: string;
  nextRun: string;
  userId: string;  // To filter schedules by user
}

// Function to calculate next run time based on schedule type
function calculateNextRunTime(type: Schedule["type"], hours: number = 0, baseDate?: Date): string {
  const now = baseDate || new Date();
  
  switch (type) {
    case "hourly":
      now.setHours(now.getHours() + 1);
      break;
    case "daily":
      now.setHours(now.getHours() + 24);
      break;
    case "weekly":
      now.setDate(now.getDate() + 7);
      break;
    case "custom":
      now.setHours(now.getHours() + hours);
      break;
  }
  
  return now.toISOString();
}

// Create demo schedules with a mix of different schedule types
export const DEMO_SCHEDULES: Schedule[] = [
  // Daily schedule for example.com
  {
    id: "schedule-1",
    domains: ["example.com"],
    type: "daily",
    customHours: null,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
    nextRun: calculateNextRunTime("daily", 0, new Date(Date.now() + 8 * 60 * 60 * 1000)), // 8 hours from now
    userId: "demo-user-1"
  },
  
  // Hourly schedule for acmetech.org
  {
    id: "schedule-2",
    domains: ["acmetech.org"],
    type: "hourly",
    customHours: null,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    nextRun: calculateNextRunTime("hourly", 0, new Date(Date.now() + 25 * 60 * 1000)), // 25 minutes from now
    userId: "demo-user-1"
  },
  
  // Weekly schedule for securebank.com
  {
    id: "schedule-3",
    domains: ["securebank.com"],
    type: "weekly",
    customHours: null,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    nextRun: calculateNextRunTime("weekly", 0, new Date(Date.now() + 24 * 60 * 60 * 1000)), // 1 day from now
    userId: "demo-user-1"
  },
  
  // Custom schedule (48 hours) for multiple domains
  {
    id: "schedule-4",
    domains: ["techcorp.io", "cloudservices.net"],
    type: "custom",
    customHours: 48,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    nextRun: calculateNextRunTime("custom", 48, new Date(Date.now() + 12 * 60 * 60 * 1000)), // 12 hours from now
    userId: "demo-user-1"
  },
  
  // Daily schedule for all domains
  {
    id: "schedule-5",
    domains: DEMO_DOMAIN_ROOTS.map(domain => domain.name),
    type: "daily",
    customHours: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    nextRun: calculateNextRunTime("daily", 0, new Date(Date.now() + 20 * 60 * 60 * 1000)), // 20 hours from now
    userId: "demo-user-1"
  }
];

// Function to get schedules for a specific user
export function getSchedulesByUserId(userId: string): Schedule[] {
  return DEMO_SCHEDULES.filter(schedule => schedule.userId === userId);
}

// Function to get schedules for a specific domain
export function getSchedulesByDomain(domainName: string): Schedule[] {
  return DEMO_SCHEDULES.filter(schedule => schedule.domains.includes(domainName));
}

// Function to get a schedule by ID
export function getScheduleById(id: string): Schedule | undefined {
  return DEMO_SCHEDULES.find(schedule => schedule.id === id);
}

export default {
  schedules: DEMO_SCHEDULES,
  getSchedulesByUserId,
  getSchedulesByDomain,
  getScheduleById
}; 