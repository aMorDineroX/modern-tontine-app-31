/**
 * Database service that handles connections to different database types
 */
import { supabase } from '@/utils/supabase';
// Import executeQuery but not isSqlServerAvailable to avoid circular dependencies
import { executeQuery } from '@/utils/sqlServerConnection';

// Database types
export enum DatabaseType {
  SUPABASE = 'supabase',
  SQL_SERVER = 'sqlserver'
}

// Configuration for database connections
interface DatabaseConfig {
  primaryDatabase: DatabaseType;
  fallbackDatabase?: DatabaseType;
  useFallback: boolean;
}

// Default configuration
const dbConfig: DatabaseConfig = {
  primaryDatabase: DatabaseType.SUPABASE,
  fallbackDatabase: DatabaseType.SQL_SERVER,
  useFallback: true
};

/**
 * Set the database configuration
 */
export function configureDatabases(config: Partial<DatabaseConfig>): void {
  Object.assign(dbConfig, config);
}

/**
 * Check if a database is available
 */
export async function isDatabaseAvailable(type: DatabaseType): Promise<boolean> {
  try {
    switch (type) {
      case DatabaseType.SUPABASE:
        // Import the checkSupabaseAvailability function
        const { checkSupabaseAvailability } = await import('@/utils/supabase');
        return await checkSupabaseAvailability();
      
      case DatabaseType.SQL_SERVER:
        // Import dynamically to avoid circular dependencies
        const { isSqlServerAvailable } = await import('@/utils/sqlServerConnection');
        return await isSqlServerAvailable();
      
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking ${type} availability:`, error);
    return false;
  }
}

/**
 * Execute a query on the appropriate database
 */
export async function executeDbQuery<T>(
  supabaseQuery: () => Promise<T>,
  sqlServerQuery?: () => Promise<T>
): Promise<T> {
  // Try primary database first
  try {
    if (dbConfig.primaryDatabase === DatabaseType.SUPABASE) {
      return await supabaseQuery();
    } else if (dbConfig.primaryDatabase === DatabaseType.SQL_SERVER && sqlServerQuery) {
      return await sqlServerQuery();
    }
  } catch (primaryError) {
    console.error(`Error executing query on primary database (${dbConfig.primaryDatabase}):`, primaryError);
    
    // If fallback is enabled and a fallback database is configured
    if (dbConfig.useFallback && dbConfig.fallbackDatabase) {
      console.log(`Attempting fallback to ${dbConfig.fallbackDatabase}...`);
      
      try {
        if (dbConfig.fallbackDatabase === DatabaseType.SUPABASE) {
          return await supabaseQuery();
        } else if (dbConfig.fallbackDatabase === DatabaseType.SQL_SERVER && sqlServerQuery) {
          return await sqlServerQuery();
        }
      } catch (fallbackError) {
        console.error(`Error executing query on fallback database (${dbConfig.fallbackDatabase}):`, fallbackError);
      }
    }
    
    // If we get here, both primary and fallback failed (or fallback is disabled)
    throw primaryError;
  }
  
  // If we get here, something went wrong with the configuration
  throw new Error('Invalid database configuration');
}

/**
 * Get user profile from the database
 */
export async function getUserProfile(userId: string): Promise<any> {
  return executeDbQuery(
    // Supabase query
    async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          // If the profiles table doesn't exist or has permission issues
          if (error.code === '42P01' || error.code === '42501') {
            console.warn('Profiles table issue:', error.message);
            // Return a minimal profile
            return {
              id: userId,
              created_at: new Date().toISOString()
            };
          }
          
          throw error;
        }
        
        return data;
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        
        // Return a minimal profile to allow the app to continue
        return {
          id: userId,
          created_at: new Date().toISOString()
        };
      }
    },
    // SQL Server query
    async () => {
      try {
        const result = await executeQuery(
          'SELECT * FROM profiles WHERE id = @userId',
          { userId }
        );
        return result.recordset[0] || {
          id: userId,
          created_at: new Date().toISOString()
        };
      } catch (error) {
        console.error('SQL Server error in getUserProfile:', error);
        
        // Return a minimal profile
        return {
          id: userId,
          created_at: new Date().toISOString()
        };
      }
    }
  );
}

/**
 * Create user profile in the database
 */
export async function createUserProfile(profile: any): Promise<any> {
  return executeDbQuery(
    // Supabase query
    async () => {
      // Validate required fields
      if (!profile.id) {
        throw new Error('User ID is required');
      }
      if (!profile.email) {
        throw new Error('Email is required');
      }

      // Prepare the profile data with default values
      // First check which columns exist in the profiles table
      const { data: tableInfo, error: tableInfoError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      // Create a base profile with required fields
      const profileData: any = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || null,
        created_at: profile.created_at || new Date().toISOString(),
      };
      
      // Only add fields that exist in the table schema
      // This prevents errors when columns don't exist
      if (!tableInfoError && tableInfo) {
        const sampleRecord = tableInfo[0] || {};
        const availableColumns = Object.keys(sampleRecord);
        
        if (availableColumns.includes('avatar_url')) {
          profileData.avatar_url = profile.avatar_url || null;
        }
        
        if (availableColumns.includes('phone_number')) {
          profileData.phone_number = profile.phone_number || null;
        }
        
        if (availableColumns.includes('preferred_language')) {
          profileData.preferred_language = profile.preferred_language || 'en';
        }
        
        if (availableColumns.includes('notification_preferences')) {
          profileData.notification_preferences = profile.notification_preferences || {
            email: true,
            push: true,
            sms: false
          };
        }
      } else {
        console.warn('Could not determine table schema, using minimal profile data');
      }

      try {
        // First check if the profiles table exists
        const { error: tableCheckError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (tableCheckError) {
          console.error('Profiles table check error:', tableCheckError);
          // If the table doesn't exist, return a minimal profile to allow the user to continue
          if (tableCheckError.code === '42P01') { // PostgreSQL code for undefined_table
            console.warn('Profiles table does not exist. Returning minimal profile.');
            return {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name || null,
              created_at: profile.created_at || new Date().toISOString()
            };
          }
        }

        // Attempt to insert the profile
        const { data, error } = await supabase
          .from('profiles')
          .upsert(profileData, {
            onConflict: 'id',
            returning: 'minimal'  // Changed from 'representation' to 'minimal' for better compatibility
          })
          .select();
        
        if (error) {
          console.error('Profile creation error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          // If there's a column not found error
          if (error.code === 'PGRST204' && error.message.includes('column')) {
            console.warn('Column not found error. Returning minimal profile.');
            return {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name || null,
              created_at: profile.created_at || new Date().toISOString()
            };
          }
          
          // If there's a foreign key constraint error or permission issue
          if (error.code === '23503' || error.code === '42501') {
            console.warn('Permission or constraint error. Returning minimal profile.');
            return {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name || null,
              created_at: profile.created_at || new Date().toISOString()
            };
          }
          
          throw error;
        }
        
        return data[0] || {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || null,
          created_at: profile.created_at || new Date().toISOString()
        };
      } catch (error: any) {
        // Log detailed error information
        console.error('Unexpected error in createUserProfile:', {
          message: error.message,
          code: error.code,
          details: error
        });
        
        // Return a minimal profile to allow the user to continue
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || null,
          created_at: profile.created_at || new Date().toISOString()
        };
      }
    },
    // SQL Server query (simplified for demonstration)
    async () => {
      try {
        const result = await executeQuery(
          `MERGE profiles AS target
           USING (VALUES (@id, @email, @fullName, @createdAt, @avatarUrl, @phoneNumber, @language)) 
           AS source (id, email, full_name, created_at, avatar_url, phone_number, preferred_language)
           ON (target.id = source.id)
           WHEN MATCHED THEN 
             UPDATE SET 
               email = source.email,
               full_name = source.full_name,
               avatar_url = source.avatar_url,
               phone_number = source.phone_number,
               preferred_language = source.preferred_language
           WHEN NOT MATCHED THEN 
             INSERT (id, email, full_name, created_at, avatar_url, phone_number, preferred_language)
             VALUES (source.id, source.email, source.full_name, source.created_at, source.avatar_url, source.phone_number, source.preferred_language)
           OUTPUT INSERTED.*;`,
          { 
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name || null,
            createdAt: profile.created_at || new Date().toISOString(),
            avatarUrl: profile.avatar_url || null,
            phoneNumber: profile.phone_number || null,
            language: profile.preferred_language || 'en'
          }
        );
        return result.recordset[0];
      } catch (error: any) {
        console.error('SQL Server error in createUserProfile:', error);
        
        // Return a minimal profile to allow the user to continue
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || null,
          created_at: profile.created_at || new Date().toISOString()
        };
      }
    }
  );
}

/**
 * Update user profile in the database
 */
export async function updateUserProfile(userId: string, updates: any): Promise<any> {
  return executeDbQuery(
    // Supabase query
    async () => {
      // First check which columns exist in the profiles table
      const { data: tableInfo, error: tableInfoError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (tableInfoError) {
        console.warn('Could not determine table schema for profile update:', tableInfoError);
        // Return a minimal profile with the updates applied
        return {
          id: userId,
          ...updates
        };
      }
      
      // Filter updates to only include columns that exist in the table
      const filteredUpdates: any = {};
      if (tableInfo && tableInfo.length > 0) {
        const sampleRecord = tableInfo[0] || {};
        const availableColumns = Object.keys(sampleRecord);
        
        Object.keys(updates).forEach(key => {
          if (availableColumns.includes(key)) {
            filteredUpdates[key] = updates[key];
          } else {
            console.warn(`Column '${key}' does not exist in profiles table and will be ignored`);
          }
        });
      } else {
        // If we can't determine the schema, use the updates as is
        Object.assign(filteredUpdates, updates);
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(filteredUpdates)
          .eq('id', userId)
          .select();
        
        if (error) {
          console.error('Profile update error:', error);
          throw error;
        }
        
        return data[0] || { id: userId, ...filteredUpdates };
      } catch (error: any) {
        // If there's a column not found error
        if (error.code === 'PGRST204' && error.message.includes('column')) {
          console.warn('Column not found error during profile update. Returning minimal profile.');
          return { id: userId, ...filteredUpdates };
        }
        
        throw error;
      }
    },
    // SQL Server query
    async () => {
      // Build the SET clause dynamically based on the updates
      const setClauses = Object.keys(updates)
        .map(key => `${key} = @${key}`)
        .join(', ');
      
      const params = { userId, ...updates };
      
      const result = await executeQuery(
        `UPDATE profiles SET ${setClauses} WHERE id = @userId;
         SELECT * FROM profiles WHERE id = @userId`,
        params
      );
      return result.recordset[0] || { id: userId, ...updates };
    }
  );
}

export default {
  configureDatabases,
  isDatabaseAvailable,
  executeDbQuery,
  getUserProfile,
  createUserProfile,
  updateUserProfile
};