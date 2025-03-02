/**
 * Database initialization script
 * This script runs when the application starts to ensure the database is properly set up
 */
import { supabase } from './supabase';

/**
 * Initialize the database by ensuring necessary configurations
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database...');
    
    // Attempt to create the profiles table if it doesn't exist
    await createProfilesTableIfNotExists();
    
    // Verify table access and basic functionality
    await verifyDatabaseAccess();
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Optionally, you could add more detailed error handling or logging here
  }
}

/**
 * Create the profiles table if it doesn't exist
 */
async function createProfilesTableIfNotExists(): Promise<void> {
  try {
    // First, try to use the RPC function to create the table
    const { error: rpcError } = await supabase.rpc('create_profiles_table', {});
    
    if (rpcError) {
      console.warn('RPC table creation failed:', rpcError);
      
      // Fallback: Try to create the table directly with SQL
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            full_name TEXT,
            avatar_url TEXT,
            phone_number TEXT,
            preferred_language TEXT DEFAULT 'fr',
            notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Set up Row Level Security (RLS)
          ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY IF NOT EXISTS "Users can view their own profile"
            ON public.profiles
            FOR SELECT
            USING (auth.uid() = id);
          
          CREATE POLICY IF NOT EXISTS "Users can update their own profile"
            ON public.profiles
            FOR UPDATE
            USING (auth.uid() = id);
          
          CREATE POLICY IF NOT EXISTS "Users can insert their own profile"
            ON public.profiles
            FOR INSERT
            WITH CHECK (auth.uid() = id);
        `);
      } catch (directQueryError) {
        console.error('Direct table creation failed:', directQueryError);
        throw directQueryError;
      }
    }
  } catch (error) {
    console.error('Error creating profiles table:', error);
    throw error;
  }
}

/**
 * Verify database access and basic functionality
 */
async function verifyDatabaseAccess(): Promise<void> {
  try {
    // Try to select from the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.warn('Error accessing profiles table:', error);
      
      // If the error suggests the table doesn't exist or is inaccessible
      if (
        error.code === 'PGRST116' || // Table does not exist
        error.message.includes('relation "profiles" does not exist')
      ) {
        console.log('Profiles table may not exist. Attempting to create a dummy record...');
        
        try {
          // Try to insert a dummy record to create the table
          await supabase.from('profiles').insert([{
            id: '00000000-0000-0000-0000-000000000000',
            email: 'system-init@example.com',
            full_name: 'System Initialization User'
          }]);
          
          // Remove the dummy record
          await supabase
            .from('profiles')
            .delete()
            .eq('id', '00000000-0000-0000-0000-000000000000');
        } catch (insertError) {
          console.error('Failed to create dummy profile:', insertError);
          throw insertError;
        }
      } else {
        // For other types of errors, rethrow
        throw error;
      }
    }
  } catch (error) {
    console.error('Critical error in verifyDatabaseAccess:', error);
    throw error;
  }
}

export default initializeDatabase;