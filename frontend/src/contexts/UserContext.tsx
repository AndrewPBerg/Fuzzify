"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useFetchWithCache } from "@/hooks/useFetchWithCache";

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
  fetchUsers: (force?: boolean) => Promise<User[]>;
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
  const { fetchWithCache, invalidateCache } = useFetchWithCache<{ users: User[] }>();
  const initialLoadComplete = useRef(false);

  // Function to fetch users from the API with caching
  const fetchUsers = async (force: boolean = false): Promise<User[]> => {
    try {
      // Use the cache unless force is true
      const response = await fetchWithCache(
        "/api/user", 
        undefined, 
        { cacheDuration: force ? 0 : 60000 }
      );
      
      const fetchedUsers = response.users || [];
      setUsers(fetchedUsers);
      return fetchedUsers;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return users; // Return existing users on error
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
      
      // Invalidate the users cache
      invalidateCache("/api/user");
      
      // Refresh the users list
      await fetchUsers(true);
      
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

  // Load user from localStorage on initial render - ONLY ONCE
  useEffect(() => {
    const loadInitialUser = async () => {
      if (initialLoadComplete.current) {
        return; // Prevent multiple initializations
      }
      
      const savedUserId = localStorage.getItem("currentUser");
      if (savedUserId) {
        // Only fetch if we don't have users yet
        let userList = users;
        if (userList.length === 0) {
          userList = await fetchUsers(false);
        }
        
        const savedUser = userList.find(user => user.user_id === savedUserId);
        if (savedUser) {
          setCurrentUser(savedUser);
        }
      }
      
      setIsLoading(false);
      initialLoadComplete.current = true;
    };
    
    loadInitialUser();
  }, []); // Empty dependency array ensures this only runs once

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