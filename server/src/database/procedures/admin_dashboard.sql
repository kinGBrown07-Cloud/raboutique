USE remag_db;

DROP PROCEDURE IF EXISTS get_admin_dashboard_stats;

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
    GROUP BY u.id, u.name
    ORDER BY total_sales DESC
    LIMIT 5;
END;
