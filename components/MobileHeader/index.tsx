"use client";
import { SignIn } from "@/components/SignIn";
import { useCredits } from "@/components/CreditProvider";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export const MobileHeader = () => {
  const { creditData, isLoading, error } = useCredits();
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm">
      <div className="flex items-center justify-end px-4 py-3">
        {/* Credits Display and Sign In Button */}
        <div className="flex items-center space-x-2">
          {/* Credits Display - only show when authenticated */}
          {isAuthenticated && (
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Loading...</span>
                </div>
              ) : error ? (
                <div className="text-xs text-red-500">Error</div>
              ) : creditData ? (
                <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 flex items-center space-x-3">
                  {/* Daily Credits - Gold Coin */}
                  <div className="flex items-center space-x-1">
                    <Image 
                      src="/goldcoin.png" 
                      alt="Daily Credits" 
                      width={16} 
                      height={16}
                      className="flex-shrink-0"
                    />
                    <span className="text-blue-800 font-bold text-xs">{creditData.daily_credits}</span>
                  </div>
                  
                  {/* Lifetime Credits - Teal Diamond */}
                  <div className="flex items-center space-x-1">
                    <Image 
                      src="/diamond.png" 
                      alt="Lifetime Credits" 
                      width={16} 
                      height={16}
                      className="flex-shrink-0"
                    />
                    <span className="text-blue-800 font-bold text-xs">{creditData.lifetime_credits}</span>
                  </div>
                  
                  {/* Pro Status */}
                  {creditData.isPro && (
                    <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium border border-purple-200">
                      <span className="flex items-center space-x-1">
                        <span>⭐</span>
                        <span>PRO</span>
                      </span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
          
          {/* Sign In Button */}
          <SignIn />
        </div>
      </div>
    </header>
  );
};
