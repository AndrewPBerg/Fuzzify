// Mock API hooks and functionality for the demo app
import { useState } from "react";
import { User } from "../demo-data/user";
import userStorage from "../demo-data/user";

// Re-export userStorage from demo-data
export { userStorage };

// Mock hook for fetching users
export function useUsers() {
  // For demo purposes, just return the current user in an array
  const [data] = useState<User[]>([userStorage.getCurrentUser()]);
  
  return {
    data,
    isLoading: false,
    error: null
  };
}

// Mock hook for creating a user
export function useCreateUser() {
  return {
    mutateAsync: async (username: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a "new" user with a fake user_id
      const newUser = {
        username,
        user_id: `user-${Date.now()}`
      };
      
      // In a real app, this would store the user in a database
      // For demo purposes, just return the created user
      return newUser;
    },
    isLoading: false
  };
}

// Mock hook for updating user settings
export function useUpdateUserSettings() {
  return {
    mutateAsync: async (settings: {
      userId: string;
      username?: string;
      theme?: string;
      horizontal_sidebar?: boolean;
    }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get current user
      const currentUser = userStorage.getCurrentUser();
      
      // Create updated user object
      const updatedUser = {
        ...currentUser,
        username: settings.username || currentUser.username,
        theme: settings.theme || currentUser.theme,
        horizontal_sidebar: 
          settings.horizontal_sidebar !== undefined 
            ? settings.horizontal_sidebar 
            : currentUser.horizontal_sidebar
      };
      
      // In a real app, this would update the user in a database
      // For demo, trigger a user update event
      if (typeof localStorage !== 'undefined') {
        // Save current user name in localStorage for components that might use it
        if (settings.username) {
          localStorage.setItem('currentUser', settings.username);
        }
        
        // Save theme preference
        if (settings.theme) {
          localStorage.setItem('ui-theme', settings.theme);
        }
        
        // Save horizontal sidebar preference
        if (settings.horizontal_sidebar !== undefined) {
          localStorage.setItem('horizontalSidebar', 
            settings.horizontal_sidebar.toString());
        }
      }
      
      // Notify components of the update
      userStorage.updateUser(updatedUser);
      
      // Return the updated user
      return updatedUser;
    },
    isLoading: false
  };
} 