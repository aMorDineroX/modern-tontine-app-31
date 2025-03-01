-- Verify and Update Profiles Table Configuration

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Check and add preferred_language column
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='preferred_language'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN preferred_language TEXT DEFAULT 'en';
    END IF;

    -- Check and add notification_preferences column
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='notification_preferences'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}';
    END IF;
END $$;

-- Ensure unique constraint on email
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' AND constraint_type = 'UNIQUE'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT unique_email UNIQUE (email);
    END IF;
END $$;

-- Ensure NOT NULL constraints
ALTER TABLE public.profiles 
ALTER COLUMN id SET NOT NULL,
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN created_at SET NOT NULL;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Add a trigger to ensure the profile is created when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert the new user into the profiles table
    INSERT INTO public.profiles (id, email, full_name, created_at)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name', 
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comments to help understand the table structure
COMMENT ON TABLE public.profiles IS 'Stores user profile information linked to Supabase Auth';
COMMENT ON COLUMN public.profiles.id IS 'Matches the user''s ID in auth.users';
COMMENT ON COLUMN public.profiles.email IS 'User''s email address';
COMMENT ON COLUMN public.profiles.full_name IS 'User''s full name';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user''s profile picture';
COMMENT ON COLUMN public.profiles.phone_number IS 'User''s phone number';
COMMENT ON COLUMN public.profiles.preferred_language IS 'User''s preferred language for the application';
COMMENT ON COLUMN public.profiles.notification_preferences IS 'User''s notification preferences in JSON format';
COMMENT ON COLUMN public.profiles.created_at IS 'Timestamp of when the profile was created';

-- Verify the table configuration
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'profiles'
ORDER BY 
    ordinal_position;

-- Check existing RLS policies
SELECT 
    polname, 
    polCmd, 
    polpermissive, 
    polroles
FROM 
    pg_policy
WHERE 
    polrelid = 'public.profiles'::regclass;