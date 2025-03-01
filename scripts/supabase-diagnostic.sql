-- Script de diagnostic pour Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase pour vérifier l'état de votre base de données

-- 1. Vérifier si la table profiles existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'profiles'
) AS profiles_table_exists;

-- 2. Vérifier la structure de la table profiles (si elle existe)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes sur la table profiles
SELECT con.conname AS constraint_name,
       con.contype AS constraint_type,
       CASE WHEN con.contype = 'p' THEN 'PRIMARY KEY'
            WHEN con.contype = 'f' THEN 'FOREIGN KEY'
            WHEN con.contype = 'u' THEN 'UNIQUE'
            WHEN con.contype = 'c' THEN 'CHECK'
            ELSE con.contype::text END AS constraint_type_desc,
       pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
AND rel.relname = 'profiles';

-- 4. Vérifier les politiques RLS (Row Level Security) sur la table profiles
SELECT pol.polname AS policy_name,
       rel.relname AS table_name,
       CASE WHEN pol.polpermissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END AS policy_type,
       CASE WHEN pol.polroles = '{0}' THEN 'PUBLIC' 
            ELSE array_to_string(array(SELECT rolname FROM pg_roles WHERE oid = ANY(pol.polroles)), ', ') 
       END AS roles,
       CASE pol.polcmd
            WHEN 'r' THEN 'SELECT'
            WHEN 'a' THEN 'INSERT'
            WHEN 'w' THEN 'UPDATE'
            WHEN 'd' THEN 'DELETE'
            WHEN '*' THEN 'ALL'
       END AS command,
       pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
       pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression
FROM pg_policy pol
JOIN pg_class rel ON rel.oid = pol.polrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
AND rel.relname = 'profiles';

-- 5. Vérifier si RLS est activé sur la table profiles
SELECT rel.relname AS table_name,
       rel.relrowsecurity AS rls_enabled
FROM pg_class rel
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
AND rel.relname = 'profiles';

-- 6. Vérifier les permissions sur la table profiles
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY grantee, privilege_type;

-- 7. Vérifier les triggers sur la table profiles
SELECT trigger_name, event_manipulation, action_statement, action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'profiles'
ORDER BY trigger_name;

-- 8. Vérifier les utilisateurs authentifiés dans auth.users
-- Note: Ceci nécessite des permissions spéciales
SELECT COUNT(*) AS total_users
FROM auth.users;

-- 9. Vérifier la correspondance entre auth.users et profiles
-- Note: Ceci nécessite des permissions spéciales
-- Utilisation de CAST pour gérer les différences de types entre UUID et BIGINT
SELECT
  (SELECT COUNT(*) FROM auth.users) AS auth_users_count,
  (SELECT COUNT(*) FROM public.profiles) AS profile_users_count,
  (SELECT COUNT(*) 
   FROM auth.users a 
   LEFT JOIN public.profiles p ON a.id::text = p.id::text 
   WHERE p.id IS NULL) AS auth_users_without_profile,
  (SELECT COUNT(*) 
   FROM public.profiles p 
   LEFT JOIN auth.users a ON p.id::text = a.id::text 
   WHERE a.id IS NULL) AS profiles_without_auth_user;

-- 10. Script pour créer la table profiles si elle n'existe pas
-- Décommentez et exécutez cette section si la table n'existe pas
/*
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- Ajouter un trigger pour mettre à jour le champ updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Ajouter les politiques RLS pour sécuriser la table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Politique pour permettre l'insertion lors de l'inscription
CREATE POLICY "Service role can create profiles"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Accorder les permissions nécessaires
GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon, authenticated, service_role;
*/

-- 11. Vérifier les extensions installées
SELECT name, default_version, installed_version, comment
FROM pg_available_extensions
WHERE installed_version IS NOT NULL
ORDER BY name;