import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Layout } from "@/components/layout/Layout";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { UserProvider } from "@/contexts/UserContext";
import '@/index.css';
import Script from "next/script";
import { AuthCheck } from "@/components/auth/loggedInCheck";

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
      </head>
      <body className="overflow-x-hidden">
        <QueryProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AuthCheck>
                <Layout>
                  {children}
                </Layout>
              </AuthCheck>
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
} 