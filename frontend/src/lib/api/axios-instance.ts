import Axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create the base Axios instance
export const axiosInstance = Axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Token getter function - will be set by the auth provider
let tokenGetter: (() => Promise<string | null>) | null = null;

/**
 * Set the token getter function from Clerk auth
 * This should be called once during app initialization
 */
export function setTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

// Request interceptor to add authentication token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get the token using the token getter if available
    if (tokenGetter) {
      try {
        const token = await tokenGetter();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Failed to get auth token:", error);
      }
    }

    // Add cache-busting headers
    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Custom error class that preserves status code for proper retry logic
class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// Response interceptor to handle errors consistently
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { data, status } = error.response;

      // Parse standardized error format from backend
      let errorMessage = `Request failed with status ${status}`;
      let errorCode: string | undefined;

      if (data && typeof data === "object") {
        const errorData = data as any;

        // Handle standardized error format
        if (errorData.status === "error" && errorData.error) {
          errorMessage = errorData.error.message || errorMessage;
          errorCode = errorData.error.code;
        } else if (errorData.detail) {
          if (typeof errorData.detail === "object" && errorData.detail.error) {
            errorMessage = errorData.detail.error.message || errorMessage;
            errorCode = errorData.detail.error.code;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage =
              errorData.detail[0]?.msg || errorData.detail[0] || errorMessage;
          } else if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          }
        }
      }

      // Create an ApiError that preserves status code for retry logic
      const apiError = new ApiError(errorMessage, status, errorCode);
      return Promise.reject(apiError);
    }

    // Network error or no response
    return Promise.reject(error);
  }
);

export { ApiError };

// Custom instance for Orval
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();

  // Check if this is a request that should return a blob
  // (e.g., document generation endpoints)
  const shouldReturnBlob = config.url?.includes("/documents/generate");

  const promise = axiosInstance({
    ...config,
    ...options,
    responseType: shouldReturnBlob ? "blob" : options?.responseType,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - Adding cancel method to promise
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export default customInstance;
