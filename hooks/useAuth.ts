"use client";
import { useSession } from "next-auth/react";

export const useAuth = () => {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user || null,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    isSignedIn: !!session,
    session,
    accessToken: session?.accessToken || null,
  };
};
