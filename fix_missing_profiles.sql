-- Script pour corriger les profils manquants

-- 1. Créer une fonction pour synchroniser les utilisateurs auth avec les profils
CREATE OR REPLACE FUNCTION sync_missing_profiles()
RETURNS void AS $$
DECLARE
    auth_user RECORD;
BEGIN
    -- Parcourir tous les utilisateurs dans auth.users qui n'ont pas de profil
    FOR auth_user IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
    LOOP
        -- Insérer un profil pour chaque utilisateur manquant
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            created_at
        ) VALUES (
            auth_user.id,
            COALESCE(auth_user.email, ''),
            CASE 
                WHEN auth_user.raw_user_meta_data IS NULL THEN NULL
                WHEN auth_user.raw_user_meta_data->>'full_name' IS NULL THEN NULL
                ELSE auth_user.raw_user_meta_data->>'full_name'
            END,
            NOW()
        );
        
        RAISE NOTICE 'Created profile for user %', auth_user.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Exécuter la fonction pour synchroniser les profils manquants
SELECT sync_missing_profiles();

-- 3. Vérifier les politiques RLS pour s'assurer que les utilisateurs peuvent accéder à leur profil
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Vérifier si la table profiles a les bonnes colonnes et contraintes
DO $$
BEGIN
    -- Vérifier si la colonne email existe et est NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email' 
        AND is_nullable = 'NO'
    ) THEN
        -- Si email est NOT NULL, le modifier pour accepter NULL
        ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
        RAISE NOTICE 'Modified email column to accept NULL values';
    END IF;
    
    -- Vérifier si la contrainte UNIQUE sur email existe
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.profiles'::regclass
        AND contype = 'u'
        AND conname LIKE '%email%'
    ) THEN
        -- Supprimer la contrainte UNIQUE sur email
        EXECUTE (
            SELECT 'ALTER TABLE public.profiles DROP CONSTRAINT ' || conname
            FROM pg_constraint
            WHERE conrelid = 'public.profiles'::regclass
            AND contype = 'u'
            AND conname LIKE '%email%'
            LIMIT 1
        );
        RAISE NOTICE 'Removed UNIQUE constraint on email column';
    END IF;
END $$;

-- 5. Créer un index sur la colonne id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- 6. Vérifier les permissions sur la table profiles
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

-- 7. Vérifier le profil spécifique mentionné dans l'erreur
DO $$
DECLARE
    user_exists BOOLEAN;
    profile_exists BOOLEAN;
    specific_user_id UUID := '1155c962-d653-4e3c-8967-d13c8e5aaca7'; -- ID mentionné dans l'erreur
BEGIN
    -- Vérifier si l'utilisateur existe dans auth.users
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE id = specific_user_id
    ) INTO user_exists;
    
    -- Vérifier si le profil existe
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = specific_user_id
    ) INTO profile_exists;
    
    -- Afficher les résultats
    RAISE NOTICE 'User % exists in auth.users: %', specific_user_id, user_exists;
    RAISE NOTICE 'User % exists in public.profiles: %', specific_user_id, profile_exists;
    
    -- Si l'utilisateur existe dans auth.users mais pas dans profiles, créer le profil
    IF user_exists AND NOT profile_exists THEN
        INSERT INTO public.profiles (id, email, created_at)
        SELECT id, email, NOW()
        FROM auth.users
        WHERE id = specific_user_id;
        
        RAISE NOTICE 'Created missing profile for user %', specific_user_id;
    END IF;
END $$;