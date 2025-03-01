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
    
    // Check if the profiles table exists
    const { data: tableExists, error: tableCheckError } = await supabase.rpc(
      'check_table_exists',
      { table_name: 'profiles' }
    );
    
    if (tableCheckError) {
      console.warn('Error checking if profiles table exists:', tableCheckError);
      // Create the check_table_exists function if it doesn't exist
      await createTableExistsFunction();
      
      // Try again after creating the function
      const { data: tableExistsRetry } = await supabase.rpc(
        'check_table_exists',
        { table_name: 'profiles' }
      );
      
      if (!tableExistsRetry) {
        await createProfilesTable();
      }
    } else if (!tableExists) {
      await createProfilesTable();
    } else {
      console.log('Profiles table already exists');
    }
    
    // Check if the handle_new_user trigger function exists
    const { data: triggerExists, error: triggerCheckError } = await supabase.rpc(
      'check_function_exists',
      { function_name: 'handle_new_user' }
    );
    
    if (triggerCheckError) {
      console.warn('Error checking if handle_new_user function exists:', triggerCheckError);
      // Create the check_function_exists function if it doesn't exist
      await createFunctionExistsFunction();
      
      // Try again after creating the function
      const { data: triggerExistsRetry } = await supabase.rpc(
        'check_function_exists',
        { function_name: 'handle_new_user' }
      );
      
      if (!triggerExistsRetry) {
        await createHandleNewUserFunction();
      }
    } else if (!triggerExists) {
      await createHandleNewUserFunction();
    } else {
      console.log('handle_new_user function already exists');
    }
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

/**
 * Create the check_table_exists function
 */
async function createTableExistsFunction(): Promise<void> {
  try {
    const { error } = await supabase.rpc('create_check_table_exists_function');
    
    if (error) {
      console.error('Error creating check_table_exists function:', error);
      
      // Try to create the function directly
      const { error: directError } = await supabase.query(`
        CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
        RETURNS boolean
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          RETURN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        END;
        $$;
      `);
      
      if (directError) {
        console.error('Error creating check_table_exists function directly:', directError);
      } else {
        console.log('Successfully created check_table_exists function directly');
      }
    } else {
      console.log('Successfully created check_table_exists function');
    }
  } catch (error) {
    console.error('Error in createTableExistsFunction:', error);
  }
}

/**
 * Create the check_function_exists function
 */
async function createFunctionExistsFunction(): Promise<void> {
  try {
    const { error } = await supabase.rpc('create_check_function_exists_function');
    
    if (error) {
      console.error('Error creating check_function_exists function:', error);
      
      // Try to create the function directly
      const { error: directError } = await supabase.query(`
        CREATE OR REPLACE FUNCTION check_function_exists(function_name text)
        RETURNS boolean
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          RETURN EXISTS (
            SELECT FROM pg_proc
            JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
            WHERE pg_proc.proname = $1
            AND pg_namespace.nspname = 'public'
          );
        END;
        $$;
      `);
      
      if (directError) {
        console.error('Error creating check_function_exists function directly:', directError);
      } else {
        console.log('Successfully created check_function_exists function directly');
      }
    } else {
      console.log('Successfully created check_function_exists function');
    }
  } catch (error) {
    console.error('Error in createFunctionExistsFunction:', error);
  }
}

/**
 * Create the profiles table
 */
async function createProfilesTable(): Promise<void> {
  try {
    console.log('Creating profiles table...');
    
    // Try to use the create_profiles_table function if it exists
    const { error: functionError } = await supabase.rpc('create_profiles_table');
    
    if (functionError) {
      console.warn('Error using create_profiles_table function:', functionError);
      
      // Try to create the table directly
      const { error } = await supabase.query(`
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
        DO $$
        BEGIN
          -- Users can view their own profile
          IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile'
          ) THEN
            CREATE POLICY "Users can view their own profile"
              ON public.profiles
              FOR SELECT
              USING (auth.uid() = id);
          END IF;
          
          -- Users can update their own profile
          IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
          ) THEN
            CREATE POLICY "Users can update their own profile"
              ON public.profiles
              FOR UPDATE
              USING (auth.uid() = id);
          END IF;
          
          -- Users can insert their own profile
          IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
          ) THEN
            CREATE POLICY "Users can insert their own profile"
              ON public.profiles
              FOR INSERT
              WITH CHECK (auth.uid() = id);
          END IF;
        END
        $$;
        
        -- Create a function for updating the updated_at column
        CREATE OR REPLACE FUNCTION public.set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Create a trigger to update the updated_at column
        DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
        CREATE TRIGGER set_updated_at
          BEFORE UPDATE ON public.profiles
          FOR EACH ROW
          EXECUTE FUNCTION public.set_updated_at();
      `);
      
      if (error) {
        console.error('Error creating profiles table directly:', error);
      } else {
        console.log('Successfully created profiles table directly');
      }
    } else {
      console.log('Successfully created profiles table using function');
    }
  } catch (error) {
    console.error('Error in createProfilesTable:', error);
  }
}

/**
 * Create the handle_new_user function and trigger
 */
async function createHandleNewUserFunction(): Promise<void> {
  try {
    console.log('Creating handle_new_user function and trigger...');
    
    // Create the function and trigger
    const { error } = await supabase.query(`
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
        );
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
      console.error('Error creating handle_new_user function and trigger:', error);
    } else {
      console.log('Successfully created handle_new_user function and trigger');
    }
  } catch (error) {
    console.error('Error in createHandleNewUserFunction:', error);
  }
}

export default initializeDatabase;