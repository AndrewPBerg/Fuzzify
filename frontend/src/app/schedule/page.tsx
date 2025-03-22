"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { useDomains } from "@/hooks/useDomains";
import { useUser } from "@/contexts/UserContext";
import { triggerDomainUpdate } from "@/components/domains/DomainRootsList";

// Import DOMAIN_UPDATED_EVENT from DomainRootsList or define it here
const DOMAIN_UPDATED_EVENT = "domain-list-updated";

const scheduleOptions = [
  { id: "hourly", label: "Hourly", icon: Clock },
  { id: "daily", label: "Daily (24 hours)", icon: Calendar },
  { id: "weekly", label: "Weekly", icon: Calendar },
  { id: "custom", label: "Custom", icon: Calendar },
];

export default function SchedulePage() {
  const { currentUser } = useUser();
  const { domains, isLoading, error, fetchDomains } = useDomains();
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState("daily");
  const [customHours, setCustomHours] = useState(24);
  const [schedules, setSchedules] = useState<any[]>([]);
  
  // Rate limiting - define the ref outside useEffect to persist between renders
  const lastFetchTimeRef = useRef<number>(0);

  // Fetch domains when component mounts or user changes
  useEffect(() => {
    console.log("SchedulePage: Fetching domains for user", currentUser?.user_id);
    
    if (currentUser) {
      const currentTime = Date.now();
      const timeSinceLastFetch = currentTime - lastFetchTimeRef.current;
      
      // Only fetch if it's been more than 2 seconds since last fetch
      if (timeSinceLastFetch > 2000) {
        console.log(`SchedulePage: Making API call (${timeSinceLastFetch}ms since last call)`);
        fetchDomains();
        lastFetchTimeRef.current = currentTime;
      } else {
        console.log(`SchedulePage: Rate limiting applied, skipping fetch (only ${timeSinceLastFetch}ms since last call)`);
      }
      
      // Timeout safety to prevent infinite loading state
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn("SchedulePage: Loading timeout triggered - resetting loading state");
          // This will force the component to render the empty state instead of loading indefinitely
          triggerDomainUpdate();
        }
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timeoutId);
    }
    
    // Get saved schedules from localStorage
    const storedSchedules = JSON.parse(localStorage.getItem("domainSchedules") || "[]");
    setSchedules(storedSchedules);
  }, [currentUser, fetchDomains, isLoading]);
  
  // Listen for domain update events
  useEffect(() => {
    const handleDomainUpdate = () => {
      console.log("SchedulePage: Detected domain update event, refreshing...");
      const currentTime = Date.now();
      
      // Apply rate limiting for event-triggered refreshes too
      if (currentTime - lastFetchTimeRef.current > 2000) {
        fetchDomains();
        lastFetchTimeRef.current = currentTime;
      } else {
        console.log("SchedulePage: Rate limiting applied to event update");
      }
    };
    
    // Custom domain update events
    window.addEventListener(DOMAIN_UPDATED_EVENT, handleDomainUpdate);
    
    // Legacy storage events
    window.addEventListener("storage", handleDomainUpdate);
    
    return () => {
      window.removeEventListener(DOMAIN_UPDATED_EVENT, handleDomainUpdate);
      window.removeEventListener("storage", handleDomainUpdate);
    };
  }, [fetchDomains]);

  // Debug domains data whenever it changes
  useEffect(() => {
    if (domains) {
      console.log("SchedulePage: Domains data updated:", { 
        count: domains.length,
        isArray: Array.isArray(domains)
      });
    }
  }, [domains]);

  const handleDomainToggle = (domain: string) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain) 
        : [...prev, domain]
    );
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedDomains.length === 0) {
      alert("Please select at least one domain root");
      return;
    }
    
    const newSchedule = {
      id: Date.now().toString(),
      domains: selectedDomains,
      type: scheduleType,
      customHours: scheduleType === "custom" ? customHours : null,
      createdAt: new Date().toISOString(),
      nextRun: getNextRunTime(scheduleType, customHours),
    };
    
    const updatedSchedules = [...schedules, newSchedule];
    localStorage.setItem("domainSchedules", JSON.stringify(updatedSchedules));
    setSchedules(updatedSchedules);
    setSelectedDomains([]);
  };

  const getNextRunTime = (type: string, hours: number = 0) => {
    const now = new Date();
    
    switch (type) {
      case "hourly":
        now.setHours(now.getHours() + 1);
        break;
      case "daily":
        now.setHours(now.getHours() + 24);
        break;
      case "weekly":
        now.setDate(now.getDate() + 7);
        break;
      case "custom":
        now.setHours(now.getHours() + hours);
        break;
    }
    
    return now.toISOString();
  };

  const deleteSchedule = (id: string) => {
    const updatedSchedules = schedules.filter(schedule => schedule.id !== id);
    localStorage.setItem("domainSchedules", JSON.stringify(updatedSchedules));
    setSchedules(updatedSchedules);
  };

  // Get domain names from domain objects
  const getDomainNames = () => {
    if (!domains || !Array.isArray(domains)) return [];
    return domains.map(domain => 
      typeof domain === 'string' ? domain : domain.domain_name
    ).filter(Boolean);
  };

  const domainNames = getDomainNames();
  const hasDomains = domainNames.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading domain data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-container flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <h2 className="text-lg font-medium mb-2">Error Loading Domains</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Job Scheduler</h1>
        <p className="text-muted-foreground mt-1">
          Schedule monitoring jobs for your saved domain roots
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-scale-in">
        {/* Schedule form */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Create New Schedule</h2>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              {/* Domain selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Domain Roots</label>
                {!hasDomains ? (
                  <p className="text-sm text-muted-foreground">
                    No domain roots available. Please add some on the Domains page.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-border/50 rounded-md bg-background/50">
                    {domainNames.map(domain => (
                      <div key={domain} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`domain-${domain}`}
                          checked={selectedDomains.includes(domain)}
                          onChange={() => handleDomainToggle(domain)}
                          className="mr-2"
                        />
                        <label htmlFor={`domain-${domain}`} className="text-sm">
                          {domain}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Schedule type */}
              <div>
                <label className="block text-sm font-medium mb-2">Schedule Frequency</label>
                <div className="grid grid-cols-2 gap-2">
                  {scheduleOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      className={`flex items-center justify-center gap-2 p-2 rounded-md border ${
                        scheduleType === option.id 
                          ? "bg-primary/10 text-primary border-primary" 
                          : !hasDomains
                            ? "border-border/30 bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                            : "border-border/50 bg-background/50 hover:bg-background text-foreground"
                      }`}
                      onClick={() => hasDomains && setScheduleType(option.id)}
                      disabled={!hasDomains}
                    >
                      <option.icon size={16} className={!hasDomains ? "opacity-50" : ""} />
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Custom hours */}
              {scheduleType === "custom" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Custom Hours: {customHours}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="168"
                    value={customHours}
                    onChange={(e) => setCustomHours(parseInt(e.target.value))}
                    className={`w-full ${!hasDomains ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={!hasDomains}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 hour</span>
                    <span>1 week (168 hours)</span>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !hasDomains
                    ? "bg-primary/50 text-primary-foreground/70 cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                disabled={!hasDomains}
              >
                {!hasDomains ? "No Domain Roots Available" : "Create Schedule"}
              </button>
            </form>
          </div>
        </div>
        
        {/* Scheduled jobs */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-lg shadow-sm">
            <div className="p-4 border-b border-border/50">
              <h2 className="text-lg font-medium">Active Schedules</h2>
            </div>
            
            {schedules.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <RefreshCw className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No scheduled jobs yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {schedules.map(schedule => (
                  <div key={schedule.id} className="p-4 hover:bg-muted/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1)} Schedule
                          {schedule.type === "custom" && ` (${schedule.customHours} hours)`}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Next run: {new Date(schedule.nextRun).toLocaleString()}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {schedule.domains.map((domain: string) => (
                            <span 
                              key={domain} 
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                            >
                              {domain}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSchedule(schedule.id)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 