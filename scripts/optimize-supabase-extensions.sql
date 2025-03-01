-- Script d'optimisation et de vérification des extensions Supabase

-- 1. Vérifier et potentiellement activer des extensions utiles
-- Décommentez et exécutez selon vos besoins

-- Extension pour les recherches full-text et les index avancés
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Extension pour les requêtes JSON avancées
-- CREATE EXTENSION IF NOT EXISTS jsonb_plpgsql;

-- 2. Configurer pg_stat_statements pour un meilleur suivi des performances
-- Ajoutez ces lignes à votre configuration PostgreSQL (généralement dans postgresql.conf)
/*
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.max = 10000
pg_stat_statements.track = all
pg_stat_statements.track_utility = on
*/

-- 3. Requête pour obtenir les requêtes les plus lentes
SELECT 
    query, 
    calls, 
    total_time, 
    (total_time / calls) AS avg_time_ms,
    rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- 4. Vérifier la configuration des UUID
-- Générer un UUID comme test
SELECT uuid_generate_v4();

-- 5. Test des fonctions cryptographiques
-- Exemple de hachage
SELECT crypt('mon_mot_de_passe', gen_salt('bf'));

-- 6. Vérifier la configuration de pgsodium
-- Test de chiffrement symétrique
/*
-- Générer une clé
SELECT pgsodium.create_key(
    key_id := 1,
    name := 'my_encryption_key',
    raw_key := pgsodium.generate_key()
);

-- Chiffrer des données
SELECT pgsodium.encrypt(
    message := 'Données sensibles',
    key := pgsodium.get_key(1)
);
*/

-- 7. Vérifier les politiques de sécurité recommandées
-- Désactiver les fonctions système potentiellement dangereuses
REVOKE EXECUTE ON FUNCTION pg_read_binary_file(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION pg_read_binary_file(text, bigint, bigint, boolean) FROM PUBLIC;

-- 8. Configurer le vault Supabase
-- Exemple de stockage sécurisé de secrets
/*
-- Insérer un secret
SELECT vault.create_secret(
    'ma_cle_api_secrete',
    'ma_cle_api'
);

-- Récupérer un secret
SELECT vault.get_secret('ma_cle_api');
*/

-- 9. Optimisation des performances
-- Activer l'auto-vacuum pour maintenir les performances
ALTER TABLE public.profiles SET (autovacuum_vacuum_threshold = 50);
ALTER TABLE public.profiles SET (autovacuum_analyze_threshold = 50);

-- 10. Vérifier les statistiques d'utilisation des index
SELECT 
    schemaname, 
    relname, 
    indexrelname, 
    idx_scan, 
    idx_tup_read, 
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC
LIMIT 10;

-- 11. Recommandations de création d'index
-- Exemple générique, à personnaliser selon vos besoins
-- CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
-- CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- 12. Vérifier l'espace disque et les performances
SELECT 
    schemaname, 
    relname, 
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS table_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;