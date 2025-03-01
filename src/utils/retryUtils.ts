/**
 * Utility functions for handling retries with exponential backoff
 */

/**
 * Retry a function with exponential backoff
 * 
 * @param fn The async function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param baseDelay Base delay in milliseconds
 * @param shouldRetry Function to determine if retry should be attempted based on error
 * @returns Result of the function or throws the last error
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  shouldRetry: (error: any) => boolean = isRetryableError
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry based on the error
      if (attempt >= maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = calculateBackoff(attempt, baseDelay);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      
      // Wait before next attempt
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Calculate backoff delay with jitter
 */
function calculateBackoff(attempt: number, baseDelay: number): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Add jitter (random value between 0 and 1) to avoid thundering herd problem
  const jitter = Math.random();
  
  // Return delay with jitter, capped at 30 seconds
  return Math.min(exponentialDelay * (1 + jitter), 30000);
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Default function to determine if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Retry on network errors or rate limiting (429)
  if (error?.status === 429) return true;
  
  // Retry on network-related errors
  if (error?.message && (
    error.message.includes('network') ||
    error.message.includes('connection') ||
    error.message.includes('timeout') ||
    error.message.includes('fetch')
  )) return true;
  
  // Retry on server errors (5xx)
  if (error?.status && error.status >= 500 && error.status < 600) return true;
  
  // Retry on database errors
  if (error?.message && (
    error.message.includes('Database error') ||
    error.message.includes('base de données')
  )) return true;
  
  return false;
}

/**
 * Utility to add rate limiting protection to API calls
 * @param key Unique key for the rate limit
 * @param maxCalls Maximum number of calls allowed in the time window
 * @param timeWindow Time window in milliseconds
 * @returns Boolean indicating if the call should proceed
 */
export function rateLimitCheck(key: string, maxCalls: number = 5, timeWindow: number = 60000): boolean {
  // In development mode, bypass rate limiting
  if (import.meta.env.DEV) {
    return true;
  }
  
  const storageKey = `rateLimit_${key}`;
  const now = Date.now();
  
  try {
    // Get existing rate limit data from storage
    const storedData = localStorage.getItem(storageKey);
    let callHistory: number[] = storedData ? JSON.parse(storedData) : [];
    
    // Filter out calls outside the time window
    callHistory = callHistory.filter(timestamp => now - timestamp < timeWindow);
    
    // Check if we've exceeded the rate limit
    if (callHistory.length >= maxCalls) {
      return false;
    }
    
    // Add current call to history
    callHistory.push(now);
    localStorage.setItem(storageKey, JSON.stringify(callHistory));
    
    return true;
  } catch (error) {
    // If there's any error with localStorage, allow the call to proceed
    console.warn('Error in rate limit check:', error);
    return true;
  }
}