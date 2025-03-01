-- Diagnose Signup and Profile Creation Issues

-- Check Auth Configuration
SELECT 
    key, 
    value
FROM 
    auth.config
WHERE 
    key IN (
        'disable_signup', 
        'security_email_confirmations', 
        'security_email_password_reset'
    );

-- Check Existing Users
SELECT 
    id, 
    email, 
    raw_user_meta_data, 
    created_at, 
    last_sign_in_at
FROM 
    auth.users
ORDER BY 
    created_at DESC
LIMIT 10;

-- Check Profiles Table Entries
SELECT 
    p.id, 
    p.email, 
    p.full_name, 
    p.created_at,
    a.email AS auth_email,
    a.raw_user_meta_data
FROM 
    public.profiles p
LEFT JOIN 
    auth.users a ON p.id = a.id
ORDER BY 
    p.created_at DESC
LIMIT 10;

-- Check for Potential Conflicts or Errors
WITH user_profile_check AS (
    SELECT 
        a.id AS auth_id, 
        a.email AS auth_email, 
        p.id AS profile_id, 
        p.email AS profile_email,
        CASE 
            WHEN a.id IS NULL THEN 'Missing Auth User'
            WHEN p.id IS NULL THEN 'Missing Profile'
            WHEN a.email != p.email THEN 'Email Mismatch'
            ELSE 'OK'
        END AS status
    FROM 
        auth.users a
    FULL OUTER JOIN 
        public.profiles p ON a.id = p.id
)
SELECT 
    status, 
    COUNT(*) AS count
FROM 
    user_profile_check
GROUP BY 
    status;

-- Check RLS Policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM 
    pg_policies
WHERE 
    schemaname = 'public' AND tablename = 'profiles';

-- Check Table Constraints
SELECT 
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.table_name = 'profiles';

-- Check Column Definitions
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    column_default, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'profiles'
ORDER BY 
    ordinal_position;

-- Potential Trigger or Function Issues
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement
FROM 
    information_schema.triggers
WHERE 
    event_object_table = 'profiles' OR trigger_name LIKE '%user%';