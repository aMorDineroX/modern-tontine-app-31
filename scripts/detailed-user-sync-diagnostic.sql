-- Script de diagnostic détaillé pour la synchronisation des utilisateurs

-- 1. Détails complets des utilisateurs sans profil
WITH missing_profiles AS (
    SELECT 
        au.id AS auth_id,
        au.email AS auth_email,
        au.created_at AS auth_created_at,
        au.raw_user_meta_data AS user_metadata,
        p.id AS profile_id
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id::text = p.id::text
    WHERE p.id IS NULL
)
SELECT 
    auth_id,
    auth_email,
    auth_created_at,
    user_metadata,
    (user_metadata->>'full_name') AS extracted_full_name
FROM missing_profiles
LIMIT 20;

-- 2. Statistiques de synchronisation
SELECT 
    'Total Auth Users' AS metric, 
    COUNT(*) AS count 
FROM auth.users

UNION ALL

SELECT 
    'Total Profiles', 
    COUNT(*) 
FROM public.profiles

UNION ALL

SELECT 
    'Users Without Profile', 
    COUNT(*) 
FROM auth.users au
LEFT JOIN public.profiles p ON au.id::text = p.id::text
WHERE p.id IS NULL;

-- 3. Vérifier les métadonnées des utilisateurs
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data,
    COALESCE(
        raw_user_meta_data->>'full_name', 
        raw_user_meta_data->>'name', 
        'N/A'
    ) AS extracted_name
FROM auth.users
LIMIT 10;

-- 4. Diagnostic des contraintes et index
SELECT 
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
    tc.constraint_type = 'FOREIGN KEY' 
    AND (tc.table_name = 'profiles' OR tc.table_name = 'users');

-- 5. Vérifier les politiques RLS
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';