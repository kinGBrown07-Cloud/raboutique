# Configuration
$BackupPath = "C:\backup\remag_db"
$MySQLPath = "C:\wamp64\bin\mysql\mysql8.0.31\bin" # Ajustez selon votre version de WAMP
$DatabaseName = "remag_db"
$MySQLUser = "remag_user"
$MySQLPassword = "ReMag2024Secure!"
$RetentionDays = 7
$LogPath = "$BackupPath\backup.log"

# Création du dossier de backup s'il n'existe pas
if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath | Out-Null
}

# Fonction de logging
function Write-Log {
    param($Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$Timestamp - $Message" | Out-File -Append -FilePath $LogPath
    Write-Host "$Timestamp - $Message"
}

try {
    $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $BackupFile = "$BackupPath\${DatabaseName}_$Timestamp.sql"
    
    Write-Log "Démarrage du backup de la base de données $DatabaseName"
    
    # Backup de la base de données
    $env:MYSQL_PWD = $MySQLPassword
    & "$MySQLPath\mysqldump" -u$MySQLUser --databases $DatabaseName --routines --triggers > $BackupFile
    
    if ($LASTEXITCODE -eq 0) {
        # Compression du fichier
        $ZipFile = "$BackupFile.zip"
        Compress-Archive -Path $BackupFile -DestinationPath $ZipFile -Force
        Remove-Item $BackupFile
        
        Write-Log "Backup créé avec succès : $ZipFile"
        
        # Nettoyage des anciens backups
        $OldBackups = Get-ChildItem -Path $BackupPath -Filter "*.zip" | 
            Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) }
        
        foreach ($OldBackup in $OldBackups) {
            Remove-Item $OldBackup.FullName -Force
            Write-Log "Ancien backup supprimé : $($OldBackup.Name)"
        }
        
        # Vérification de l'espace disque
        $Drive = Get-PSDrive -Name ($BackupPath.Substring(0,1))
        $FreeSpaceGB = [math]::Round($Drive.Free / 1GB, 2)
        
        if ($FreeSpaceGB -lt 5) {
            Write-Log "ATTENTION : Espace disque faible. Seulement $FreeSpaceGB GB disponible."
        }
        
        Write-Log "Processus de backup terminé avec succès"
    } else {
        throw "Erreur lors du backup de la base de données"
    }
} catch {
    Write-Log "ERREUR : $_"
    exit 1
}
