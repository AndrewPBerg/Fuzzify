"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReactNode } from "react";

interface AuthCheckProps {
  children: ReactNode;
}

export function AuthCheck({ children }: AuthCheckProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    try {
      const currentUser = localStorage.getItem("currentUser");
      if (!currentUser) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    } finally {
      setIsChecking(false);
    }
  }, [router]);

  // Don't render children until auth check is complete
  if (isChecking) return null;

  return <>{children}</>;
} 