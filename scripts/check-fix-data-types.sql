-- Script pour vérifier et corriger les types de données dans Supabase

-- 1. Vérifier le type de données de la colonne id dans auth.users
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema = 'auth'
AND table_name = 'users'
AND column_name = 'id';

-- 2. Vérifier le type de données de la colonne id dans public.profiles
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name = 'id';

-- 3. Vérifier la contrainte de clé étrangère
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
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name = 'profiles';

-- 4. Si la table profiles existe mais avec un mauvais type de données pour id,
-- voici comment la recréer correctement (ATTENTION: cela supprimera la table existante)
/*
-- Supprimer la table existante
DROP TABLE IF EXISTS public.profiles;

-- Recréer la table avec le bon type de données
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  preferred_language TEXT DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Configurer les politiques RLS et les permissions comme dans le script create-profiles-table.sql
*/

-- 5. Si vous ne pouvez pas recréer la table, vous pouvez essayer de modifier le type de données
-- ATTENTION: Cela peut échouer si des données existent déjà et ne sont pas compatibles
/*
ALTER TABLE public.profiles
ALTER COLUMN id TYPE UUID USING id::uuid;
*/

-- 6. Vérifier si la table auth.users utilise UUID ou un autre type
SELECT
  EXISTS (
    SELECT 1 FROM auth.users LIMIT 1
  ) AS auth_users_has_data,
  (
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'auth'
    AND table_name = 'users'
    AND column_name = 'id'
  ) AS auth_users_id_type;

-- 7. Exemple de requête pour comparer les IDs en convertissant les types
-- Cette requête peut aider à diagnostiquer les problèmes de correspondance
SELECT 
  a.id AS auth_id, 
  p.id AS profile_id,
  a.id::text = p.id::text AS ids_match_as_text,
  a.id::uuid = p.id::uuid AS ids_match_as_uuid
FROM auth.users a
LEFT JOIN public.profiles p ON a.id::text = p.id::text
LIMIT 10;