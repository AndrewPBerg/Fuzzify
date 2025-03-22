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

  // Update localStorage when current user changes
  useEffect(() => {
    if (currentUser) {
      console.log("Storing user in localStorage:", currentUser);
      localStorage.setItem("currentUser", currentUser.user_id);
      localStorage.setItem("user_id", currentUser.user_id); // Store in both keys for redundancy
      
      // Also store full user data for debugging
      try {
        localStorage.setItem("userDataDebug", JSON.stringify(currentUser));
      } catch (e) {
        console.error("Failed to store user data for debugging:", e);
      }
    }
  }, [currentUser]);

  // Function to log out
  const logout = () => {
    console.log("Logging out, removing user from localStorage");
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("user_id"); // Remove both keys
    localStorage.removeItem("userDataDebug");
  };

  // Load user from localStorage on initial render - ONLY ONCE
  useEffect(() => {
    const loadInitialUser = async () => {
      if (initialLoadComplete.current) {
        return; // Prevent multiple initializations
      }
      
      // Check both possible localStorage keys
      const savedUserId = localStorage.getItem("currentUser") || localStorage.getItem("user_id");
      console.log("Found user ID in localStorage:", savedUserId);
      
      if (savedUserId) {
        // Only fetch if we don't have users yet
        let userList = users;
        if (userList.length === 0) {
          userList = await fetchUsers(false);
        }
        
        const savedUser = userList.find(user => user.user_id === savedUserId);
        if (savedUser) {
          console.log("Found matching user in users list:", savedUser);
          setCurrentUser(savedUser);
        } else {
          console.log("User ID found in localStorage but no matching user in users list");
        }
      }
      
      setIsLoading(false);
      initialLoadComplete.current = true;
    };
    
    loadInitialUser();
  }, []); // Empty dependency array ensures this only runs once

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