"use client";
import { useAuth } from '@/hooks/useAuth';

interface ApiResponse<T = any> {
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
