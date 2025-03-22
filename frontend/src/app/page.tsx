"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { Globe, Server, User, Shield, AlertTriangle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function HomePage() {
  const router = useRouter();
  const { currentUser, isLoading } = useUser();
  const hasRedirected = useRef(false);

  // Redirect to login page if not logged in, but only once
  useEffect(() => {
    if (!isLoading && !currentUser && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push("/login");
    }
  }, [currentUser, isLoading, router]);

  // Show nothing during initial load to avoid flash
  if (isLoading) {
    return <div className="page-container">Loading...</div>;
  }

  // Don't render content if not logged in
  if (!currentUser) {
    return null;
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {currentUser.username}! Here's your domain monitoring overview.
        </p>
      </div>

      {/* Alerts */}
      <div className="mb-8 space-y-4">
        <AlertBanner
          severity="error"
          title="Critical Security Issue"
          message="3 domains have expired SSL certificates. Immediate action required."
        />
        <AlertBanner
          severity="warning"
          title="Performance Warning"
          message="Response time for api-gateway.cloud has increased by 25% in the last hour."
        />
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatusCard
          title="Total Domains"
          value="42"
          icon={<Globe size={18} />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatusCard
          title="Active Servers"
          value="16"
          icon={<Server size={18} />}
          trend={{ value: 3, isPositive: true }}
        />
        <StatusCard
          title="Users"
          value="8"
          icon={<User size={18} />}
          trend={{ value: 0, isPositive: true }}
        />
        <StatusCard
          title="Security Alerts"
          value="3"
          icon={<Shield size={18} />}
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      {/* Recent issues */}
      <div className="glass-card rounded-xl p-6 animate-scale-in">
        <h2 className="text-lg font-medium mb-4">Recent Issues</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="flex gap-3 pb-4 border-b border-border/40 last:border-0 last:pb-0"
            >
              <div className="p-1.5 bg-muted rounded-full h-fit">
                <AlertTriangle size={16} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium">
                  {i === 1 ? "SSL Certificate Expiring" : 
                   i === 2 ? "DNS Configuration Issue" : "High Server Load"}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {i === 1 ? "The SSL certificate for example.com expires in 5 days" : 
                   i === 2 ? "Missing DKIM record for test-domain.com" : "CPU usage above 90% on api-gateway.cloud"}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {i === 1 ? "Security" : i === 2 ? "Configuration" : "Performance"}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {i === 1 ? "example.com" : i === 2 ? "test-domain.com" : "api-gateway.cloud"}
                  </span>
                </div>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                {i === 1 ? "2h ago" : i === 2 ? "5h ago" : "8h ago"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 