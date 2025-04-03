"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, RefreshCw, Loader2, Trash2, AlertTriangle, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { userStorage } from "@/lib/api/users";
import { useSchedules, useCreateSchedule, useDeleteSchedules, useUpdateSchedule, Schedule } from "@/lib/api/schedule";

const scheduleOptions = [
  { id: "hourly", label: "Hourly", icon: Clock, hours: 1 },
  { id: "daily", label: "Daily (24 hours)", icon: Calendar, hours: 24 },
  { id: "weekly", label: "Weekly", icon: Calendar, hours: 168 },
  { id: "custom", label: "Custom", icon: Calendar },
];

export default function SchedulePage() {
  const { userId } = userStorage.getCurrentUser();
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState("daily");
  const [customHours, setCustomHours] = useState(24);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [domainRoots, setDomainRoots] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem("domainRoots") || "[]");
    }
    return [];
  });

  // Query hooks
  const { 
    data: schedules = [], 
    isLoading: schedulesLoading,
    error: schedulesError 
  } = useSchedules(userId);
  const createScheduleMutation = useCreateSchedule();
  const deleteSchedulesMutation = useDeleteSchedules();
  const updateScheduleMutation = useUpdateSchedule();

  // Effect to listen for domain roots changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedRoots = JSON.parse(localStorage.getItem("domainRoots") || "[]");
      setDomainRoots(updatedRoots);
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleDomainToggle = (domain: string) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain) 
        : [...prev, domain]
    );
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedDomains.length === 0) {
      toast.error("Error", {
        description: "Please select at least one domain root",
      });
      return;
    }

    const hours = scheduleType === "custom" 
      ? customHours 
      : scheduleOptions.find(opt => opt.id === scheduleType)?.hours || 24;

    try {
      await createScheduleMutation.mutateAsync({
        userId,
        hours,
        domain_names: selectedDomains
      });
      setSelectedDomains([]);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error("Error creating schedule:", error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteSchedulesMutation.mutateAsync({
        userId,
        schedule_ids: [scheduleId]
      });
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  const handleStartEditing = (schedule: Schedule) => {
    setEditingScheduleId(schedule.schedule_id);
    setEditingName(schedule.schedule_name);
  };

  const handleCancelEditing = () => {
    setEditingScheduleId(null);
    setEditingName("");
  };

  const handleUpdateScheduleName = async (scheduleId: string) => {
    if (!editingName.trim()) {
      toast.error("Error", {
        description: "Schedule name cannot be empty",
      });
      return;
    }

    try {
      await updateScheduleMutation.mutateAsync({
        userId,
        schedule_id: scheduleId,
        schedule_name: editingName.trim()
      });
      setEditingScheduleId(null);
      setEditingName("");
    } catch (error) {
      console.error("Error updating schedule name:", error);
    }
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
                          ? "bg-primary/10 text-primary border-primary" 
                          : domainRoots.length === 0
                            ? "border-border/30 bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                            : "border-border/50 bg-background/50 hover:bg-background text-foreground"
                      }`}
                      onClick={() => domainRoots.length > 0 && setScheduleType(option.id)}
                      disabled={domainRoots.length === 0}
                    >
                      <option.icon size={16} className={domainRoots.length === 0 ? "opacity-50" : ""} />
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
                    className={`w-full ${domainRoots.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={domainRoots.length === 0}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 hour</span>
                    <span>1 week (168 hours)</span>
                  </div>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={domainRoots.length === 0 || createScheduleMutation.isPending}
              >
                {createScheduleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Schedule...
                  </>
                ) : domainRoots.length === 0 ? (
                  "No Domain Roots Available"
                ) : (
                  "Create Schedule"
                )}
              </Button>
            </form>
          </div>
        </div>
        
        {/* Scheduled jobs */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-lg shadow-sm">
            <div className="p-4 border-b border-border/50">
              <h2 className="text-lg font-medium">Active Schedules</h2>
            </div>
            
            {schedulesLoading ? (
              <div className="p-6 text-center">
                <Loader2 className="mx-auto h-8 w-8 mb-2 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading schedules...</p>
              </div>
            ) : schedulesError ? (
              <div className="p-6 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2 text-destructive" />
                <p className="text-muted-foreground">Error loading schedules. Please try again.</p>
              </div>
            ) : schedules.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <RefreshCw className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No scheduled jobs yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {schedules.map(schedule => (
                  <div key={schedule.schedule_id} className="p-4 hover:bg-muted/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        {editingScheduleId === schedule.schedule_id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-8 w-[200px]"
                              placeholder="Enter schedule name"
                              autoFocus
                            />
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleUpdateScheduleName(schedule.schedule_id)}
                                disabled={updateScheduleMutation.isPending}
                              >
                                {updateScheduleMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                onClick={handleCancelEditing}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{schedule.schedule_name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => handleStartEditing(schedule)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          Next run: {schedule.next_scan ? new Date(schedule.next_scan).toLocaleString() : 'Not scheduled'}
                        </p>
                        <div className="mt-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {schedule.domain_name}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteSchedule(schedule.schedule_id)}
                        disabled={deleteSchedulesMutation.isPending}
                      >
                        {deleteSchedulesMutation.isPending && 
                         deleteSchedulesMutation.variables?.schedule_ids.includes(schedule.schedule_id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
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