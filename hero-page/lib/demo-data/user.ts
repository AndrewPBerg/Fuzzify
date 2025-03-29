// Static user data to replace userStorage functionality
import domainData, { Domain, Permutation } from './domains';

export interface User {
  user_id: string;
  username: string;
  email?: string;
  theme?: string;
  horizontal_sidebar?: boolean;
  preferences?: {
    notifications?: boolean;
    defaultView?: string;
    language?: string;
  };
  profile?: {
    name?: string;
    avatar?: string;
    role?: string;
  };
}

// Default user for demo purposes
const DEFAULT_USER: User = {
  user_id: "demo-user-1",
  username: "Demo User",
  email: "demo@example.com",
  theme: "system",
  horizontal_sidebar: false,
  preferences: {
    notifications: true,
    defaultView: "dashboard",
    language: "en-US"
  },
  profile: {
    name: "Demo User",
    avatar: "/images/avatars/default.jpg",
    role: "Administrator"
  }
};

// Sample settings data
export const DEMO_SETTINGS = {
  notifications: true,
  defaultView: "dashboard",
  theme: "system",
  language: "en-US"
};

// Mock localStorage event handling
const listeners: Array<() => void> = [];

// Initialize any required client-side settings
function initializeClientSettings() {
  if (typeof window === "undefined") return;
  
  try {
    // Initialize theme
    if (DEFAULT_USER.theme) {
      localStorage.setItem("ui-theme", DEFAULT_USER.theme);
    }
    
    // Initialize sidebar preference
    if (typeof DEFAULT_USER.horizontal_sidebar === "boolean") {
      localStorage.setItem("horizontalSidebar", DEFAULT_USER.horizontal_sidebar.toString());
      
      // Notify components of sidebar preference
      window.dispatchEvent(
        new CustomEvent("horizontalSidebarChange", {
          detail: { enabled: DEFAULT_USER.horizontal_sidebar }
        })
      );
    }
    
    // Store user data for components that might look for it in localStorage
    localStorage.setItem("currentUser", DEFAULT_USER.username);
    localStorage.setItem("userId", DEFAULT_USER.user_id);
    
    // Store other demo data
    localStorage.setItem("demoData", JSON.stringify({
      domains: domainData.domains,
      settings: DEMO_SETTINGS
    }));
    
    // Dispatch userUpdate event to notify components of user data
    window.dispatchEvent(new CustomEvent("userUpdate"));
    
    console.log("Demo data initialized successfully");
  } catch (error) {
    console.error("Failed to initialize demo data:", error);
  }
}

// Defer initialization to avoid hydration issues
const initializeOnClient = () => {
  // Safeguard against server-side rendering
  if (typeof window === "undefined") return;

  // Use setTimeout with 0 delay to push to the end of event loop
  // This ensures it runs after React has hydrated the page
  setTimeout(() => {
    initializeClientSettings();
  }, 0);
};

// Only run in browser environments, not during SSR
if (typeof window !== "undefined") {
  // Check if the document is already complete
  if (document.readyState === "complete") {
    initializeOnClient();
  } else {
    // Otherwise wait for the load event
    window.addEventListener("load", initializeOnClient);
  }
}

// Mock user storage functionality
export const userStorage = {
  // Get the current user (static for demo)
  getCurrentUser: (): User => {
    return DEFAULT_USER;
  },
  
  // Mock method for updating user data
  updateUser: (userData: Partial<User>): void => {
    // In a real implementation, this would update localStorage
    // For static demo, we just trigger listeners
    listeners.forEach(listener => listener());
    
    // Dispatch custom event for components listening to user updates
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("userUpdate"));
    }
  },
  
  // Add a listener for user data changes
  addListener: (callback: () => void): void => {
    listeners.push(callback);
  },
  
  // Remove a listener
  removeListener: (callback: () => void): void => {
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  },
  
  // Mock logout functionality - for demo, this would normally reset state
  logout: (): void => {
    if (typeof window !== "undefined") {
      // For demo purposes, we don't actually clear anything
      // Just trigger the event for components that might be listening
      window.dispatchEvent(new CustomEvent("userUpdate"));
    }
  },
  
  // Get demo domains data
  getDomains: (): Domain[] => {
    return domainData.getDomainsByUserId(DEFAULT_USER.user_id);
  },
  
  // Get permutations for a domain
  getPermutations: (domainName: string): Permutation[] => {
    return domainData.getPermutationsByDomain(domainName);
  },
  
  // Get all permutations for the user
  getAllPermutations: (): Permutation[] => {
    return domainData.getAllPermutationsByUserId(DEFAULT_USER.user_id);
  },
  
  // Get demo settings
  getSettings: () => {
    return DEMO_SETTINGS;
  }
};

export default userStorage;
