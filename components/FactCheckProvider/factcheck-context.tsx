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

interface FactCheckContextShape {
  results: FactCheckResult[] | null;
  setResults: (r: FactCheckResult[] | null) => void;
}

const FactCheckContext = createContext<FactCheckContextShape | undefined>(undefined);

export const FactCheckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<FactCheckResult[] | null>(null);

  return (
    <FactCheckContext.Provider value={{ results, setResults }}>
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
