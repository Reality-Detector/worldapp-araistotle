"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useFactCheckClient } from '@/utils/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useFactCheck, FactCheckResult } from '@/components/FactCheckProvider/factcheck-context';
import { useCredits } from '@/components/CreditProvider';

interface ProgressState {
  currentStep: 'idle' | 'extracting' | 'fact-checking' | 'completed' | 'error';
  currentClaimIndex: number;
  totalClaims: number;
  completedClaims: number;
  message: string;
  error?: string;
  sessionId?: string;
}

export const BottomSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [progress, setProgress] = useState<ProgressState>({
    currentStep: 'idle',
    currentClaimIndex: 0,
    totalClaims: 0,
    completedClaims: 0,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { extractClaim, factCheckSync, addTaskId } = useFactCheckClient();
  const { accessToken, user } = useAuth();
  const { setResults } = useFactCheck();
  const { deductCredits } = useCredits();

  // Input validation
  const validateInput = useCallback((input: string) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return { isValid: false, error: 'Please enter a search query' };
    }
    if (trimmed.length < 3) {
      return { isValid: false, error: 'Query must be at least 3 characters long' };
    }
    if (trimmed.length > 1000) {
      return { isValid: false, error: 'Query is too long (max 1000 characters)' };
    }
    return { isValid: true };
  }, []);

  // Generate unique ID for fact-check sessions
  const generateSessionId = useCallback(() => {
    return `fc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Generate unique ID for individual claims
  const generateClaimId = useCallback((sessionId: string, claimIndex: number) => {
    return `${sessionId}_claim_${claimIndex}`;
  }, []);

  // Extract task_id from fact-check-sync response
  const extractTaskId = useCallback((responseData: any): string | null => {
    try {
      if (responseData && typeof responseData === 'string') {
        const lines = responseData.split(/\n+/).filter(Boolean);
        
        // Find the final field which contains the task_id
        const finalLine = lines.reverse().find((line: string) => {
          try {
            const obj = JSON.parse(line);
            return obj.final;
          } catch { return false; }
        });
        
        if (finalLine) {
          const obj = JSON.parse(finalLine);
          const finalObj = JSON.parse(obj.final);
          return finalObj.task_id || null;
        }
      }
      return null;
    } catch (error) {
      console.warn('Error extracting task_id:', error);
      return null;
    }
  }, []);

  // Reset progress state
  const resetProgress = useCallback(() => {
    setProgress({
      currentStep: 'idle',
      currentClaimIndex: 0,
      totalClaims: 0,
      completedClaims: 0,
      message: ''
    });
    setResults(null);
  }, [setResults]);

  // Cancel current operation
  const cancelOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setIsSubmitting(false);
    resetProgress();
  }, [resetProgress]);

  // Debounced input handler for better performance
  const handleInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Reset progress if user is typing
    if (progress.currentStep !== 'idle') {
      debounceTimeoutRef.current = setTimeout(() => {
        resetProgress();
      }, 1000);
    }
  }, [progress.currentStep, resetProgress]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSubmitting) {
        cancelOperation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Cleanup timeouts on unmount
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [isSubmitting, cancelOperation]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = validateInput(searchQuery);
    if (!validation.isValid) {
      setProgress(prev => ({
        ...prev,
        currentStep: 'error',
        message: validation.error!
      }));
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);
    const sessionId = generateSessionId();
    setProgress({
      currentStep: 'extracting',
      currentClaimIndex: 0,
      totalClaims: 0,
      completedClaims: 0,
      message: 'Starting claim extraction...',
      sessionId
    });

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const extractPayload = {
        query: searchQuery.trim(),
        timestamp: false,
        claim_extraction: true
      };

      const extractRes = await extractClaim(extractPayload);

      if (!extractRes.success) {
        throw new Error(extractRes.error || 'Failed to extract claims');
      }

      const claims = extractRes.data?.claims || [];
      if (!claims.length) {
        setProgress({
          currentStep: 'completed',
          currentClaimIndex: 0,
          totalClaims: 0,
          completedClaims: 0,
          message: 'No claims found for the query. Try rephrasing your question.'
        });
        return;
      }

      setProgress(prev => ({
        ...prev,
        currentStep: 'fact-checking',
        totalClaims: claims.length,
        message: `Found ${claims.length} claim${claims.length > 1 ? 's' : ''} — starting fact-checking...`
      }));

      // Process claims with better progress tracking and parallel processing for better performance
      const accumulated: FactCheckResult[] = [];
      
      // Process claims in batches for better performance
      const batchSize = 3; // Process up to 3 claims in parallel
      for (let i = 0; i < claims.length; i += batchSize) {
        // Check if operation was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Operation cancelled');
        }

        const batch = claims.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (claim: any, batchIndex: number) => {
          const claimIndex = i + batchIndex;
          const claimText = typeof claim === 'string' ? claim : claim?.text || claim?.claim || '';
          const claimId = generateClaimId(sessionId, claimIndex);

          const body = {
            deployment_mode: 'frontend2',
            is_longcheck: false,
            location: 'location',
            mode: 'sync',
            query: claimText || searchQuery,
            requester_url: 'https://araistotle.facticity.ai',
            source: '',
            source_find_mode: false,
            speaker: claim?.speaker || 'speaker',
            timeout: 120,
            timestamp: new Date().toISOString(),
            userEmail: user?.name,
            version: 'basic'
          };

          try {
            const fcRes = await factCheckSync(body);
            
            // Extract task_id from the response
            let taskId: string | null = null;
            if (fcRes.success && fcRes.data) {
              taskId = extractTaskId(fcRes.data);
              
              // Call add_task_id endpoint if task_id is found
              if (taskId && accessToken) {
                try {
                  const addTaskIdRes = await addTaskId(sessionId, taskId);
                  if (addTaskIdRes.success) {
                    console.log('Successfully added task_id:', taskId, 'for session:', sessionId);
                  } else {
                    console.warn('Failed to add task_id:', addTaskIdRes.error);
                  }
                } catch (addTaskIdError) {
                  console.warn('Error calling add_task_id:', addTaskIdError);
                }
              }
            }
            
            return {
              id: claimId,
              claim: claimText,
              result: fcRes.success ? fcRes.data : null,
              error: fcRes.success ? null : fcRes.error,
              status: fcRes.status,
              success: fcRes.success,
              timestamp: new Date().toISOString(),
              sessionId,
              taskId
            };
          } catch (claimError) {
            return {
              id: claimId,
              claim: claimText,
              result: null,
              error: claimError instanceof Error ? claimError.message : 'Unknown error',
              status: 0,
              success: false,
              timestamp: new Date().toISOString(),
              sessionId,
              taskId: null
            };
          }
        });

        // Wait for batch to complete
        const batchResults = await Promise.all(batchPromises);
        
        // Add results to accumulated array
        batchResults.forEach(result => {
          if (result.success) {
            accumulated.push({ 
              id: result.id,
              claim: result.claim, 
              result: result.result,
              timestamp: result.timestamp,
              sessionId: result.sessionId,
              taskId: result.taskId
            });
            // Deduct 5 credits for each successful fact check (UI only)
            deductCredits(5);
          } else {
            accumulated.push({ 
              id: result.id,
              claim: result.claim, 
              error: result.error, 
              status: result.status,
              timestamp: result.timestamp,
              sessionId: result.sessionId,
              taskId: result.taskId
            });
          }
        });

        // Update progress
        setProgress(prev => ({
          ...prev,
          currentClaimIndex: Math.min(i + batchSize, claims.length),
          completedClaims: Math.min(i + batchSize, claims.length),
          message: `Fact-checking claim ${Math.min(i + batchSize, claims.length)} of ${claims.length}...`
        }));

        // Update results in real-time
        setResults([...accumulated]);
      }

      setProgress(prev => ({
        ...prev,
        currentStep: 'completed',
        message: `Fact-checking complete! Processed ${accumulated.length} claim${accumulated.length > 1 ? 's' : ''}.`
      }));

    } catch (err) {
      console.error('Error during fact-check flow', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      setProgress(prev => ({
        ...prev,
        currentStep: 'error',
        message: errorMessage,
        error: errorMessage
      }));
    } finally {
      setIsSubmitting(false);
      abortControllerRef.current = null;
    }
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    if (progress.totalClaims === 0) return 0;
    return Math.round((progress.completedClaims / progress.totalClaims) * 100);
  };

  // Get status color based on current step
  const getStatusColor = () => {
    switch (progress.currentStep) {
      case 'extracting':
        return 'text-blue-600';
      case 'fact-checking':
        return 'text-yellow-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (progress.currentStep) {
      case 'extracting':
        return (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          </svg>
        );
      case 'fact-checking':
        return (
          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-200 shadow-lg z-20">
      <div className="p-4 pb-6">
        <form onSubmit={handleSearch} className="flex items-center space-x-3">
          {/* Search Icon */}
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Ask a question, paste a YouTube/TikTok/Instagram link, or make a claim..."
            disabled={isSubmitting}
            className={`flex-1 px-4 py-4 border-2 rounded-xl text-base placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              progress.currentStep === 'error' 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-blue-200 bg-blue-50 focus:ring-blue-500 focus:border-blue-500'
            } ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          />
          
          {/* Action Button */}
          <div className="flex items-center space-x-2">
            {isSubmitting && (
              <button
                type="button"
                onClick={cancelOperation}
                className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                title="Cancel (Esc)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || !searchQuery.trim()}
              className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white p-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Progress and Status Messages */}
        {progress.message && (
          <div className="mt-3 space-y-2">
            {/* Progress Bar */}
            {progress.currentStep === 'fact-checking' && progress.totalClaims > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            )}

            {/* Status Message */}
            <div className={`flex items-center space-x-2 text-sm ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="flex-1">{progress.message}</span>
              
              {/* Progress Counter */}
              {progress.currentStep === 'fact-checking' && progress.totalClaims > 0 && (
                <span className="text-xs text-gray-500">
                  {progress.completedClaims}/{progress.totalClaims}
                </span>
              )}
            </div>

            {/* Error Details */}
            {progress.currentStep === 'error' && progress.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">Error occurred</p>
                    <p className="text-xs text-red-600 mt-1">{progress.error}</p>
                    <button
                      onClick={resetProgress}
                      className="mt-2 text-xs text-red-700 hover:text-red-800 underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {progress.currentStep === 'completed' && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="flex-1">
                    <span className="text-sm text-green-800">All done! Check the results above.</span>
                    {progress.sessionId && (
                      <div className="mt-1 text-xs text-green-600">
                        Session ID: <code className="bg-green-100 px-1 py-0.5 rounded text-green-800">{progress.sessionId}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        {!isSubmitting && (
          <div className="mt-2 text-xs text-gray-400 text-center">
            Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600">Enter</kbd> to search, 
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600 ml-1">Esc</kbd> to cancel
          </div>
        )}
      </div>
    </div>
  );
};
