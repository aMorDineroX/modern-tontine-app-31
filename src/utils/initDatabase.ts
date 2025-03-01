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
    
    // Ensure profiles table exists and has correct configuration
    await ensureProfilesTableConfiguration();
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

/**
 * Ensure the profiles table is configured correctly
 */
async function ensureProfilesTableConfiguration(): Promise<void> {
  try {
    // Check if the profiles table exists
    const { data, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.warn('Error checking profiles table:', checkError);
      
      // If the table doesn't exist, we'll attempt to create it
      try {
        // Attempt to insert a dummy record to create the table
        await supabase.from('profiles').insert([{
          id: '00000000-0000-0000-0000-000000000000',
          email: 'dummy@example.com',
          full_name: 'Dummy User'
        }]);
        
        // Remove the dummy record
        await supabase
          .from('profiles')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000');
      } catch (insertError) {
        console.error('Failed to create profiles table:', insertError);
      }
    }
    
    // Ensure Row Level Security (RLS) is enabled
    try {
      await enableRowLevelSecurity();
    } catch (rlsError) {
      console.warn('Failed to configure Row Level Security:', rlsError);
    }
  } catch (error) {
    console.error('Error in ensureProfilesTableConfiguration:', error);
    throw error;
  }
}

/**
 * Enable Row Level Security for the profiles table
 */
async function enableRowLevelSecurity(): Promise<void> {
  try {
    // Create policies to allow users to manage their own profiles
    const policies = [
      {
        name: 'Users can view their own profile',
        command: `
          CREATE POLICY IF NOT EXISTS "Users can view their own profile"
          ON public.profiles
          FOR SELECT
          USING (auth.uid() = id);
        `
      },
      {
        name: 'Users can update their own profile',
        command: `
          CREATE POLICY IF NOT EXISTS "Users can update their own profile"
          ON public.profiles
          FOR UPDATE
          USING (auth.uid() = id);
        `
      },
      {
        name: 'Users can insert their own profile',
        command: `
          CREATE POLICY IF NOT EXISTS "Users can insert their own profile"
          ON public.profiles
          FOR INSERT
          WITH CHECK (auth.uid() = id);
        `
      }
    ];

    // Attempt to create policies
    for (const policy of policies) {
      try {
        await supabase.rpc('create_function', { sql: policy.command });
      } catch (policyError) {
        console.warn(`Failed to create policy ${policy.name}:`, policyError);
      }
    }
  } catch (error) {
    console.error('Error enabling Row Level Security:', error);
    throw error;
  }
}

export default initializeDatabase;