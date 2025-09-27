"use client";
import { signIn, signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";

export const SignIn = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <div className="text-xs text-gray-600 hidden sm:block">
          {user?.name?.slice(0, 10)}
        </div>
        <button 
          onClick={() => signOut()}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Sign Out
        </button>
      </div>
    );
  } else {
    return (
      <button 
        onClick={() => signIn("worldcoin")}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Sign In
      </button>
    );
  }
};
