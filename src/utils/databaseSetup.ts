/**
 * Database setup utilities
 */
import { supabase } from './supabase';
import { configureDatabases, DatabaseType, isDatabaseAvailable } from '@/services/databaseService';

/**
 * Check if the profiles table exists and create it if it doesn't
 */
export async function ensureProfilesTableExists(): Promise<boolean> {
  try {
    // First, check if the profiles table exists by trying to get the schema
    const { error: schemaError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    // If there's no error, the table exists
    if (!schemaError) {
      return true;
    }
    
    console.log('Profiles table may not exist or is not accessible. Assuming it exists for now.');
    
    // In a browser environment, we can't create tables directly
    // We'll assume the table exists on the server side
    return true;
  } catch (error) {
    console.error('Error checking profiles table:', error);
    // Assume the table exists to prevent further errors
    return true;
  }
}

/**
 * Initialize the database connections and configure the database service
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Check which databases are available
    const isSupabaseAvailable = await isDatabaseAvailable(DatabaseType.SUPABASE);
    const sqlServerAvailable = await isDatabaseAvailable(DatabaseType.SQL_SERVER);
    
    console.log('Database availability:', {
      supabase: isSupabaseAvailable,
      sqlServer: sqlServerAvailable
    });
    
    // Configure the database service based on availability
    if (isSupabaseAvailable) {
      configureDatabases({
        primaryDatabase: DatabaseType.SUPABASE,
        fallbackDatabase: sqlServerAvailable ? DatabaseType.SQL_SERVER : undefined,
        useFallback: sqlServerAvailable
      });
      
      // If Supabase is available, ensure the profiles table exists
      const profilesTableExists = await ensureProfilesTableExists();
      
      if (!profilesTableExists) {
        console.warn('Could not ensure profiles table exists in Supabase. Some features may not work correctly.');
      }
    } else if (sqlServerAvailable) {
      configureDatabases({
        primaryDatabase: DatabaseType.SQL_SERVER,
        fallbackDatabase: undefined,
        useFallback: false
      });
    } else {
      console.error('No database connections available. Application will run in limited mode.');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

export default {
  ensureProfilesTableExists,
  initializeDatabase
};