"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUsers, useCreateUser, useDeleteUser, userStorage } from "@/lib/api/users";
import { useTheme } from "@/components/ui/ThemeProvider";
import { Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedExistingUser, setSelectedExistingUser] = useState<string>(""); // used for selecting existing usernames
  const [selectedUserId, setSelectedUserId] = useState<string>(""); // store the user_id of the selected user
  const [newUsername, setNewUsername] = useState(""); // used for creating new usernames
  const [isCreating, setIsCreating] = useState(false);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key for forcing re-renders

  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  // Effect to handle input focus when needed
  useEffect(() => {
    if (shouldFocusInput && inputRef.current) {
      // Small delay to ensure browser has completed all operations
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
        setShouldFocusInput(false);
      }, 10);
      
      return () => clearTimeout(timeoutId);
    }
  }, [shouldFocusInput]);

  // Set theme to light for login page only, without saving to localStorage
  useEffect(() => {
    // Get the current theme from localStorage to restore later
    const savedTheme = localStorage.getItem('ui-theme');
    
    // Set theme to light for login page only
    setTheme("light");
    
    // Return cleanup function to restore original theme on unmount
    return () => {
      // We don't want to restore on unmount as the user might have just logged in
      // The user settings will handle theme restoration on login
    };
  }, [setTheme]);

  const handleExistingLogin = async () => {
    // If an existing user is selected, use that
    if (selectedExistingUser && selectedUserId) {
      try {
        // First store the user info
        userStorage.setCurrentUser(selectedExistingUser, selectedUserId);
        
        // Fetch user settings
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10001'}/api/user/${selectedUserId}`);
        if (response.ok) {
          const userSettings = await response.json();
          
          // Store theme in localStorage directly to avoid temporary theme issues
          if (userSettings.theme) {
            localStorage.setItem('ui-theme', userSettings.theme);
            // Now apply the theme
            setTheme(userSettings.theme as "light" | "dark" | "system");
          }
          
          // Apply horizontal sidebar setting
          if (typeof userSettings.horizontal_sidebar === 'boolean') {
            localStorage.setItem('horizontalSidebar', String(userSettings.horizontal_sidebar));
            // Dispatch event to notify components
            window.dispatchEvent(new CustomEvent('horizontalSidebarChange', {
              detail: { enabled: userSettings.horizontal_sidebar }
            }));
          }
          
          console.log("Applied user settings:", userSettings);
        }
        
        console.log("Logged in user:", userStorage.getCurrentUser());
        
        // Navigate to dashboard AFTER applying settings
        router.push("/");
      }
      catch(error) {
        console.error("Error during login:", error);
      }
      return;
    }
    // otherwise, weird case, console log
    console.log("please select a user");
    return;
  };

  const handleDeleteUser = (user: { user_id: string, username: string }, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection of the user when clicking delete
    
    // Check if this is the selected user and reset selection if it is
    if (selectedExistingUser === user.username) {
      userStorage.logout(); // Use logout instead of clearCurrentUser
      setSelectedExistingUser("");
      setSelectedUserId("");
      // Don't modify theme - respect user preferences
    }
    
    // Handle the deletion without confirmation
    deleteUser.mutate(user.user_id, {
      onSuccess: () => {
        // Always clear userStorage after deletion
        userStorage.logout(); // Use logout instead of clearCurrentUser
        setSelectedExistingUser("");
        setSelectedUserId("");
        // Don't modify theme - respect user preferences
        
        // Force re-render after successful deletion
        setRefreshKey(prev => prev + 1);
        
        // Focus on input field using a more aggressive approach with multiple fallbacks
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          } else {
            const input = document.getElementById('username-input');
            if (input) {
              (input as HTMLInputElement).focus();
            }
          }
        }, 100);
      }
    });
  };

  const handleCreateUser = async () => {
    if (!newUsername) return;
    
    setIsCreating(true);
    try {
      const result = await createUser.mutateAsync(newUsername);
      
      // Set default theme and sidebar settings for new user
      if (result.user_id) {
        const defaultSettings = {
          userId: result.user_id,
          theme: 'system' as const,
          horizontal_sidebar: window.innerWidth < 768 // Mobile default is true, desktop is false
        };
        
        // Save default settings to server
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10001'}/api/user/${result.user_id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              theme: defaultSettings.theme,
              horizontal_sidebar: defaultSettings.horizontal_sidebar
            })
          }
        );
        
        if (response.ok) {
          // Store theme in localStorage directly
          localStorage.setItem('ui-theme', defaultSettings.theme);
          // Apply settings client-side
          setTheme(defaultSettings.theme);
          localStorage.setItem('horizontalSidebar', String(defaultSettings.horizontal_sidebar));
          
          // Trigger sidebar update
          window.dispatchEvent(new CustomEvent('horizontalSidebarChange', {
            detail: { enabled: defaultSettings.horizontal_sidebar }
          }));
          
          console.log("Set default settings for new user");
        }
      }
      
      setNewUsername(""); // Clear input after successful creation
      // Navigate to dashboard after creating user
      router.push("/");
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Safe handler for username input changes
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target.value;
      setNewUsername(value);
      // Only clear selection if we're actually typing something
      if (value) {
        setSelectedExistingUser(""); 
        setSelectedUserId("");
      }
    } catch (error) {
      console.error("Error in input change handler:", error);
    }
  };

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-[90vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div key={refreshKey} className="flex items-center justify-center min-h-[90vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome to DNS Fuzzer!</CardTitle>
          <CardDescription>
            Login to access the domain monitoring web app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {/* conditional rendering for users directions */}
            {users && users.length > 0 && <h3 className="text-sm font-medium">Select an existing user:</h3>}
            {(!users || users.length === 0) && <h3 className="text-sm font-medium">No users available. Please create a new user.</h3>}
            <div className="grid gap-2">
              {users?.map((user) => (
                <div 
                  key={user.user_id}
                  className={`p-3 border rounded-md cursor-pointer ${
                    selectedExistingUser === user.username ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                  }`}
                  onClick={() => {
                    setSelectedExistingUser(user.username);
                    setSelectedUserId(user.user_id);
                    setNewUsername(""); // Clear new username when selecting existing user
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{user.username}</div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full" 
                      onClick={(e) => handleDeleteUser(user, e)}
                      disabled={deleteUser.isPending}
                    >
                      {deleteUser.isPending && deleteUser.variables === user.user_id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label htmlFor="username-input" className="text-sm font-medium block mb-2">Or create a new user:</label>
              <Input 
                ref={inputRef}
                id="username-input"
                name="username"
                className="w-full"
                type="text"
                autoComplete="username"
                placeholder="Enter a new username"
                value={newUsername}
                onChange={handleUsernameChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => {
              if (selectedExistingUser) {
                handleExistingLogin();
              } else if (newUsername) {
                handleCreateUser();
              }
            }} 
            className="w-full"
            disabled={(!selectedExistingUser && !newUsername) || isCreating || createUser.isPending}
          >
            {isCreating || createUser.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : selectedExistingUser ? (
              "Login"
            ) : (
              "Create"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
