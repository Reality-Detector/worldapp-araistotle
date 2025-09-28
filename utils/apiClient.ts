"use client";
import { useAuth } from '@/hooks/useAuth';

export interface ApiResponse<T = any> {
  data?: T | null;
  error?: string | null;
  status: number;
  success: boolean;
}

interface PostRequestOptions {
  payload: any;
  endpoint: string;
  baseUrl?: string;
}

interface GetRequestOptions {
  endpoint: string;
  queryParams?: Record<string, string>;
  baseUrl?: string;
}

/**
 * Hook for sending POST requests to the backend with preset headers
 * Automatically gets access token from useAuth
 * @returns Object with postToBackend function
 */
export function useApiClient() {
  const { accessToken } = useAuth();

  const postToBackend = async <T = any>({
    payload,
    endpoint,
    baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://r8wncu74i2.us-west-2.awsapprunner.com'
  }: PostRequestOptions): Promise<ApiResponse<T>> => {
    if (!accessToken) {
      return {
        data: null,
        error: 'No access token available. Please sign in.',
        status: 401,
        success: false
      };
    }
    try {
        const url = `${baseUrl}${endpoint}`;
        console.debug('[apiClient] POST ->', url, { payload, endpoint });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Validator': 'worldapp',
          'Frontend': 'worldapp'
        },
        body: JSON.stringify(payload)
      });

        const text = await response.text();
        let responseData: any = null;
        try { responseData = JSON.parse(text); } catch { responseData = text; }
        console.debug('[apiClient] POST <-', url, { status: response.status, body: responseData });

      if (!response.ok) {
        return {
          data: null,
          error: responseData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          success: false
        };
      }

      return {
        data: responseData,
        error: null,
        status: response.status,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 0,
        success: false
      };
    }
  };

  const getFromBackend = async <T = any>({
    endpoint,
    queryParams = {},
    baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://r8wncu74i2.us-west-2.awsapprunner.com'
  }: GetRequestOptions): Promise<ApiResponse<T>> => {
    if (!accessToken) {
      return {
        data: null,
        error: 'No access token available. Please sign in.',
        status: 401,
        success: false
      };
    }
    try {
      const url = new URL(`${baseUrl}${endpoint}`);
      
      // Add query parameters
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Validator': 'worldapp',
          'Frontend': 'worldapp'
        }
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: responseData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          success: false
        };
      }

      return {
        data: responseData,
        error: null,
        status: response.status,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 0,
        success: false
      };
    }
  };

  return { postToBackend, getFromBackend };
}

/**
 * Direct function for making POST requests with a provided access token
 * Useful when you have the token from outside the auth context
 * @param payload - Data to send in the request body
 * @param endpoint - API endpoint (e.g., '/api/users', '/api/payments')
 * @param accessToken - Access token for authentication
 * @returns Promise<ApiResponse<T>> - Response data or error information
 */
export async function sendAuthenticatedPost<T = any>(
  payload: any,
  endpoint: string,
  accessToken: string
): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://r8wncu74i2.us-west-2.awsapprunner.com';
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Validator': 'worldapp',
        'Frontend': 'worldapp'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: responseData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        success: false
      };
    }

    return {
      data: responseData,
      error: null,
      status: response.status,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      status: 0,
      success: false
    };
  }
}

/**
 * Direct function for making GET requests with a provided access token
 * Useful when you have the token from outside the auth context
 * @param endpoint - API endpoint (e.g., '/api/users', '/get-user-web3')
 * @param queryParams - Query parameters as key-value pairs
 * @param accessToken - Access token for authentication
 * @returns Promise<ApiResponse<T>> - Response data or error information
 */
export async function sendAuthenticatedGet<T = any>(
  endpoint: string,
  queryParams: Record<string, string> = {},
  accessToken: string
): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://r8wncu74i2.us-west-2.awsapprunner.com';
  const url = new URL(`${baseUrl}${endpoint}`);
  
  // Add query parameters
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  try {
    console.debug('[apiClient] GET ->', url.toString());
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Validator': 'worldapp',
        'Frontend': 'worldapp'
      }
    });

    const text = await response.text();
    let responseData: any = null;
    try { responseData = JSON.parse(text); } catch { responseData = text; }
    console.debug('[apiClient] GET <-', url.toString(), { status: response.status, body: responseData });

    if (!response.ok) {
      return {
        data: null,
        error: responseData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        success: false
      };
    }

    return {
      data: responseData,
      error: null,
      status: response.status,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      status: 0,
      success: false
    };
  }
}

/**
 * Backwards-compatible top-level helpers.
 * Other modules in the repo import `postToBackend` / `getFromBackend` directly.
 * These functions accept an optional accessToken. If provided they delegate to
 * the token-based helpers; otherwise they return a 401-like ApiResponse.
 */
