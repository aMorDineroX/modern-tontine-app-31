-- Script pour synchroniser les utilisateurs auth.users avec public.profiles

-- 1. Créer une fonction pour insérer des profils manquants
CREATE OR REPLACE FUNCTION sync_missing_profiles()
RETURNS TABLE(
    inserted_count INTEGER, 
    skipped_count INTEGER
) AS $$
DECLARE
    inserted_count INTEGER := 0;
    skipped_count INTEGER := 0;
BEGIN
    -- Insérer des profils pour les utilisateurs auth sans profil
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        created_at
    )
    SELECT 
        au.id::uuid, 
        au.email, 
        au.raw_user_meta_data->>'full_name', 
        au.created_at
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id::text = p.id::text
    WHERE p.id IS NULL
    ON CONFLICT (id) DO NOTHING
    RETURNING 1 INTO inserted_count;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    skipped_count := (SELECT COUNT(*) 
                      FROM auth.users au
                      LEFT JOIN public.profiles p ON au.id::text = p.id::text
                      WHERE p.id IS NULL) - inserted_count;

    RETURN QUERY 
    SELECT inserted_count, skipped_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Exécuter la synchronisation
SELECT * FROM sync_missing_profiles();

-- 3. Vérifier la synchronisation
SELECT 
    (SELECT COUNT(*) FROM auth.users) AS total_auth_users,
    (SELECT COUNT(*) FROM public.profiles) AS total_profiles,
    (SELECT COUNT(*) 
     FROM auth.users au
     LEFT JOIN public.profiles p ON au.id::text = p.id::text
     WHERE p.id IS NULL) AS users_without_profile;

-- 4. Créer un déclencheur pour les futures inscriptions
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        created_at
    ) VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name', 
        NEW.created_at
    ) ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attacher le déclencheur
DROP TRIGGER IF EXISTS create_profile_for_new_user ON auth.users;
CREATE TRIGGER create_profile_for_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();