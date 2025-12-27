// components/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { setupTokenRefresh } from "@/lib/api";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    
    if (user) {
      console.log('User logged in, starting token refresh timer...');
      // Setup refresh timer (15 minutes = 900 seconds)
      setupTokenRefresh(900);
    }
    
  }, []);

  return <>{children}</>;
}