export async function postToBackend<T = any>({
  payload,
  endpoint,
  accessToken,
  baseUrl
}: {
  payload: any;
  endpoint: string;
  accessToken?: string;
  baseUrl?: string;
}): Promise<ApiResponse<T>> {
  if (!accessToken) {
    return {
      data: null,
      error: 'No access token provided.',
      status: 401,
      success: false
    };
  }

  // reuse existing helper
  return sendAuthenticatedPost<T>(payload, endpoint, accessToken);
}

export async function getFromBackend<T = any>({
  endpoint,
  queryParams = {},
  accessToken,
  baseUrl
}: {
  endpoint: string;
  queryParams?: Record<string, string>;
  accessToken?: string;
  baseUrl?: string;
}): Promise<ApiResponse<T>> {
  if (!accessToken) {
    return {
      data: null,
      error: 'No access token provided.',
      status: 401,
      success: false
    };
  }

  return sendAuthenticatedGet<T>(endpoint, queryParams, accessToken);
}

/**
 * Specific function to get user Web3 data
 * @param walletId - The wallet ID to query
 * @param accessToken - Access token for authentication
 * @returns Promise<ApiResponse> - User Web3 data or error information
 */
export async function getUserWeb3Data(
  walletId: string,
  accessToken: string
): Promise<ApiResponse> {
  return sendAuthenticatedGet(
    '/get-user-web3',
    { wallet_id: walletId },
    accessToken
  );
}

/**
 * Interface for credit data response
 */
export interface CreditData {
  daily_credits: number;
  isPro: boolean;
  lifetime_credits: number;
  success: boolean;
  temp_expiries: any[];
  temp_list: any[];
  temp_total: number;
  usdser_credits: number;
}

/**
 * Specific function to check user credits
 * @param walletId - The wallet ID to query
 * @param accessToken - Access token for authentication
 * @returns Promise<ApiResponse<CreditData>> - Credit data or error information
 */
export async function checkCreditsUtil(
  walletId: string,
  accessToken: string
): Promise<ApiResponse<CreditData>> {
  return sendAuthenticatedPost(
    { wallet_id: walletId },
    '/check_credits_util',
    accessToken
  );
}

/**
 * Convenience hook-level helpers (use inside React components via useApiClient)
 * - extractClaim: calls POST /extract-claim with the provided payload
 * - factCheckSync: calls POST /fact-check-sync with the provided body
 */
export async function extractClaimWithToken<T = any>(
  payload: any,
  accessToken: string
): Promise<ApiResponse<T>> {
  return sendAuthenticatedPost<T>(payload, '/extract-claim', accessToken);
}

export async function factCheckSyncWithToken<T = any>(
  body: any,
  accessToken: string
): Promise<ApiResponse<T>> {
  return sendAuthenticatedPost<T>(body, '/fact-check-sync', accessToken);
}

export async function addTaskIdWithToken<T = any>(
  sessionId: string,
  taskId: string,
  accessToken: string
): Promise<ApiResponse<T>> {
  return sendAuthenticatedPost<T>(
    { link: "", mode: "verify",_id: sessionId, task_id: taskId },
    '/add_task_id',
    accessToken
  );
}

/**
 * Interface for reward points response
 */
export interface RewardPointsResponse {
  success: boolean;
  message: string;
  updatedCredits?: number;
  dailyCredits?: number;
  lifetimeCredits?: number;
  communityCredits?: number;
}

/**
 * Hook to reward bonus points to a user
 * Uses useAuth to get access token automatically
 * @returns Object with rewardBonusPoint function
 */
export function useRewardPoints() {
  const { accessToken } = useAuth();

  const rewardBonusPoint = async (
    type: string,
    points: number,
    taskId: string,
    worldId: string,
    backendUrl?: string
  ): Promise<ApiResponse<RewardPointsResponse>> => {
    const baseUrl = backendUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://r8wncu74i2.us-west-2.awsapprunner.com';
    
    // Don't proceed if no worldId or task ID
    if (!worldId || !taskId) {
      console.log("Cannot reward points: missing worldId or task ID");
      return {
        success: false,
        data: null,
        error: "Missing worldId or task ID",
        status: 400
      };
    }

    if (!accessToken) {
      console.log("Cannot reward points: no access token available");
      return {
        success: false,
        data: null,
        error: "No access token available. Please sign in.",
        status: 401
      };
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Validator': 'worldapp',
        'Frontend': 'worldapp',
        'Authorization': `Bearer ${accessToken}`
      };

      
      const payload = {
        task_id: taskId,
        userEmail: worldId, // worldId is used as userEmail in the backend
        points: points,
        url: typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '',
        type: type // Either "feedback" or "share"
      };
      
      console.log('Reward payload:', payload);
      
      const response = await fetch(`${baseUrl}/reward_point`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`Successfully rewarded ${points} points for ${type}`, data);
        return {
          success: true,
          data: data,
          error: null,
          status: response.status
        };
      } else {
        console.error("Failed to reward points:", data.message || "Unknown error");
        return {
          success: false,
          data: null,
          error: data.message || "Unknown error",
          status: response.status
        };
      }
    } catch (error) {
      console.error("Error rewarding points:", error);
      return {
        success: false,
        data: null,
        error: "Error processing reward",
        status: 0
      };
    }
  };

  return { rewardBonusPoint };
}

