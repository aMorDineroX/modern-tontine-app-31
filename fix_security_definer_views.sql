-- Script pour corriger les vues SECURITY DEFINER

-- 1. Vérifier si les vues sont définies avec SECURITY DEFINER
DO $$
DECLARE
    view_definition TEXT;
BEGIN
    -- Vérifier active_groups
    SELECT pg_get_viewdef('public.active_groups'::regclass) INTO view_definition;
    RAISE NOTICE 'Définition de la vue active_groups: %', view_definition;
    
    -- Vérifier upcoming_contributions
    SELECT pg_get_viewdef('public.upcoming_contributions'::regclass) INTO view_definition;
    RAISE NOTICE 'Définition de la vue upcoming_contributions: %', view_definition;
    
    -- Vérifier upcoming_payouts
    SELECT pg_get_viewdef('public.upcoming_payouts'::regclass) INTO view_definition;
    RAISE NOTICE 'Définition de la vue upcoming_payouts: %', view_definition;
END $$;

-- 2. Supprimer les vues existantes
DROP VIEW IF EXISTS public.active_groups CASCADE;
DROP VIEW IF EXISTS public.upcoming_contributions CASCADE;
DROP VIEW IF EXISTS public.upcoming_payouts CASCADE;

-- 3. Recréer les vues avec des politiques RLS
-- Vue active_groups
CREATE OR REPLACE VIEW public.active_groups AS
SELECT tg.*, COUNT(gm.id) as member_count
FROM public.tontine_groups tg
JOIN public.group_members gm ON tg.id = gm.group_id
WHERE tg.status = 'active' AND gm.status = 'active'
GROUP BY tg.id;

-- Politique RLS pour active_groups
CREATE POLICY "Users can view active groups they are members of"
ON public.active_groups
FOR SELECT
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = active_groups.id 
        AND gm.user_id = auth.uid()
    )
);

-- Vue upcoming_contributions
CREATE OR REPLACE VIEW public.upcoming_contributions AS
SELECT c.*, tg.name as group_name
FROM public.contributions c
JOIN public.tontine_groups tg ON c.group_id = tg.id
WHERE c.status = 'pending' AND c.payment_date >= CURRENT_DATE
ORDER BY c.payment_date;

-- Politique RLS pour upcoming_contributions
CREATE POLICY "Users can view upcoming contributions in their groups"
ON public.upcoming_contributions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = upcoming_contributions.group_id 
        AND gm.user_id = auth.uid()
    )
);

-- Vue upcoming_payouts
CREATE OR REPLACE VIEW public.upcoming_payouts AS
SELECT p.*, tg.name as group_name
FROM public.payouts p
JOIN public.tontine_groups tg ON p.group_id = tg.id
WHERE p.status IN ('scheduled', 'pending') AND p.payout_date >= CURRENT_DATE
ORDER BY p.payout_date;

-- Politique RLS pour upcoming_payouts
CREATE POLICY "Users can view upcoming payouts in their groups"
ON public.upcoming_payouts
FOR SELECT
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = upcoming_payouts.group_id 
        AND gm.user_id = auth.uid()
    )
);

-- 4. Activer RLS sur les vues
ALTER VIEW public.active_groups ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.upcoming_contributions ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.upcoming_payouts ENABLE ROW LEVEL SECURITY;

-- 5. Accorder les permissions nécessaires sur les vues
GRANT SELECT ON public.active_groups TO authenticated, anon;
GRANT SELECT ON public.upcoming_contributions TO authenticated, anon;
GRANT SELECT ON public.upcoming_payouts TO authenticated, anon;

-- 6. Vérifier la définition des vues
DO $$
DECLARE
    view_record RECORD;
BEGIN
    RAISE NOTICE 'Vérification des définitions de vues:';
    
    FOR view_record IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND viewname IN ('active_groups', 'upcoming_contributions', 'upcoming_payouts')
    LOOP
        RAISE NOTICE 'Définition de la vue %: %', 
            view_record.viewname, 
            pg_get_viewdef(format('public.%I', view_record.viewname)::regclass);
    END LOOP;
END $$;

-- 7. Vérifier les politiques RLS sur les vues
DO $$
DECLARE
    view_record RECORD;
BEGIN
    RAISE NOTICE 'Vérification des politiques RLS:';
    
    FOR view_record IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND viewname IN ('active_groups', 'upcoming_contributions', 'upcoming_payouts')
    LOOP
        RAISE NOTICE 'Politiques pour la vue %:', view_record.viewname;
        
        FOR policy_record IN
            SELECT polname, qual
            FROM pg_policy
            WHERE polrelid = format('public.%I', view_record.viewname)::regclass
        LOOP
            RAISE NOTICE '  - Politique: %, Condition: %', 
                policy_record.polname, 
                policy_record.qual;
        END LOOP;
    END LOOP;
END $$;