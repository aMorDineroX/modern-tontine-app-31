import { createClient } from '@supabase/supabase-js'

// Fallback values for Supabase configuration
const FALLBACK_SUPABASE_URL = 'https://qgpqiehjmkfxfnfrowbc.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncHFpZWhqbWtmeGZuZnJvd2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDkzNzUsImV4cCI6MjA1NjI4NTM3NX0.pYcG26WQa-6rIfDcE5mDjNhGbhYAlTMOvCxfYtNmu-0';

// Validate and get Supabase configuration
function getSupabaseConfig() {
  // Try to get configuration from environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

  // Log configuration details (only in development)
  if (import.meta.env.DEV) {
    console.log('Supabase Configuration:', {
      url: supabaseUrl ? 'Configured' : 'Missing',
      anonKey: supabaseAnonKey ? 'Configured' : 'Missing'
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
      } else if (event === 'SIGNED_IN') {
        console.log('User signed in');
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
  }
});

// Enhanced health check function
export async function checkSupabaseAvailability(): Promise<boolean> {
  try {
    // Try to get the session as a simple availability check
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase availability check failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking Supabase availability:', error);
    return false;
  }
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