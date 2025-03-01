-- Script de test de sécurité et de performances pour Supabase

-- 1. Test de génération de UUID
DO $$
DECLARE
    test_uuid UUID;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
BEGIN
    start_time := clock_timestamp();
    test_uuid := uuid_generate_v4();
    end_time := clock_timestamp();
    
    RAISE NOTICE 'UUID Generation Time: %', (end_time - start_time);
    RAISE NOTICE 'Generated UUID: %', test_uuid;
END $$;

-- 2. Test de hachage de mot de passe
DO $$
DECLARE
    plain_password TEXT := 'TestPassword123!';
    salt TEXT;
    hashed_password TEXT;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
BEGIN
    start_time := clock_timestamp();
    salt := gen_salt('bf');
    hashed_password := crypt(plain_password, salt);
    end_time := clock_timestamp();
    
    RAISE NOTICE 'Password Hashing Time: %', (end_time - start_time);
    RAISE NOTICE 'Hashed Password Length: %', length(hashed_password);
    
    -- Vérifier que le hachage fonctionne
    IF hashed_password = crypt(plain_password, hashed_password) THEN
        RAISE NOTICE 'Password hashing verification successful';
    ELSE
        RAISE WARNING 'Password hashing verification failed';
    END IF;
END $$;

-- 3. Test de chiffrement symétrique avec pgsodium
DO $$
DECLARE
    message TEXT := 'Données sensibles à chiffrer';
    encryption_key BYTEA;
    encrypted_data BYTEA;
    decrypted_data TEXT;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
BEGIN
    start_time := clock_timestamp();
    
    -- Générer une clé
    encryption_key := pgsodium.generate_key();
    
    -- Chiffrer
    encrypted_data := pgsodium.encrypt(
        message := message::bytea,
        key := encryption_key
    );
    
    -- Déchiffrer
    decrypted_data := convert_from(
        pgsodium.decrypt(
            ciphertext := encrypted_data,
            key := encryption_key
        ),
        'UTF8'
    );
    
    end_time := clock_timestamp();
    
    RAISE NOTICE 'Encryption/Decryption Time: %', (end_time - start_time);
    RAISE NOTICE 'Original Message: %', message;
    RAISE NOTICE 'Decrypted Message: %', decrypted_data;
    
    IF message = decrypted_data THEN
        RAISE NOTICE 'Encryption/Decryption test successful';
    ELSE
        RAISE WARNING 'Encryption/Decryption test failed';
    END IF;
END $$;

-- 4. Test de performance des requêtes
-- Créer une table temporaire pour le test
CREATE TEMPORARY TABLE performance_test (
    id SERIAL PRIMARY KEY,
    random_data TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insérer des données de test
INSERT INTO performance_test (random_data)
SELECT 
    'Test data ' || generate_series
FROM generate_series(1, 10000);

-- Mesurer le temps d'exécution de différents types de requêtes
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    row_count INT;
BEGIN
    -- Test de sélection simple
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO row_count FROM performance_test;
    end_time := clock_timestamp();
    RAISE NOTICE 'Simple Select Time: %, Rows: %', (end_time - start_time), row_count;

    -- Test de sélection avec filtre
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO row_count 
    FROM performance_test 
    WHERE id BETWEEN 1000 AND 2000;
    end_time := clock_timestamp();
    RAISE NOTICE 'Filtered Select Time: %, Rows: %', (end_time - start_time), row_count;

    -- Test de jointure
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO row_count
    FROM performance_test pt
    JOIN performance_test pt2 ON pt.id = pt2.id;
    end_time := clock_timestamp();
    RAISE NOTICE 'Join Time: %, Rows: %', (end_time - start_time), row_count;
END $$;

-- 5. Nettoyer la table de test
DROP TABLE performance_test;

-- 6. Test de sécurité : vérifier les permissions
DO $$
BEGIN
    -- Tenter une opération non autorisée
    BEGIN
        EXECUTE 'CREATE TABLE unauthorized_table (id INT)';
        RAISE WARNING 'Unexpected: Table creation succeeded';
    EXCEPTION 
        WHEN insufficient_privilege THEN
            RAISE NOTICE 'Security Test: Table creation correctly blocked';
    END;
END $$;

-- 7. Vérifier la robustesse des UUID
DO $$
DECLARE
    uuid1 UUID;
    uuid2 UUID;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
BEGIN
    start_time := clock_timestamp();
    uuid1 := uuid_generate_v4();
    uuid2 := uuid_generate_v4();
    end_time := clock_timestamp();
    
    RAISE NOTICE 'UUID Generation Time: %', (end_time - start_time);
    
    IF uuid1 != uuid2 THEN
        RAISE NOTICE 'Unique UUIDs generated successfully';
    ELSE
        RAISE WARNING 'UUID generation may not be sufficiently random';
    END IF;
END $$;