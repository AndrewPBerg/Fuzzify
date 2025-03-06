"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, RefreshCw } from "lucide-react";

const scheduleOptions = [
  { id: "hourly", label: "Hourly", icon: Clock },
  { id: "daily", label: "Daily (24 hours)", icon: Calendar },
  { id: "weekly", label: "Weekly", icon: Calendar },
  { id: "custom", label: "Custom", icon: Calendar },
];

export default function SchedulePage() {
  const [domainRoots, setDomainRoots] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState("daily");
  const [customHours, setCustomHours] = useState(24);
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    const storedRoots = JSON.parse(localStorage.getItem("domainRoots") || "[]");
    setDomainRoots(storedRoots);
    
    const storedSchedules = JSON.parse(localStorage.getItem("domainSchedules") || "[]");
    setSchedules(storedSchedules);
  }, []);

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
                {domainRoots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No domain roots available. Please add some on the Domains page.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-border/50 rounded-md bg-background/50">
                    {domainRoots.map(domain => (
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
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-border/50 bg-background/50 hover:bg-background"
                      }`}
                      onClick={() => setScheduleType(option.id)}
                    >
                      <option.icon size={16} />
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
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 hour</span>
                    <span>1 week (168 hours)</span>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                disabled={domainRoots.length === 0}
              >
                Create Schedule
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