"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { checkCreditsUtil, CreditData } from '@/utils/apiClient';

interface CreditContextType {
  creditData: CreditData | null;
  isLoading: boolean;
  error: string | null;
  refetchCredits: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

interface CreditProviderProps {
  children: ReactNode;
}

export const CreditProvider: React.FC<CreditProviderProps> = ({ children }) => {
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, accessToken } = useAuth();

  const fetchCredits = async () => {
    if (!isAuthenticated || !accessToken || !user?.name) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletId = user.name; // Using user.name as wallet_id
      console.log('Fetching credits for wallet:', walletId);
      
      const result = await checkCreditsUtil(walletId, accessToken);
      
      if (result.success && result.data) {
        console.log('=== CREDITS SUCCESS ===');
        console.log('Credit data:', result.data);
        console.log('=====================');
        setCreditData(result.data);
      } else {
        console.error('=== CREDITS ERROR ===');
        console.error('Error fetching credits:', result.error);
        console.error('Status:', result.status);
        console.error('====================');
        setError(result.error || 'Failed to fetch credits');
      }
    } catch (error) {
      console.error('=== CREDITS EXCEPTION ===');
      console.error('Exception fetching credits:', error);
      console.error('=========================');
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const refetchCredits = async () => {
    await fetchCredits();
  };

  // Fetch credits when user is authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken && user?.name && !creditData && !isLoading) {
      fetchCredits();
    }
  }, [isAuthenticated, accessToken, user?.name]);

  const value: CreditContextType = {
    creditData,
    isLoading,
    error,
    refetchCredits,
  };

  return (
    <CreditContext.Provider value={value}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredits = (): CreditContextType => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
};
