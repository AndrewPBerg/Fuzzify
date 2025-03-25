"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, User } from "@/contexts/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { users, fetchUsers, createUser, setCurrentUser, isLoading } = useUser();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const hasInitialized = useRef(false);

  // Fetch users only once when component mounts and users array is empty
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      // Only fetch if we don't have any users yet
      if (users.length === 0 && !isLoading) {
        fetchUsers();
      }
    }
  }, [isLoading]); // Only depend on isLoading to avoid needless fetches

  // Set the first user as selected by default once loaded
  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0]);
    }
  }, [users, selectedUser]);

  const handleLogin = () => {
    if (selectedUser) {
      setCurrentUser(selectedUser);
      router.push("/");
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername.trim()) return;
    
    try {
      setIsCreating(true);
      const user = await createUser(newUsername);
      setSelectedUser(user);
      setNewUsername("");
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome to Soteria</CardTitle>
          <CardDescription>
            Login to access the domain monitoring dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Selection */}
          {users.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Select a user:</h3>
              <div className="grid gap-2">
                {users.map((user) => (
                  <div 
                    key={user.user_id}
                    className={`p-3 border rounded-md cursor-pointer ${
                      selectedUser?.user_id === user.user_id ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="font-medium">{user.username}</div>
                    {/* <div className="text-xs text-muted-foreground">{user.user_id}</div> */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create New User */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Or create a new user:</h3>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={isCreating}
                />
              </div>
              <Button 
                onClick={handleCreateUser} 
                disabled={!newUsername.trim() || isCreating}
                variant="outline"
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleLogin} 
            className="w-full"
            disabled={!selectedUser || isLoading}
          >
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
