# Instructions de configuration de la base de données

## 1. Création de l'utilisateur dédié

1. Ouvrez votre navigateur et accédez à http://localhost/phpmyadmin
2. Connectez-vous avec l'utilisateur root
3. Cliquez sur l'onglet "SQL" en haut
4. Copiez et collez le contenu suivant :

```sql
-- Création d'un utilisateur dédié avec des privilèges restreints
CREATE USER IF NOT EXISTS 'remag_user'@'localhost' IDENTIFIED BY 'ReMag2024Secure!';

-- Attribution des privilèges nécessaires
GRANT SELECT, INSERT, UPDATE, DELETE ON remag_db.* TO 'remag_user'@'localhost';

-- Retirer les privilèges non nécessaires
REVOKE DROP, CREATE, ALTER ON remag_db.* FROM 'remag_user'@'localhost';

-- Appliquer les changements
FLUSH PRIVILEGES;
```

5. Cliquez sur "Exécuter"

## 2. Création des optimisations

1. Dans phpMyAdmin, sélectionnez la base de données "remag_db"
2. Cliquez sur l'onglet "SQL"
3. Copiez et collez le contenu du fichier `optimized_queries.sql`
4. Cliquez sur "Exécuter"

## 3. Configuration du backup automatique

1. Créez le dossier de backup :
   ```batch
   mkdir C:\backup\remag_db
   ```

2. Configurez la tâche planifiée Windows :
   - Ouvrez le "Planificateur de tâches" Windows
   - Cliquez sur "Créer une tâche de base..."
   - Nom : "ReMag DB Backup"
   - Description : "Sauvegarde quotidienne de la base de données ReMag"
   - Déclencheur : Quotidien à 23:00
   - Action : Démarrer un programme
   - Programme : C:\Users\Brown\Desktop\raboutique\server\src\database\backup.bat

## 4. Vérification de la configuration

Pour vérifier que tout est correctement configuré, exécutez ces requêtes dans phpMyAdmin :

```sql
-- Vérifier l'utilisateur
SELECT user, host FROM mysql.user WHERE user = 'remag_user';

-- Vérifier les privilèges
SHOW GRANTS FOR 'remag_user'@'localhost';

-- Vérifier les index
SHOW INDEX FROM listings;
SHOW INDEX FROM transactions;
SHOW INDEX FROM subscriptions;

-- Vérifier les procédures stockées
SHOW PROCEDURE STATUS WHERE Db = 'remag_db';

-- Vérifier les triggers
SHOW TRIGGERS FROM remag_db;
```

## 5. Test de connexion

Après avoir configuré l'utilisateur, testez la connexion avec :

```bash
npx ts-node src/database/test-connection.ts
```

## Notes importantes

1. Sécurité :
   - Le mot de passe de l'utilisateur est défini dans le fichier .env
   - Les backups sont stockés localement dans C:\backup\remag_db
   - Les privilèges sont limités aux opérations nécessaires

2. Maintenance :
   - Les backups sont conservés pendant 7 jours
   - Les index sont créés pour optimiser les requêtes fréquentes
   - Les procédures stockées facilitent les opérations courantes

3. En cas de problème :
   - Vérifiez les logs de WAMP
   - Consultez les erreurs dans phpMyAdmin
   - Vérifiez les permissions des dossiers de backup
