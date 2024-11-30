USE remag_db;

-- Ajout de la colonne promotion_id à la table transactions
ALTER TABLE transactions
ADD COLUMN promotion_id INT,
ADD CONSTRAINT fk_transactions_promotions
    FOREIGN KEY (promotion_id)
    REFERENCES promotions(id)
    ON DELETE SET NULL;
