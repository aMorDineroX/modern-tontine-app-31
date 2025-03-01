/**
 * Database initialization script
 * This script runs when the application starts to ensure the database is properly set up
 */
import { supabase } from './supabase';

/**
 * Initialize the database by creating necessary tables and triggers
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database...');
    
    // Create the profiles table directly
    await createProfilesTable();
    
    // Create the handle_new_user function and trigger
    await createHandleNewUserFunction();
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

/**
 * Create the profiles table
 */
async function createProfilesTable(): Promise<void> {
  try {
    console.log('Creating profiles table...');
    
    // Check if the table exists
    const { data, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') { // Table does not exist
      console.log('Profiles table does not exist. Creating...');
      
      // Create the table using Supabase's table methods
      const { error } = await supabase.rpc('create_profiles_table', {});
      
      if (error) {
        console.warn('Error using create_profiles_table function, attempting direct creation:', error);
        
        // Direct table creation using Supabase management methods
        const { error: createError } = await supabase.from('profiles').insert([
          {
            id: '00000000-0000-0000-0000-000000000000', // Dummy record to create table
            email: 'dummy@example.com',
            full_name: 'Dummy User'
          }
        ]);
        
        if (createError) {
          console.error('Failed to create profiles table:', createError);
          throw createError;
        }
        
        // Remove the dummy record
        await supabase
          .from('profiles')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000');
      }
      
      console.log('Profiles table created successfully');
    } else if (checkError) {
      console.error('Error checking profiles table:', checkError);
      throw checkError;
    } else {
      console.log('Profiles table already exists');
    }
  } catch (error) {
    console.error('Error in createProfilesTable:', error);
    throw error;
  }
}

/**
 * Create the handle_new_user function and trigger
 */
async function createHandleNewUserFunction(): Promise<void> {
  try {
    console.log('Creating handle_new_user function and trigger...');
    
    // Create the function using Supabase RPC
    const { error: functionError } = await supabase.rpc('create_handle_new_user_function', {});
    
    if (functionError) {
      console.warn('Error creating handle_new_user function:', functionError);
      
      // Fallback to direct SQL if RPC fails
      try {
        const { error } = await supabase.sql(`
          -- Function to create a new profile when a user signs up
          CREATE OR REPLACE FUNCTION public.handle_new_user()
          RETURNS TRIGGER AS $$
          BEGIN
            INSERT INTO public.profiles (id, email, full_name, created_at)
            VALUES (
              NEW.id, 
              NEW.email, 
              COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
              NOW()
            )
            ON CONFLICT (id) DO NOTHING;
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
          
          -- Drop the trigger if it exists
          DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
          
          -- Create the trigger
          CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        `);
        
        if (error) {
          console.error('Error creating handle_new_user function and trigger directly:', error);
          throw error;
        }
      } catch (directError) {
        console.error('Critical error creating handle_new_user function:', directError);
        throw directError;
      }
    }
    
    console.log('Successfully created handle_new_user function and trigger');
  } catch (error) {
    console.error('Error in createHandleNewUserFunction:', error);
    throw error;
  }
}

export default initializeDatabase;