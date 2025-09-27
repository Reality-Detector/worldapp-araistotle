"use client";
import { postToBackend } from './apiClient';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook for making authenticated POST requests to the backend
 * Uses the current user's access token from the auth session
 */
export function useBackendApi() {
  const { accessToken } = useAuth();

  const sendPost = async <T = any>(
    payload: any,
    endpoint: string
  ): Promise<{ data?: T; error?: string; status: number; success: boolean }> => {
    if (!accessToken) {
      return {
        data: null,
        error: 'No access token available. Please sign in.',
        status: 401,
        success: false
      };
    }

    return postToBackend<T>({
      payload,
      accessToken,
      endpoint
    });
  };

  return { sendPost };
}

/**
 * Direct function for making POST requests with a provided access token
 * Useful when you have the token from outside the auth context
 */
export async function makeBackendRequest<T = any>(
  payload: any,
  endpoint: string,
  accessToken: string
) {
  return postToBackend<T>({
    payload,
    accessToken,
    endpoint
  });
}

// Example usage in a component:
// import { useBackendApi } from '@/utils/backendApi';
//
// function MyComponent() {
//   const { sendPost } = useBackendApi();
//
//   const handleSubmit = async (formData) => {
//     const result = await sendPost(formData, '/api/submit');
//     
//     if (result.success) {
//       console.log('Success:', result.data);
//     } else {
//       console.error('Error:', result.error);
//     }
//   };
//
//   return (
//     // Your component JSX
//   );
// }

