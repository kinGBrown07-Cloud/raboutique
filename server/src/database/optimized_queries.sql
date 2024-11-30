-- Index pour optimiser les recherches courantes
CREATE INDEX idx_listings_type_status ON listings(type, status);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_transactions_user ON transactions(user_id, type);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id, status);

-- Vues pour les requêtes fréquentes
CREATE OR REPLACE VIEW active_listings_view AS
SELECT l.*, u.name as seller_name, u.email as seller_email
FROM listings l
JOIN users u ON l.user_id = u.id
WHERE l.status = 'active';

CREATE OR REPLACE VIEW user_subscription_details AS
SELECT u.id, u.name, u.email, s.status as sub_status,
       sp.name as plan_name, sp.max_listings,
       s.start_date, s.end_date
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN subscription_plans sp ON s.plan_id = sp.id;

-- Procédures stockées pour les opérations courantes
DELIMITER //

-- Procédure pour obtenir les statistiques d'un utilisateur
CREATE PROCEDURE get_user_stats(IN user_id INT)
BEGIN
    SELECT 
        COUNT(DISTINCT l.id) as total_listings,
        COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.id END) as active_listings,
        COUNT(DISTINCT t.id) as total_transactions,
        COALESCE(SUM(t.amount), 0) as total_revenue
    FROM users u
    LEFT JOIN listings l ON u.id = l.user_id
    LEFT JOIN transactions t ON u.id = t.user_id
    WHERE u.id = user_id;
END //

-- Procédure pour rechercher des annonces avec filtres
CREATE PROCEDURE search_listings(
    IN search_term VARCHAR(100),
    IN min_price DECIMAL(10,2),
    IN max_price DECIMAL(10,2),
    IN listing_type VARCHAR(50),
    IN sort_by VARCHAR(20),
    IN page_size INT,
    IN page_number INT
)
BEGIN
    SET @offset = (page_number - 1) * page_size;
    SET @search = CONCAT('%', search_term, '%');
    
    SELECT l.*, u.name as seller_name
    FROM listings l
    JOIN users u ON l.user_id = u.id
    WHERE l.status = 'active'
    AND (search_term IS NULL OR (
        l.title LIKE @search OR
        l.description LIKE @search
    ))
    AND (min_price IS NULL OR l.price >= min_price)
    AND (max_price IS NULL OR l.price <= max_price)
    AND (listing_type IS NULL OR l.type = listing_type)
    ORDER BY
        CASE 
            WHEN sort_by = 'price_asc' THEN l.price
            WHEN sort_by = 'price_desc' THEN -l.price
            ELSE l.created_at
        END
    LIMIT page_size
    OFFSET @offset;
END //

-- Procédure pour le tableau de bord administrateur
CREATE PROCEDURE get_admin_dashboard_stats()
BEGIN
    -- Statistiques générales
    SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
        (SELECT COUNT(*) FROM listings WHERE status = 'active') as active_listings,
        (SELECT COUNT(*) FROM transactions WHERE status = 'completed') as completed_transactions,
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'completed') as total_revenue;
    
    -- Tendances des 7 derniers jours
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_listings,
        SUM(price) as total_value
    FROM listings
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date;
    
    -- Top 5 des vendeurs
    SELECT 
        u.name,
        COUNT(l.id) as total_listings,
        COALESCE(SUM(t.amount), 0) as total_sales
    FROM users u
    LEFT JOIN listings l ON u.id = l.user_id
    LEFT JOIN transactions t ON l.id = t.reference_id AND t.type = 'listing_sale'
    WHERE u.role = 'user'
    GROUP BY u.id
    ORDER BY total_sales DESC
    LIMIT 5;
END //

DELIMITER ;

-- Triggers pour la maintenance des données
DELIMITER //

-- Mise à jour automatique du nombre d'utilisations des codes promo
CREATE TRIGGER after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.promotion_id IS NOT NULL THEN
        UPDATE promotions
        SET current_uses = current_uses + 1
        WHERE id = NEW.promotion_id;
    END IF;
END //

-- Vérification de la validité des abonnements
CREATE TRIGGER before_listing_insert
BEFORE INSERT ON listings
FOR EACH ROW
BEGIN
    DECLARE user_max_listings INT;
    DECLARE user_current_listings INT;
    
    -- Obtenir la limite d'annonces de l'utilisateur
    SELECT sp.max_listings INTO user_max_listings
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = NEW.user_id
    AND s.status = 'active'
    LIMIT 1;
    
    -- Compter les annonces actuelles
    SELECT COUNT(*) INTO user_current_listings
    FROM listings
    WHERE user_id = NEW.user_id
    AND status = 'active';
    
    -- Vérifier la limite
    IF user_current_listings >= user_max_listings THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Maximum listing limit reached for this subscription plan';
    END IF;
END //

DELIMITER ;
