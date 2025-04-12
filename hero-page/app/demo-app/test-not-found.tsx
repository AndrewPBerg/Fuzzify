"use client";

import { useEffect } from "react";
import { notFound } from "next/navigation";

export default function TestNotFoundPage() {
  useEffect(() => {
    // This will trigger the not-found.tsx component in demo-app
    notFound();
  }, []);
  
  // This won't be shown as notFound() redirects
  return <div>This content won't be displayed</div>;
} 