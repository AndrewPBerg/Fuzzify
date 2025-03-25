import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Layout } from "@/components/layout/Layout";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { UserProvider } from "@/contexts/UserContext";
import '@/index.css';
import Script from "next/script";

export const metadata = {
  title: 'Settings Hub',
  description: 'A modern web application for managing domain settings and monitoring',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Get saved theme from localStorage
                const savedTheme = localStorage.getItem('ui-theme');
                
                // If the user has explicitly set a theme, apply it immediately
                if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (savedTheme === 'system') {
                  // Check system preference
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (systemPrefersDark) {
                    document.documentElement.classList.add('dark');
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className="overflow-x-hidden">
        <QueryProvider>
          <ThemeProvider>
            <TooltipProvider>
              <UserProvider>
                <Toaster />
                <Sonner />
                <Layout>
                  {children}
                </Layout>
              </UserProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
} 