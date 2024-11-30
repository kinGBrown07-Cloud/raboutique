USE remag_db;

DROP PROCEDURE IF EXISTS get_user_stats;

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
END;
