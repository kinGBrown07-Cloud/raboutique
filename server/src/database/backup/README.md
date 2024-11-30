# Système de Backup de Base de Données ReMag

Ce dossier contient les scripts de sauvegarde et de restauration de la base de données ReMag.

## Configuration du Backup Automatique

1. Ouvrez le Planificateur de tâches Windows
2. Créez une nouvelle tâche avec les paramètres suivants :
   - Nom : "ReMag DB Backup"
   - Description : "Sauvegarde quotidienne de la base de données ReMag"
   - Déclencheur : Quotidien à 23:00
   - Action : Démarrer un programme
   - Programme : powershell.exe
   - Arguments : -ExecutionPolicy Bypass -File "C:\Users\Brown\Desktop\raboutique\server\src\database\backup\backup-database.ps1"

## Structure des Backups

- Les backups sont stockés dans `C:\backup\remag_db`
- Format du nom : `remag_db_YYYYMMDD_HHMMSS.sql.zip`
- Conservation : 7 jours
- Logs : 
  - Backup : `C:\backup\remag_db\backup.log`
  - Restauration : `C:\backup\remag_db\restore.log`

## Scripts Disponibles

### 1. backup-database.ps1
- Sauvegarde complète de la base de données
- Inclut les procédures stockées et les triggers
- Compression automatique
- Rotation des backups (7 jours)
- Vérification de l'espace disque

### 2. restore-database.ps1
- Restaure la base de données depuis le backup le plus récent
- Vérifie l'intégrité du backup
- Nettoyage automatique des fichiers temporaires

## Utilisation

### Backup Manuel
```powershell
.\backup-database.ps1
```

### Restauration
```powershell
.\restore-database.ps1
```

## Surveillance

- Les logs sont disponibles dans le dossier de backup
- Vérifiez régulièrement l'espace disque disponible
- Testez la restauration périodiquement

## Sécurité

- Les backups sont compressés
- Les identifiants de base de données sont stockés dans les scripts
- Accès restreint au dossier de backup recommandé

## En Cas de Problème

1. Vérifiez les logs
2. Assurez-vous que WAMP est en cours d'exécution
3. Vérifiez les permissions utilisateur
4. Vérifiez l'espace disque disponible
