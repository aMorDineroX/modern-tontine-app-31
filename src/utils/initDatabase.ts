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
    
    // Create the handle_new_user function and trigger
    await createHandleNewUserFunction();
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

/**
 * Create the handle_new_user function and trigger
 */
async function createHandleNewUserFunction(): Promise<void> {
  try {
    console.log('Creating handle_new_user function and trigger...');
    
    // Attempt to create the function using a custom RPC
    const { error: functionError } = await supabase.rpc('create_handle_new_user_function', {});
    
    if (functionError) {
      console.warn('Error creating handle_new_user function via RPC:', functionError);
      
      // Fallback to manual function and trigger creation
      try {
        // Create a function to insert a profile when a new user is created
        const createFunctionResponse = await supabase.rpc('create_function', {
          sql: `
            CREATE OR REPLACE FUNCTION public.handle_new_user()
            RETURNS TRIGGER AS $$
            BEGIN
              -- Attempt to insert a new profile, ignore if it already exists
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
          `
        });

        // Create the trigger
        const createTriggerResponse = await supabase.rpc('create_function', {
          sql: `
            -- Drop existing trigger if it exists
            DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
            
            -- Create the trigger
            CREATE TRIGGER on_auth_user_created
              AFTER INSERT ON auth.users
              FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
          `
        });

        // Check for errors in function and trigger creation
        if (createFunctionResponse.error) {
          console.error('Error creating handle_new_user function:', createFunctionResponse.error);
          throw createFunctionResponse.error;
        }

        if (createTriggerResponse.error) {
          console.error('Error creating handle_new_user trigger:', createTriggerResponse.error);
          throw createTriggerResponse.error;
        }

        console.log('Successfully created handle_new_user function and trigger');
      } catch (directError) {
        console.error('Critical error creating handle_new_user function:', directError);
        throw directError;
      }
    } else {
      console.log('Successfully created handle_new_user function via RPC');
    }
  } catch (error) {
    console.error('Error in createHandleNewUserFunction:', error);
    throw error;
  }
}

export default initializeDatabase;