/**
 * Hook-friendly wrappers that use the in-hook postToBackend (which automatically
 * reads the auth token via useAuth). Prefer these inside React components.
 */
export function useFactCheckClient() {
  const { postToBackend, getFromBackend } = useApiClient();
  const { accessToken } = useAuth();

  const defaultBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://r8wncu74i2.us-west-2.awsapprunner.com';

  // internal helper that will use the hook postToBackend when we have an access token,
  // otherwise it will perform a direct unauthenticated fetch (machine-mode)
  const doPost = async <T = any>(endpoint: string, body: any, baseUrl?: string): Promise<ApiResponse<T>> => {
    const base = baseUrl || defaultBase;
    if (accessToken) {
      return postToBackend<T>({ payload: body, endpoint, baseUrl: base });
    }

    try {
      const url = `${base}${endpoint}`;
      console.debug('[apiClient] unauth POST ->', url, { body });
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Validator': 'worldapp',
          'Frontend': 'worldapp'
        },
        body: JSON.stringify(body)
      });

      const text = await response.text();
      let responseData: any = null;
      try { responseData = JSON.parse(text); } catch { responseData = text; }
      console.debug('[apiClient] unauth POST <-', url, { status: response.status, body: responseData });

      if (!response.ok) {
        return {
          data: null,
          error: responseData?.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          success: false
        };
      }

      return {
        data: responseData,
        error: null,
        status: response.status,
        success: true
      };
    } catch (error) {
      console.error('[apiClient] unauth POST error', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 0,
        success: false
      };
    }
  };

  const extractClaim = async <T = any>(payload: any, baseUrl?: string) => {
    return doPost<T>('/extract-claim', payload, baseUrl);
  };

  const factCheckSync = async <T = any>(body: any, baseUrl?: string) => {
    return doPost<T>('/fact-check-sync', body, baseUrl);
  };

  const addTaskId = async <T = any>(sessionId: string, taskId: string, baseUrl?: string) => {
    return doPost<T>('/add_task_id', { _id: sessionId, task_id: taskId, link: "", mode: "verify" }, baseUrl);
  };

  return { extractClaim, factCheckSync, addTaskId, getFromBackend };
}

// Example usage:
// import { useApiClient, sendAuthenticatedPost, sendAuthenticatedGet, getUserWeb3Data, checkCreditsUtil } from '@/utils/apiClient';
// 
// // Using the hook (recommended for React components)
// function MyComponent() {
//   const { postToBackend, getFromBackend } = useApiClient();
//   
//   const handleSubmit = async (formData) => {
//     const result = await postToBackend({
//       payload: formData,
//       endpoint: '/api/users/update'
//     });
//     
//     if (result.success) {
//       console.log('Success:', result.data);
//     } else {
//       console.error('Error:', result.error);
//     }
//   };
//
//   const handleGetUserWeb3 = async (walletId) => {
//     const result = await getFromBackend({
//       endpoint: '/get-user-web3',
//       queryParams: { wallet_id: walletId }
//     });
//     
//     if (result.success) {
//       console.log('User Web3 data:', result.data);
//     } else {
//       console.error('Error:', result.error);
//     }
//   };
// }
//
// // Using sendAuthenticatedPost for direct calls with token
// const result = await sendAuthenticatedPost(
//   { userId: 123, action: 'update' },
//   '/api/users/update',
//   'your-token-here'
// );
//
// // Using sendAuthenticatedGet for direct GET calls with token
// const userData = await sendAuthenticatedGet(
//   '/get-user-web3',
//   { wallet_id: 'wallet123' },
//   'your-token-here'
// );
//
// // Using the specific getUserWeb3Data function
// const web3Data = await getUserWeb3Data('wallet123', 'your-token-here');
// if (web3Data.success) {
//   console.log('Web3 data:', web3Data.data);
// } else {
//   console.error('Error:', web3Data.error);
// }
//
// // Using the specific checkCreditsUtil function
// const creditsData = await checkCreditsUtil('wallet123', 'your-token-here');
// if (creditsData.success) {
//   console.log('Credits data:', creditsData.data);
// } else {
//   console.error('Error:', creditsData.error);
// }
