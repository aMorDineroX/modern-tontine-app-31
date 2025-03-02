-- Suppression du trigger existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Modification de la fonction pour gérer les erreurs et les cas où raw_user_meta_data est null
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si l'utilisateur existe déjà dans la table profiles
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
        -- L'utilisateur existe déjà, ne rien faire
        RETURN NEW;
    END IF;

    -- Insérer le nouvel utilisateur avec gestion des cas où raw_user_meta_data est null
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        created_at
    )
    VALUES (
        NEW.id, 
        COALESCE(NEW.email, ''),
        CASE 
            WHEN NEW.raw_user_meta_data IS NULL THEN NULL
            WHEN NEW.raw_user_meta_data->>'full_name' IS NULL THEN NULL
            ELSE NEW.raw_user_meta_data->>'full_name'
        END,
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, enregistrer l'erreur mais ne pas bloquer la création de l'utilisateur
        RAISE WARNING 'Erreur lors de la création du profil pour l''utilisateur %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréation du trigger avec la nouvelle fonction
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Vérifier et corriger les permissions sur la fonction
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Vérifier que la table profiles existe et a les bonnes permissions
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

-- Assurez-vous que la table profiles accepte les valeurs NULL pour full_name
ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;