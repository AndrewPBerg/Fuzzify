"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { userStorage, useUsers, useCreateUser, useUpdateUserSettings } from "@/lib/api/users";
import Image from "next/image";

// Define settings sections and fields
const settingsSections = [
  {
    id: "account",
    title: "Account",
    description: "Manage your account settings",
    fields: [
      {
        id: "name",
        label: "User Name",
        type: "text",
        description: "Your username displayed in the application"
      },
      {
        id: "apiKey",
        label: "API Key",
        type: "secret",
        description: "Your unique API key for external integrations (uuid4)"
      }
    ]
  },
  {
    id: "Appearance",
    title: "Appearance",
    description: "Manage your appearance settings",
    fields: [
      {
        id: "theme",
        label: "Theme",
        type: "select",
        description: "Select your preferred theme",
        options: [
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" }
        ]
      },
      {
        id: "Horizontal Sidebar",
        label: "Horizontal Sidebar",
        type: "toggle",
        description: "Enable horizontal sidebar navigation"
      }
    ]
  }
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState("account");
  const [showApiKey, setShowApiKey] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "admin@example.com",
    apiKey: "",
    theme: "system",
    "Horizontal Sidebar": isMobile ? true : false
  });

  const { data: users } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserSettingsMutation = useUpdateUserSettings();

  // Update form state with current theme and user data when component mounts
  useEffect(() => {
    const currentUser = userStorage.getCurrentUser();
    
    setFormState(prev => ({
      ...prev,
      theme: theme,
      name: currentUser.username || "Admin User",
      apiKey: currentUser.userId || ""
    }));

    // Initialize horizontal sidebar setting from localStorage
    if (typeof window !== "undefined" && !isMobile) {
      const horizontalSidebarPref = localStorage.getItem("horizontalSidebar");
      setFormState(prev => ({
        ...prev,
        "Horizontal Sidebar": horizontalSidebarPref === "true"
      }));
    }
  }, [theme, isMobile, users]);

  const handleInputChange = (id: string, value: string | boolean) => {
    setFormState(prev => ({
      ...prev,
      [id]: value
    }));

    // Apply theme change immediately
    if (id === "theme") {
      setTheme(value as "light" | "dark" | "system");
    }

    // Apply horizontal sidebar setting immediately
    if (id === "Horizontal Sidebar") {
      localStorage.setItem("horizontalSidebar", String(value));
      // Dispatch a custom event to notify the sidebar component
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("horizontalSidebarChange", { 
          detail: { enabled: value } 
        }));
      }
    }
  };

  const handleSave = async () => {
    try {
      const currentUser = userStorage.getCurrentUser();
      let updatedUsername = formState.name;
      
      if (currentUser.userId) {
        // User exists, update all settings with one call
        const result = await updateUserSettingsMutation.mutateAsync({
          userId: currentUser.userId,
          username: formState.name,
          theme: formState.theme,
          horizontal_sidebar: formState["Horizontal Sidebar"]
        });
        updatedUsername = result.username;
      } else if (formState.name) {
        // New user, create first
        const result = await createUserMutation.mutateAsync(formState.name);
        updatedUsername = result.username;
        
        // Then update settings if we have a user ID after creation
        if (result.user_id) {
          await updateUserSettingsMutation.mutateAsync({
            userId: result.user_id,
            theme: formState.theme,
            horizontal_sidebar: formState["Horizontal Sidebar"]
          });
        }
      }
      
      // Apply theme setting
      if (formState.theme) {
        setTheme(formState.theme as "light" | "dark" | "system");
      }
      
      // Ensure all settings are stored in localStorage
      if (currentUser.userId) {
        userStorage.setCurrentUser(updatedUsername, currentUser.userId);
        
        // Dispatch custom event to notify components of username change
        window.dispatchEvent(new CustomEvent("userUpdate"));
      }
      
      // Store horizontal sidebar preference in localStorage
      localStorage.setItem("horizontalSidebar", String(formState["Horizontal Sidebar"]));
      
      // Show toast notification using Sonner
      toast.success("Settings saved", {
        description: "Your preferences have been updated successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Error saving settings", {
        description: "There was a problem saving your preferences. Please try again.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="page-container relative">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-scale-in">
        {/* Settings navigation */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-4">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeSection === section.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings content */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-xl p-6">
            {settingsSections
              .filter((section) => section.id === activeSection)
              .map((section) => (
                <div key={section.id}>
                  <h2 className="text-lg font-medium flex items-center">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1 mb-6">
                    {section.description}
                  </p>

                  <div className="space-y-6">
                    {section.fields.map((field) => (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div>
                          <label
                            htmlFor={field.id}
                            className="block text-sm font-medium"
                          >
                            {field.label}
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {field.description}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          {field.type === "toggle" && (
                            <button
                              type="button"
                              role="switch"
                              aria-checked={!!formState[field.id as keyof typeof formState]}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                formState[field.id as keyof typeof formState]
                                  ? "bg-primary"
                                  : "bg-muted"
                              }`}
                              onClick={() =>
                                handleInputChange(
                                  field.id,
                                  !formState[field.id as keyof typeof formState]
                                )
                              }
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                                  formState[field.id as keyof typeof formState]
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          )}

                          {field.type === "text" && (
                            <input
                              type="text"
                              id={field.id}
                              value={formState[field.id as keyof typeof formState] as string}
                              onChange={(e) =>
                                handleInputChange(field.id, e.target.value)
                              }
                              className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                          )}

                          {field.type === "secret" && (
                            <div className="relative">
                              <input
                                type={showApiKey ? "text" : "password"}
                                id={field.id}
                                value={formState[field.id as keyof typeof formState] as string}
                                readOnly
                                className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                              />
                              <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showApiKey ? "Hide API key" : "Show API key"}
                              >
                                {showApiKey ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          )}

                          {field.type === "email" && (
                            <input
                              type="email"
                              id={field.id}
                              value={formState[field.id as keyof typeof formState] as string}
                              onChange={(e) =>
                                handleInputChange(field.id, e.target.value)
                              }
                              className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                          )}

                          {field.type === "select" && (
                            <select
                              id={field.id}
                              value={formState[field.id as keyof typeof formState] as string}
                              onChange={(e) =>
                                handleInputChange(field.id, e.target.value)
                              }
                              className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                            >
                              {field.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            <div className="mt-8 pt-6 border-t border-border/50 flex justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* QR Code in bottom right corner */}
      <div className="fixed bottom-6 right-6 z-10">
        <div className="flex flex-col items-center gap-2">
          <Image 
            src="/fuzzify-app-qr.png"
            alt="Fuzzify App QR Code"
            width={420}
            height={420}
            className="rounded-md shadow-lg"
          />
          <p className="text-2xl text-muted-foreground">Scan to Learn More About Fuzzify</p>
        </div>
      </div>
    </div>
  );
} 