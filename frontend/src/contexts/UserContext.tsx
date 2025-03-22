"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the User interface
export interface User {
  user_id: string;
  username: string;
}

// Define the context interface
interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
  users: User[];
  fetchUsers: () => Promise<User[]>;
  createUser: (username: string) => Promise<User>;
  logout: () => void;
}

// Create the context with default values
const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  isLoading: true,
  users: [],
  fetchUsers: async () => [],
  createUser: async () => ({ user_id: "", username: "" }),
  logout: () => {},
});

// Create a hook to use the user context
export const useUser = () => useContext(UserContext);

// Create the provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch users from the API
  const fetchUsers = async (): Promise<User[]> => {
    try {
      const response = await fetch("/api/user");
      const data = await response.json();
      setUsers(data.users || []);
      return data.users || [];
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return [];
    }
  };

  // Function to create a new user
  const createUser = async (username: string): Promise<User> => {
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      
      // Refresh the users list
      await fetchUsers();
      
      // Return the new user with both user_id and username
      return { user_id: data.user_id || "", username };
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  };

  // Function to log out
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  // Load user from localStorage on initial render
  useEffect(() => {
    const savedUserId = localStorage.getItem("currentUser");
    if (savedUserId) {
      // Find the user in the users array by user_id
      fetchUsers().then(fetchedUsers => {
        const savedUser = fetchedUsers.find(user => user.user_id === savedUserId);
        if (savedUser) {
          setCurrentUser(savedUser);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Update localStorage when current user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", currentUser.user_id);
    }
  }, [currentUser]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoading,
        users,
        fetchUsers,
        createUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
} 