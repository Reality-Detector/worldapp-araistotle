"use client";
import React from 'react';

export interface ClaimStatus {
  id: string;
  claim: string;
  status: 'pending' | 'fact-checking' | 'completed' | 'error';
  taskId?: string;
  error?: string;
  timestamp: string;
}

interface ClaimsVisualizationProps {
  claims: ClaimStatus[];
  onClaimClick?: (claimId: string) => void;
}

export const ClaimsVisualization: React.FC<ClaimsVisualizationProps> = ({
  claims,
  onClaimClick
}) => {
  const getStatusColor = (status: ClaimStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'fact-checking':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: ClaimStatus['status']) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'fact-checking':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
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

  const getStatusText = (status: ClaimStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'fact-checking':
        return 'Fact-checking...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getStatusCounts = () => {
    return claims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="bg-white rounded-xl p-6 mb-8 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Extracted Claims ({claims.length})
        </h3>
        
        {/* Status Summary */}
        <div className="flex space-x-2 text-sm">
          {statusCounts.pending > 0 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-300">
              {statusCounts.pending} Pending
            </span>
          )}
          {statusCounts['fact-checking'] > 0 && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-300">
              {statusCounts['fact-checking']} Checking
            </span>
          )}
          {statusCounts.completed > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full border border-green-300">
              {statusCounts.completed} Completed
            </span>
          )}
          {statusCounts.error > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full border border-red-300">
              {statusCounts.error} Error
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {claims.map((claim, index) => (
          <div
            key={claim.id}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              onClaimClick ? 'cursor-pointer hover:shadow-md' : ''
            } ${getStatusColor(claim.status)}`}
            onClick={() => onClaimClick?.(claim.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Claim {index + 1}:
                  </span>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border ${getStatusColor(claim.status)}`}>
                    {getStatusIcon(claim.status)}
                    <span className="text-xs font-semibold">
                      {getStatusText(claim.status)}
                    </span>
                  </div>
                </div>
                <div className="text-gray-900 text-sm leading-relaxed">
                  {claim.claim}
                </div>
                {claim.error && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    <strong>Error:</strong> {claim.error}
                  </div>
                )}
              </div>
              
              {/* Progress indicator for fact-checking */}
              {claim.status === 'fact-checking' && (
                <div className="ml-4 flex-shrink-0">
                  <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {claims.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>
              {statusCounts.completed || 0} of {claims.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${claims.length > 0 ? ((statusCounts.completed || 0) / claims.length) * 100 : 0}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsVisualization;
