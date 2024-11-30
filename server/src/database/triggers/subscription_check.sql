USE remag_db;

DROP TRIGGER IF EXISTS before_listing_insert;

CREATE TRIGGER before_listing_insert
BEFORE INSERT ON listings
FOR EACH ROW
BEGIN
    DECLARE v_max_listings INT;
    DECLARE v_current_listings INT;
    
    -- Obtenir la limite d'annonces de l'utilisateur
    SELECT sp.max_listings INTO v_max_listings
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = NEW.user_id
    AND s.status = 'active'
    LIMIT 1;
    
    -- Compter les annonces actuelles
    SELECT COUNT(*) INTO v_current_listings
    FROM listings
    WHERE user_id = NEW.user_id
    AND status = 'active';
    
    -- Vérifier la limite
    IF v_current_listings >= v_max_listings THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Maximum listing limit reached for this subscription plan';
    END IF;
END;
