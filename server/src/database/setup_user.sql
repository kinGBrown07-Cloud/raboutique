-- Création d'un utilisateur dédié avec des privilèges restreints
CREATE USER IF NOT EXISTS 'remag_user'@'localhost' IDENTIFIED BY 'ReMag2024Secure!';

-- Attribution des privilèges nécessaires
GRANT SELECT, INSERT, UPDATE, DELETE ON remag_db.* TO 'remag_user'@'localhost';

-- Retirer les privilèges non nécessaires
REVOKE DROP, CREATE, ALTER ON remag_db.* FROM 'remag_user'@'localhost';

-- Appliquer les changements
FLUSH PRIVILEGES;
