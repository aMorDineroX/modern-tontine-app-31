import { createClient } from '@supabase/supabase-js'

// Fallback values for Supabase configuration
const FALLBACK_SUPABASE_URL = 'https://qgpqiehjmkfxfnfrowbc.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncHFpZWhqbWtmeGZuZnJvd2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDkzNzUsImV4cCI6MjA1NjI4NTM3NX0.pYcG26WQa-6rIfDcE5mDjNhGbhYAlTMOvCxfYtNmu-0';

// Validate and get Supabase configuration
function getSupabaseConfig() {
  // Try to get configuration from environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

  // Validate configuration
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration is incomplete. Authentication may not work.');
    
    // Provide more detailed guidance
    if (!supabaseUrl) {
      console.warn('VITE_SUPABASE_URL is missing. Please check your .env file.');
    }
    if (!supabaseAnonKey) {
      console.warn('VITE_SUPABASE_ANON_KEY is missing. Please check your .env file.');
    }
  }

  // Log configuration details (only in development)
  if (import.meta.env.DEV) {
    console.log('Supabase Configuration:', {
      url: supabaseUrl ? 'Configured' : 'Missing',
      anonKey: supabaseAnonKey ? 'Configured (first 10 chars)' : 'Missing'
    });
  }

  return { supabaseUrl, supabaseAnonKey };
}

// Get Supabase configuration
const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

// Create Supabase client with robust configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // Add more robust error handling
    onAuthStateChange: (event, session) => {
      console.log('Auth state change:', event);
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        // Clear any local storage related to authentication
        localStorage.removeItem('signup_attempts');
      } else if (event === 'SIGNED_IN') {
        console.log('User signed in');
        // Clear signup attempts on successful login
        localStorage.removeItem('signup_attempts');
      }
    }
  },
  // Add global fetch options for better error handling
  global: {
    headers: {
      'x-client-info': 'tontine-app/1.0.0'
    }
  },
  // Add more detailed error handling
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  // Add custom error handling for database operations
  db: {
    schema: 'public',
    onError: (error) => {
      console.error('Supabase Database Error:', {
        code: error.code,
        message: error.message,
        details: error
      });

      // Handle specific error scenarios
      if (error.code === 'PGRST116') {
        console.warn('Table does not exist. Attempting to create...');
        // You could trigger a table creation function here
      }

      if (error.message.includes('duplicate key')) {
        console.warn('Duplicate key error. This might be expected in some scenarios.');
      }
    }
  }
});

// Enhanced health check function
export async function checkSupabaseAvailability(): Promise<boolean> {
  try {
    // Track the start time of the availability check
    const startTime = Date.now();

    // Try multiple methods to check availability with timeout
    const checkSession = new Promise<boolean>(async (resolve) => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('Session check failed:', sessionError);
          resolve(false);
        } else {
          resolve(true);
        }
      } catch (sessionCheckError) {
        console.error('Error checking session:', sessionCheckError);
        resolve(false);
      }
    });

    const checkTable = new Promise<boolean>(async (resolve) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (error) {
          console.warn('Profiles table check failed:', error);
          resolve(false);
        } else {
          resolve(true);
        }
      } catch (tableCheckError) {
        console.error('Error checking profiles table:', tableCheckError);
        resolve(false);
      }
    });

    // Wait for either check to complete or timeout after 5 seconds
    const result = await Promise.race([
      Promise.all([checkSession, checkTable]).then(results => results.every(r => r)),
      new Promise<boolean>(resolve => setTimeout(() => resolve(false), 5000))
    ]);

    // Log the time taken for the availability check
    const endTime = Date.now();
    console.log(`Supabase availability check took ${endTime - startTime}ms`);

    return result;
  } catch (error) {
    console.error('Comprehensive Supabase availability check failed:', error);
    return false;
  }
}

// Function to reset signup attempts
export function resetSignupAttempts(email: string) {
  const signupAttemptKey = `signup_attempt_${email}`;
  localStorage.removeItem(signupAttemptKey);
}

// Define User type for use throughout the application
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  preferred_language?: string;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  created_at: string;
  updated_at?: string;
}

export default supabase;