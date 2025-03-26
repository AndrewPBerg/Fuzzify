import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface User {
  user_id: string;
  username: string;
}

interface CreateUserResponse {
  message: string;
  username: string;
}

// API functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10001';

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/api/user`);
  if (!response.ok) {
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

// Query hooks
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 60000, // Data remains fresh for 1 minute
    gcTime: 300000, // Keep cached data for 5 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({ // so much easier than custom hooks
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
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