-- Script de diagnostic et correction pour les problèmes de profil utilisateur

-- 1. Vérifier si l'utilisateur spécifique existe dans auth.users
DO $$
DECLARE
    specific_user_id UUID := '1155c962-d653-4e3c-8967-d13c8e5aaca7'; -- ID mentionné dans l'erreur
    user_count INTEGER;
BEGIN
    -- Vérifier si l'utilisateur existe dans auth.users
    SELECT COUNT(*) INTO user_count FROM auth.users WHERE id = specific_user_id;
    
    RAISE NOTICE 'Nombre d''utilisateurs trouvés dans auth.users avec ID %: %', specific_user_id, user_count;
    
    -- Si l'utilisateur n'existe pas, afficher un message
    IF user_count = 0 THEN
        RAISE NOTICE 'L''utilisateur avec ID % n''existe pas dans auth.users. Vérifiez l''ID utilisateur.', specific_user_id;
    END IF;
END $$;

-- 2. Vérifier si le profil existe déjà dans public.profiles
DO $$
DECLARE
    specific_user_id UUID := '1155c962-d653-4e3c-8967-d13c8e5aaca7';
    profile_count INTEGER;
BEGIN
    -- Vérifier si le profil existe dans public.profiles
    SELECT COUNT(*) INTO profile_count FROM public.profiles WHERE id = specific_user_id;
    
    RAISE NOTICE 'Nombre de profils trouvés dans public.profiles avec ID %: %', specific_user_id, profile_count;
    
    -- Si le profil existe déjà, afficher un message
    IF profile_count > 0 THEN
        RAISE NOTICE 'Un profil existe déjà pour l''utilisateur avec ID %. Le problème pourrait être lié aux politiques RLS.', specific_user_id;
    END IF;
END $$;

-- 3. Créer manuellement le profil si nécessaire
DO $$
DECLARE
    specific_user_id UUID := '1155c962-d653-4e3c-8967-d13c8e5aaca7';
    user_exists BOOLEAN;
    profile_exists BOOLEAN;
    user_email TEXT;
    user_meta JSONB;
BEGIN
    -- Vérifier si l'utilisateur existe dans auth.users
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE id = specific_user_id
    ) INTO user_exists;
    
    -- Vérifier si le profil existe dans public.profiles
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = specific_user_id
    ) INTO profile_exists;
    
    -- Si l'utilisateur existe mais pas le profil, créer le profil
    IF user_exists AND NOT profile_exists THEN
        -- Récupérer l'email et les métadonnées de l'utilisateur
        SELECT email, raw_user_meta_data INTO user_email, user_meta
        FROM auth.users
        WHERE id = specific_user_id;
        
        -- Insérer le profil
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            created_at
        ) VALUES (
            specific_user_id,
            COALESCE(user_email, ''),
            CASE 
                WHEN user_meta IS NULL THEN NULL
                WHEN user_meta->>'full_name' IS NULL THEN NULL
                ELSE user_meta->>'full_name'
            END,
            NOW()
        );
        
        RAISE NOTICE 'Profil créé manuellement pour l''utilisateur avec ID %', specific_user_id;
    ELSIF NOT user_exists THEN
        RAISE NOTICE 'Impossible de créer le profil car l''utilisateur n''existe pas dans auth.users';
    ELSIF profile_exists THEN
        RAISE NOTICE 'Le profil existe déjà, aucune action nécessaire';
    END IF;
END $$;

-- 4. Vérifier les politiques RLS sur la table profiles
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Compter les politiques RLS pour la table profiles
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles';
    
    RAISE NOTICE 'Nombre de politiques RLS sur la table profiles: %', policy_count;
    
    -- Afficher les détails des politiques
    RAISE NOTICE 'Détails des politiques RLS:';
    FOR policy_record IN
        SELECT policyname, permissive, cmd, qual
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        RAISE NOTICE 'Politique: %, Permissive: %, Commande: %, Condition: %',
            policy_record.policyname,
            policy_record.permissive,
            policy_record.cmd,
            policy_record.qual;
    END LOOP;
END $$;

-- 5. Créer ou recréer les politiques RLS essentielles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id OR auth.uid() IN (
    SELECT rolsuper FROM pg_roles WHERE rolname = CURRENT_USER
));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can access all profiles" ON public.profiles;
CREATE POLICY "Service role can access all profiles" 
ON public.profiles FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- 6. Vérifier si la table profiles est accessible
DO $$
BEGIN
    RAISE NOTICE 'Vérification de l''accès à la table profiles:';
    RAISE NOTICE 'Nombre total de profils: %', (SELECT COUNT(*) FROM public.profiles);
END $$;

-- 7. Créer un profil par défaut pour l'utilisateur spécifique (même s'il n'existe pas dans auth.users)
DO $$
DECLARE
    specific_user_id UUID := '1155c962-d653-4e3c-8967-d13c8e5aaca7';
    profile_exists BOOLEAN;
BEGIN
    -- Vérifier si le profil existe
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = specific_user_id
    ) INTO profile_exists;
    
    -- Si le profil n'existe pas, le créer avec des valeurs par défaut
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            created_at
        ) VALUES (
            specific_user_id,
            'utilisateur@exemple.com', -- Email par défaut
            'Utilisateur Tontine',     -- Nom par défaut
            NOW()
        );
        
        RAISE NOTICE 'Profil par défaut créé pour l''ID %', specific_user_id;
    ELSE
        RAISE NOTICE 'Le profil existe déjà pour l''ID %', specific_user_id;
    END IF;
END $$;

-- 8. Vérifier à nouveau si le profil spécifique existe maintenant
DO $$
DECLARE
    specific_user_id UUID := '1155c962-d653-4e3c-8967-d13c8e5aaca7';
    profile_data JSONB;
BEGIN
    -- Récupérer les données du profil
    SELECT row_to_json(p)::jsonb INTO profile_data
    FROM public.profiles p
    WHERE id = specific_user_id;
    
    -- Afficher les résultats
    IF profile_data IS NOT NULL THEN
        RAISE NOTICE 'Profil trouvé pour l''ID %: %', specific_user_id, profile_data;
    ELSE
        RAISE NOTICE 'Aucun profil trouvé pour l''ID % après toutes les tentatives de correction', specific_user_id;
    END IF;
END $$;