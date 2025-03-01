-- Script pour corriger les incompatibilités de type d'ID

-- ATTENTION : Exécutez ce script avec précaution. Faites d'abord une sauvegarde complète de votre base de données.

-- 1. Script pour convertir les ID de bigint à UUID dans la table profiles
-- IMPORTANT : Vérifiez et adaptez ce script selon vos données réelles

-- Étape 1 : Ajouter une nouvelle colonne UUID
ALTER TABLE public.profiles 
ADD COLUMN new_id UUID;

-- Étape 2 : Copier les données en convertissant l'ID
UPDATE public.profiles 
SET new_id = gen_random_uuid()
WHERE new_id IS NULL;

-- Étape 3 : Mettre à jour new_id avec les valeurs correspondantes de auth.users
UPDATE public.profiles p
SET new_id = a.id::uuid
FROM auth.users a
WHERE a.id::text = p.id::text;

-- Étape 4 : Supprimer l'ancienne colonne id
ALTER TABLE public.profiles 
DROP COLUMN id;

-- Étape 5 : Renommer new_id en id
ALTER TABLE public.profiles 
RENAME COLUMN new_id TO id;

-- Étape 6 : Recréer la contrainte de clé primaire
ALTER TABLE public.profiles 
ADD PRIMARY KEY (id);

-- Étape 7 : Recréer la contrainte de clé étrangère
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Script alternatif si les données sont simples
-- ATTENTION : Ne l'utilisez que si vous êtes sûr que les ID peuvent être générés à nouveau
/*
-- Supprimer la table profiles existante
DROP TABLE public.profiles;

-- Recréer la table avec le bon type d'ID
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

-- Insérer les données à partir d'auth.users
INSERT INTO public.profiles (id, email, full_name, created_at)
SELECT 
  id::uuid, 
  email, 
  raw_user_meta_data->>'full_name', 
  created_at
FROM auth.users;
*/

-- Vérification finale
SELECT 
  COUNT(*) AS total_users,
  COUNT(DISTINCT id) AS distinct_ids,
  pg_typeof((SELECT id FROM public.profiles LIMIT 1)) AS id_type
FROM public.profiles;