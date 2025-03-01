-- Create a comprehensive signup debugging function
CREATE OR REPLACE FUNCTION public.debug_signup(
    p_user_id UUID, 
    p_email TEXT, 
    p_full_name TEXT DEFAULT NULL
)
RETURNS TABLE (
    auth_user_exists BOOLEAN,
    profile_exists BOOLEAN,
    auth_user_details JSONB,
    profile_details JSONB,
    error_message TEXT
) AS $$
DECLARE
    v_auth_user RECORD;
    v_profile RECORD;
    v_error_message TEXT := '';
BEGIN
    -- Check auth.users table
    SELECT * INTO v_auth_user 
    FROM auth.users 
    WHERE id = p_user_id OR email = p_email;
    
    -- Check profiles table
    SELECT * INTO v_profile 
    FROM public.profiles 
    WHERE id = p_user_id OR email = p_email;
    
    -- Validate inputs
    IF p_user_id IS NULL THEN
        v_error_message := v_error_message || 'User ID is null. ';
    END IF;
    
    IF p_email IS NULL THEN
        v_error_message := v_error_message || 'Email is null. ';
    END IF;
    
    -- Check auth user existence and details
    IF v_auth_user.id IS NULL THEN
        v_error_message := v_error_message || 'No auth user found. ';
    ELSE
        -- Check for potential conflicts
        IF v_auth_user.email != p_email THEN
            v_error_message := v_error_message || 'Email mismatch in auth.users. ';
        END IF;
        
        IF p_full_name IS NOT NULL AND 
           (v_auth_user.raw_user_meta_data->>'full_name' IS NULL OR 
            v_auth_user.raw_user_meta_data->>'full_name' != p_full_name) THEN
            v_error_message := v_error_message || 'Full name mismatch in auth.users. ';
        END IF;
    END IF;
    
    -- Check profile existence and details
    IF v_profile.id IS NULL THEN
        v_error_message := v_error_message || 'No profile found. ';
    ELSE
        -- Check for potential conflicts
        IF v_profile.email != p_email THEN
            v_error_message := v_error_message || 'Email mismatch in profiles. ';
        END IF;
        
        IF p_full_name IS NOT NULL AND 
           (v_profile.full_name IS NULL OR 
            v_profile.full_name != p_full_name) THEN
            v_error_message := v_error_message || 'Full name mismatch in profiles. ';
        END IF;
    END IF;
    
    -- Return results
    RETURN QUERY 
    SELECT 
        v_auth_user.id IS NOT NULL,
        v_profile.id IS NOT NULL,
        to_jsonb(v_auth_user),
        to_jsonb(v_profile),
        v_error_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to force profile creation
CREATE OR REPLACE FUNCTION public.force_create_profile(
    p_user_id UUID, 
    p_email TEXT, 
    p_full_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Attempt to insert or update the profile
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        created_at
    ) VALUES (
        p_user_id, 
        p_email, 
        p_full_name, 
        NOW()
    )
    ON CONFLICT (id) DO UPDATE 
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        updated_at = NOW();
    
    -- Retrieve and return the inserted/updated profile
    SELECT to_jsonb(profiles.*) INTO v_result
    FROM public.profiles
    WHERE id = p_user_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a comprehensive signup validation trigger
CREATE OR REPLACE FUNCTION public.validate_signup()
RETURNS TRIGGER AS $$
DECLARE
    v_existing_user UUID;
    v_full_name TEXT;
BEGIN
    -- Extract full name from user metadata
    v_full_name := NEW.raw_user_meta_data->>'full_name';
    
    -- Check for existing user with the same email
    SELECT id INTO v_existing_user 
    FROM auth.users 
    WHERE email = NEW.email AND id != NEW.id;
    
    IF v_existing_user IS NOT NULL THEN
        RAISE EXCEPTION 'User with this email already exists';
    END IF;
    
    -- Attempt to create profile
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        created_at
    ) VALUES (
        NEW.id, 
        NEW.email, 
        v_full_name, 
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_validate ON auth.users;
CREATE TRIGGER on_auth_user_created_validate
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.validate_signup();

-- Add some helpful comments
COMMENT ON FUNCTION public.debug_signup IS 'Helps diagnose issues during user signup by checking auth and profile tables';
COMMENT ON FUNCTION public.force_create_profile IS 'Force creates or updates a user profile, useful for resolving signup issues';
COMMENT ON FUNCTION public.validate_signup IS 'Validates and ensures profile creation during user signup';