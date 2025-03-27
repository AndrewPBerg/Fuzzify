import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface User {
  user_id: string;
  username: string;
}

interface CreateUserResponse {
  message: string;
  username: string;
  user_id: string;
}

// Local storage keys
const USER_STORAGE_KEYS = {
  CURRENT_USER: "currentUser",
  USER_ID: "userID"
};

// User storage functions
export const userStorage = {
  setCurrentUser: (username: string, userId: string) => {
    // Check if we're running in a browser environment
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(USER_STORAGE_KEYS.CURRENT_USER, username);
    localStorage.setItem(USER_STORAGE_KEYS.USER_ID, userId);
    
    // Dispatch custom event to notify components of username change
    window.dispatchEvent(new CustomEvent("userUpdate"));
  },
  
  clearCurrentUser: () => {
    // Check if we're running in a browser environment
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(USER_STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(USER_STORAGE_KEYS.USER_ID);
  },
  
  // New logout function that handles theme resetting
  logout: () => {
    // Check if we're running in a browser environment
    if (typeof window === 'undefined') return;
    
    // Clear user data
    localStorage.removeItem(USER_STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(USER_STORAGE_KEYS.USER_ID);
    
    // Don't change the theme - respect user preference
    // localStorage.setItem('ui-theme', 'light');
    
    // Dispatch events to notify components
    window.dispatchEvent(new CustomEvent("userUpdate"));
    // Don't dispatch theme change event
    // window.dispatchEvent(new CustomEvent("themeChange", { detail: { theme: 'light' } }));
  },
  
  getCurrentUser: () => {
    // Check if we're running in a browser environment
    if (typeof window === 'undefined') {
      return {
        username: "",
        userId: ""
      };
    }
    
    return {
      username: localStorage.getItem(USER_STORAGE_KEYS.CURRENT_USER) || "",
      userId: localStorage.getItem(USER_STORAGE_KEYS.USER_ID) || ""
    };
  }
};

// API functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10001';

// New function to get user settings
const getUserSettings = async (userId: string): Promise<{
  user_id: string;
  username: string;
  theme: string;
  horizontal_sidebar: boolean;
}> => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  const response = await fetch(`${API_BASE_URL}/api/user/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user settings");
  }
  return response.json();
};

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/api/user`);
  if (!response.ok) {
    userStorage.clearCurrentUser();
    throw new Error("Failed to fetch users");
  }
  try {
    const data = await response.json();
    return data.users;
  } catch (error) {
    console.error("JSON parsing error:", error);
    throw new Error("Invalid response format from server");
  }
};

const createUser = async (username: string): Promise<CreateUserResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });
  if (!response.ok) {
    throw new Error("Failed to create user");
  }
  return response.json();
};

const deleteUser = async (userId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
};

const updateUsername = async ({ userId, username }: { userId: string; username: string }): Promise<{ message: string; user_id: string; username: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });
  if (!response.ok) {
    throw new Error("Failed to update username");
  }
  return response.json();
};

// New function to update user settings
const updateUserSettings = async ({ 
  userId, 
  username,
  theme, 
  horizontal_sidebar 
}: { 
  userId: string;
  username?: string;
  theme?: string; 
  horizontal_sidebar?: boolean 
}): Promise<{ 
  message: string; 
  user_id: string; 
  username: string; 
  theme: string; 
  horizontal_sidebar: boolean 
}> => {
  const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      username,
      theme, 
      horizontal_sidebar 
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to update user settings");
  }
  return response.json();
};

// Query hooks
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 60000, // Data remains fresh for 1 minute
    gcTime: 300000, // Keep cached data for 5 minutes
  });
}

// New hook to get user settings
export function useUserSettings(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserSettings(userId),
    staleTime: 60000, // Data remains fresh for 1 minute
    gcTime: 300000, // Keep cached data for 5 minutes
    enabled: !!userId, // Only run query if userId is provided
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({ // so much easier than custom hooks
    mutationFn: createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Store the new username in localStorage
      userStorage.setCurrentUser(data.username, data.user_id || "");
      toast.success("User created successfully");
    },
    onError: (error) => {
      toast.error("Error creating user", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error("Error deleting user", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });
}

export function useUpdateUsername() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUsername,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Update the stored username in localStorage
      const currentUser = userStorage.getCurrentUser();
      userStorage.setCurrentUser(data.username, currentUser.userId);
      toast.success("Username updated successfully");
    },
    onError: (error) => {
      toast.error("Error updating username", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });
}

// New mutation hook to update user settings
export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserSettings,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      toast.error("Error updating settings", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });
}