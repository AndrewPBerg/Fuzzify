import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Schedule {
  schedule_id: string;
  schedule_name: string;
  domain_name: string;
  start_date: string;
  next_scan: string | null;
}

// Local storage keys
const SCHEDULE_STORAGE_KEYS = {
  DOMAIN_SCHEDULES: "domainSchedules"
};

// Schedule storage functions
export const scheduleStorage = {
  setSchedules: (schedules: Schedule[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SCHEDULE_STORAGE_KEYS.DOMAIN_SCHEDULES, JSON.stringify(schedules));
    window.dispatchEvent(new Event('storage'));
  },

  getSchedules: (): Schedule[] => {
    if (typeof window === 'undefined') return [];
    const schedules = localStorage.getItem(SCHEDULE_STORAGE_KEYS.DOMAIN_SCHEDULES);
    return schedules ? JSON.parse(schedules) : [];
  },

  clearSchedules: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SCHEDULE_STORAGE_KEYS.DOMAIN_SCHEDULES);
    window.dispatchEvent(new Event('storage'));
  }
};

// API functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10001';

const fetchSchedules = async (userId: string): Promise<Schedule[]> => {
  const response = await fetch(`${API_BASE_URL}/api/${userId}/schedule`);
  if (!response.ok) {
    throw new Error("Failed to fetch schedules");
  }
  
  try {
    const data = await response.json();
    scheduleStorage.setSchedules(data.schedules);
    return data.schedules;
  } catch (error) {
    console.error("JSON parsing error:", error);
    throw new Error("Invalid response format from server");
  }
};

const createSchedule = async ({ 
  userId, 
  hours, 
  domain_names 
}: { 
  userId: string;
  hours: number;
  domain_names: string[];
}): Promise<{ message: string; schedules: Schedule[] }> => {
  const response = await fetch(`${API_BASE_URL}/api/${userId}/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hours, domain_names }),
  });

  if (!response.ok) {
    throw new Error("Failed to create schedule");
  }

  const data = await response.json();
  const currentSchedules = scheduleStorage.getSchedules();
  scheduleStorage.setSchedules([...currentSchedules, ...data.schedules]);
  return data;
};

const deleteSchedules = async ({ 
  userId, 
  schedule_ids 
}: { 
  userId: string;
  schedule_ids: string[];
}): Promise<{ message: string; deleted_schedules: string[] }> => {
  const response = await fetch(`${API_BASE_URL}/api/${userId}/schedule`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ schedule_ids }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete schedules");
  }

  const data = await response.json();
  const currentSchedules = scheduleStorage.getSchedules();
  const updatedSchedules = currentSchedules.filter(
    schedule => !schedule_ids.includes(schedule.schedule_id)
  );
  scheduleStorage.setSchedules(updatedSchedules);
  return data;
};

const updateSchedule = async ({ 
  userId, 
  schedule_id,
  schedule_name,
  next_scan 
}: { 
  userId: string;
  schedule_id: string;
  schedule_name?: string;
  next_scan?: string;
}): Promise<{ message: string; schedule: Schedule }> => {
  const response = await fetch(`${API_BASE_URL}/api/${userId}/schedule`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ schedule_id, schedule_name, next_scan }),
  });

  if (!response.ok) {
    throw new Error("Failed to update schedule");
  }

  const data = await response.json();
  const currentSchedules = scheduleStorage.getSchedules();
  const updatedSchedules = currentSchedules.map(schedule => 
    schedule.schedule_id === schedule_id ? data.schedule : schedule
  );
  scheduleStorage.setSchedules(updatedSchedules);
  return data;
};

// Query hooks
export function useSchedules(userId: string) {
  return useQuery({
    queryKey: ["schedules", userId],
    queryFn: () => fetchSchedules(userId),
    staleTime: 60000, // Data remains fresh for 1 minute
    gcTime: 300000, // Keep cached data for 5 minutes
    enabled: !!userId, // Only run query if userId is provided
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSchedule,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedules", variables.userId] });
      toast.success("Schedule created successfully", {
        description: `Created ${data.schedules.length} schedule(s)`,
      });
    },
    onError: (error) => {
      toast.error("Error creating schedule", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });
}

export function useDeleteSchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSchedules,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedules", variables.userId] });
      toast.success("Schedules deleted successfully", {
        description: `Deleted ${data.deleted_schedules.length} schedule(s)`,
      });
    },
    onError: (error) => {
      toast.error("Error deleting schedules", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSchedule,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedules", variables.userId] });
      toast.success("Schedule updated successfully", {
        description: `Updated schedule "${data.schedule.schedule_name}"`,
      });
    },
    onError: (error) => {
      toast.error("Error updating schedule", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });
}
