"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Demo users for the login screen
const DEMO_USERS = [
  { id: "user123", name: "Admin User", role: "Administrator" },
  { id: "user456", name: "Test User", role: "Regular User" },
  { id: "user789", name: "Guest User", role: "Guest" },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(DEMO_USERS[0]);

  const handleLogin = () => {
    // Store in localStorage for demo purposes
    localStorage.setItem("currentUser", selectedUser.id);
    
    // Redirect to the homepage
    router.push("/");
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Select a user:</h3>
            <div className="grid gap-2">
              {DEMO_USERS.map((user) => (
                <div 
                  key={user.id}
                  className={`p-3 border rounded-md cursor-pointer ${
                    selectedUser.id === user.id ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.role}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
