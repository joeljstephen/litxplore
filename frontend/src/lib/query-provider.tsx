"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setTokenGetter, ApiError } from "./api/axios-instance";

// Helper to check if an error is an authentication error
function isAuthError(error: unknown): boolean {
  // Check if it's our ApiError with a status code
  if (error instanceof ApiError) {
    return error.status === 401 || error.status === 403;
  }
  // Fallback to message checking for other error types
  if (error instanceof Error) {
    return (
      error.message.includes("401") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("Authentication required")
    );
  }
  return false;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  // Set up the token getter for the Axios instance used by generated hooks
  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error) => {
              // Don't retry on auth errors - user needs to re-authenticate
              if (isAuthError(error)) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: (failureCount, error) => {
              // Don't retry on auth errors - user needs to re-authenticate
              if (isAuthError(error)) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
