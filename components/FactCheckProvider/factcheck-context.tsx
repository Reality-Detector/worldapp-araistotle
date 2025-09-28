"use client";
import React, { createContext, useContext, useState } from "react";

export interface FactCheckResult {
  id: string;
  claim: string;
  result?: any;
  error?: string;
  status?: number;
  timestamp: string;
  sessionId: string;
  taskId?: string;
}

export interface ClaimStatus {
  id: string;
  claim: string;
  status: 'pending' | 'fact-checking' | 'completed' | 'error';
  taskId?: string;
  error?: string;
  timestamp: string;
}

interface FactCheckContextShape {
  results: FactCheckResult[] | null;
  setResults: (r: FactCheckResult[] | null) => void;
  claims: ClaimStatus[] | null;
  setClaims: (c: ClaimStatus[] | null) => void;
  updateClaimStatus: (claimId: string, status: ClaimStatus['status'], error?: string) => void;
}

const FactCheckContext = createContext<FactCheckContextShape | undefined>(undefined);

export const FactCheckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<FactCheckResult[] | null>(null);
  const [claims, setClaims] = useState<ClaimStatus[] | null>(null);

  const updateClaimStatus = (claimId: string, status: ClaimStatus['status'], error?: string) => {
    setClaims(prevClaims => {
      if (!prevClaims) return null;
      return prevClaims.map(claim => 
        claim.id === claimId 
          ? { ...claim, status, error }
          : claim
      );
    });
  };

  return (
    <FactCheckContext.Provider value={{ 
      results, 
      setResults, 
      claims, 
      setClaims, 
      updateClaimStatus 
    }}>
      {children}
    </FactCheckContext.Provider>
  );
};

export function useFactCheck() {
  const ctx = useContext(FactCheckContext);
  if (!ctx) throw new Error("useFactCheck must be used within FactCheckProvider");
  return ctx;
}

export default FactCheckProvider;
