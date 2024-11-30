USE remag_db;

DROP TRIGGER IF EXISTS after_transaction_insert;

CREATE TRIGGER after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.promotion_id IS NOT NULL THEN
        UPDATE promotions
        SET current_uses = current_uses + 1
        WHERE id = NEW.promotion_id;
    END IF;
END;
