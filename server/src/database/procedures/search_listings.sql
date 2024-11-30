USE remag_db;

DROP PROCEDURE IF EXISTS search_listings;

CREATE PROCEDURE search_listings(
    IN p_search_term VARCHAR(100),
    IN p_min_price DECIMAL(10,2),
    IN p_max_price DECIMAL(10,2),
    IN p_listing_type VARCHAR(50),
    IN p_sort_by VARCHAR(20),
    IN p_page_size INT,
    IN p_page_number INT
)
BEGIN
    DECLARE v_offset INT;
    SET v_offset = (p_page_number - 1) * p_page_size;
    
    SELECT l.*, u.name as seller_name
    FROM listings l
    JOIN users u ON l.user_id = u.id
    WHERE l.status = 'active'
    AND (p_search_term IS NULL OR (
        l.title LIKE CONCAT('%', p_search_term, '%') OR
        l.description LIKE CONCAT('%', p_search_term, '%')
    ))
    AND (p_min_price IS NULL OR l.price >= p_min_price)
    AND (p_max_price IS NULL OR l.price <= p_max_price)
    AND (p_listing_type IS NULL OR l.type = p_listing_type)
    ORDER BY
        CASE 
            WHEN p_sort_by = 'price_asc' THEN l.price
            WHEN p_sort_by = 'price_desc' THEN -l.price
            ELSE l.created_at
        END
    LIMIT p_page_size
    OFFSET v_offset;
END;
