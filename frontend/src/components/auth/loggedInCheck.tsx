"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ReactNode } from "react";

interface AuthCheckProps {
  children: ReactNode;
}

export function AuthCheck({ children }: AuthCheckProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    try {
      const currentUser = localStorage.getItem("currentUser");
      if (!currentUser && pathname !== "/login") {
        router.push("/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      if (pathname !== "/login") {
        router.push("/login");
      }
    } finally {
      setIsChecking(false);
    }
  }, [router, pathname]);

  // Show a loading indicator instead of null while checking
  // if (isChecking) {
  //   return <div className="w-full h-full flex items-center justify-center">Loading...</div>;
  // }

  return <>{children}</>;
} 