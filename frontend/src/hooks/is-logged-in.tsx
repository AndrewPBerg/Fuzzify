"use client";

// Hook to check if the user is logged in and redirect to the login page if they are not
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useIsLoggedIn() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const currentUser = localStorage.getItem("currentUser");
      if (!currentUser) {
        router.push("/login");
      } else {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return { isLoggedIn, isLoading };
}