-- Script pour corriger les problèmes de sécurité dans la base de données Supabase

-- 1. Activer RLS sur toutes les tables qui ont des politiques mais RLS désactivé
ALTER TABLE public.tontine_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 2. Recréer les vues sans SECURITY DEFINER pour éviter de contourner les politiques RLS

-- Recréer la vue active_groups
DROP VIEW IF EXISTS public.active_groups;
CREATE VIEW public.active_groups AS
SELECT tg.*, COUNT(gm.id) as member_count
FROM public.tontine_groups tg
JOIN public.group_members gm ON tg.id = gm.group_id
WHERE tg.status = 'active' AND gm.status = 'active'
GROUP BY tg.id;

-- Recréer la vue upcoming_contributions
DROP VIEW IF EXISTS public.upcoming_contributions;
CREATE VIEW public.upcoming_contributions AS
SELECT c.*, tg.name as group_name
FROM public.contributions c
JOIN public.tontine_groups tg ON c.group_id = tg.id
WHERE c.status = 'pending' AND c.payment_date >= CURRENT_DATE
ORDER BY c.payment_date;

-- Recréer la vue upcoming_payouts
DROP VIEW IF EXISTS public.upcoming_payouts;
CREATE VIEW public.upcoming_payouts AS
SELECT p.*, tg.name as group_name
FROM public.payouts p
JOIN public.tontine_groups tg ON p.group_id = tg.id
WHERE p.status IN ('scheduled', 'pending') AND p.payout_date >= CURRENT_DATE
ORDER BY p.payout_date;

-- 3. Créer des politiques RLS pour les vues
CREATE POLICY "Users can view active groups they are members of" 
ON public.tontine_groups FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = tontine_groups.id 
        AND gm.user_id = auth.uid()
    )
);

-- 4. Vérifier que toutes les tables ont RLS activé
DO $$
DECLARE
    table_record RECORD;
BEGIN
    RAISE NOTICE 'Vérification de l''activation RLS sur toutes les tables:';
    
    FOR table_record IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
        RAISE NOTICE 'RLS activé sur la table: %', table_record.tablename;
    END LOOP;
END $$;

-- 5. Vérifier les politiques RLS existantes
DO $$
DECLARE
    table_record RECORD;
    policy_count INTEGER;
BEGIN
    RAISE NOTICE 'Vérification des politiques RLS sur toutes les tables:';
    
    FOR table_record IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = table_record.tablename;
        
        RAISE NOTICE 'Table: %, Nombre de politiques: %', table_record.tablename, policy_count;
        
        -- Si aucune politique n'existe, créer une politique par défaut restrictive
        IF policy_count = 0 THEN
            EXECUTE format('
                CREATE POLICY "Default deny policy" 
                ON public.%I FOR ALL 
                USING (false)
            ', table_record.tablename);
            
            RAISE NOTICE 'Politique par défaut restrictive créée pour la table: %', table_record.tablename;
        END IF;
    END LOOP;
END $$;

-- 6. Accorder les permissions nécessaires
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- 7. Vérifier les fonctions SECURITY DEFINER
DO $$
DECLARE
    func_record RECORD;
BEGIN
    RAISE NOTICE 'Vérification des fonctions SECURITY DEFINER:';
    
    FOR func_record IN
        SELECT proname, prosecdef
        FROM pg_proc
        JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
        WHERE nspname = 'public' AND prosecdef = true
    LOOP
        RAISE NOTICE 'Fonction SECURITY DEFINER trouvée: %', func_record.proname;
    END LOOP;
END $$;

-- 8. Vérifier que les tables essentielles ont des politiques appropriées
-- Vérifier la table profiles
DO $$
DECLARE
    policy_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view their own profile'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Users can view their own profile" 
        ON public.profiles FOR SELECT 
        USING (auth.uid() = id);
        
        RAISE NOTICE 'Politique "Users can view their own profile" créée pour la table profiles';
    END IF;
END $$;

-- 9. Vérifier l'activation RLS finale
DO $$
DECLARE
    table_record RECORD;
    rls_enabled BOOLEAN;
BEGIN
    RAISE NOTICE 'Vérification finale de l''activation RLS:';
    
    FOR table_record IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class
        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
        WHERE nspname = 'public' AND relname = table_record.tablename;
        
        RAISE NOTICE 'Table: %, RLS activé: %', table_record.tablename, rls_enabled;
    END LOOP;
END $$;