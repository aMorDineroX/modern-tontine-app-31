-- Script de diagnostic détaillé pour les types d'ID

-- 1. Vérifier le type exact de la colonne id dans auth.users
SELECT 
    column_name, 
    data_type, 
    udt_name,
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users' 
AND column_name = 'id';

-- 2. Examiner quelques enregistrements de auth.users
SELECT 
    id, 
    pg_typeof(id) AS id_type, 
    email, 
    created_at
FROM auth.users
LIMIT 5;

-- 3. Vérifier le type de la colonne id dans public.profiles
SELECT 
    column_name, 
    data_type, 
    udt_name,
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name = 'id';

-- 4. Examiner quelques enregistrements de public.profiles
SELECT 
    id, 
    pg_typeof(id) AS id_type, 
    email, 
    created_at
FROM public.profiles
LIMIT 5;

-- 5. Requête de diagnostic pour comprendre la relation entre les tables
SELECT 
    a.id AS auth_id, 
    a.id::text AS auth_id_text,
    p.id AS profile_id, 
    p.id::text AS profile_id_text,
    a.email AS auth_email,
    p.email AS profile_email
FROM auth.users a
FULL OUTER JOIN public.profiles p 
    ON a.id::text = p.id::text
LIMIT 10;

-- 6. Vérifier les contraintes de clé étrangère
SELECT 
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name = 'profiles';