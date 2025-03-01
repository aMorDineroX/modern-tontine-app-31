import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const validateEnvVariable = (varName: string, defaultValue?: string): string => {
  const value = import.meta.env[varName] || defaultValue;
  
  if (!value) {
    console.error(`Environment variable ${varName} is not set. This may cause authentication issues.`);
    return '';
  }
  
  return value;
};

// Get Supabase configuration from environment variables
const supabaseUrl = validateEnvVariable('VITE_SUPABASE_URL');
const supabaseAnonKey = validateEnvVariable('VITE_SUPABASE_ANON_KEY');

// Validate Supabase URL and Anon Key
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration is incomplete. Authentication may not work.');
}

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

// Add a simple health check function
// This will be used to check if Supabase is available
supabase.functions.setAuth(supabaseAnonKey);

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

// Log environment configuration (only in development)
if (import.meta.env.DEV) {
  console.log('Supabase Configuration:', {
    url: supabaseUrl ? 'Configured' : 'Missing',
    anonKey: supabaseAnonKey ? 'Configured' : 'Missing'
  });
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