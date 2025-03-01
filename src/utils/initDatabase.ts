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
    
    // Attempt to create a dummy record to verify table access
    await verifyProfilesTableAccess();
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

/**
 * Verify access to the profiles table
 */
async function verifyProfilesTableAccess(): Promise<void> {
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
    console.error('Critical error in verifyProfilesTableAccess:', error);
    throw error;
  }
}

export default initializeDatabase;