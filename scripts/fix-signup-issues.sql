-- Script pour diagnostiquer et corriger les problèmes d'inscription dans Supabase

-- 1. Vérifier les déclencheurs (triggers) sur la table auth.users
-- Ces déclencheurs sont souvent responsables de la création automatique de profils
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users'
ORDER BY trigger_name;

-- 2. Vérifier les fonctions qui pourraient être appelées par ces déclencheurs
SELECT 
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE '%profile%';

-- 3. Créer un déclencheur pour créer automatiquement un profil lors de l'inscription
-- Décommentez et exécutez si nécessaire
/*
-- Créer la fonction qui sera appelée par le déclencheur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le déclencheur qui appelle la fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
*/

-- 4. Vérifier les utilisateurs sans profil et créer des profils pour eux
WITH users_without_profiles AS (
  SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id::text = p.id::text
  WHERE p.id IS NULL
)
SELECT * FROM users_without_profiles;

-- 5. Créer des profils pour les utilisateurs qui n'en ont pas
-- Décommentez et exécutez si nécessaire
/*
INSERT INTO public.profiles (id, email, full_name, created_at)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id::text = au.id::text
);
*/

-- 6. Vérifier les permissions du rôle anon sur la table profiles
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND grantee = 'anon'
ORDER BY privilege_type;

-- 7. Accorder les permissions nécessaires au rôle anon
-- Décommentez et exécutez si nécessaire
/*
GRANT SELECT, INSERT ON public.profiles TO anon;
*/

-- 8. Vérifier les politiques RLS pour l'insertion
SELECT 
    pol.polname AS policy_name,
    pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression
FROM pg_policy pol
JOIN pg_class rel ON rel.oid = pol.polrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
AND rel.relname = 'profiles'
AND pol.polcmd = 'a'; -- 'a' pour INSERT

-- 9. Créer une politique RLS pour permettre l'insertion par le rôle anon
-- Décommentez et exécutez si nécessaire
/*
CREATE POLICY "Allow anon to insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (true);
*/