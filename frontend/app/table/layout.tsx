"use client";

import { ThemeProvider } from "next-themes";

export default function DomainsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold mb-8">Domain Permutations</h1>
        {children}
      </div>
    </ThemeProvider>
  );
}