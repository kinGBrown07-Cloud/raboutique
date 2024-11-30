# Configuration
$BackupPath = "C:\backup\remag_db"
$MySQLPath = "C:\wamp64\bin\mysql\mysql8.0.31\bin" # Ajustez selon votre version de WAMP
$DatabaseName = "remag_db"
$MySQLUser = "remag_user"
$MySQLPassword = "ReMag2024Secure!"
$LogPath = "$BackupPath\restore.log"

# Fonction de logging
function Write-Log {
    param($Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$Timestamp - $Message" | Out-File -Append -FilePath $LogPath
    Write-Host "$Timestamp - $Message"
}

try {
    # Obtenir le backup le plus récent
    $LatestBackup = Get-ChildItem -Path $BackupPath -Filter "*.zip" | 
        Sort-Object LastWriteTime -Descending | 
        Select-Object -First 1
    
    if ($null -eq $LatestBackup) {
        throw "Aucun fichier de backup trouvé dans $BackupPath"
    }
    
    Write-Log "Démarrage de la restauration depuis $($LatestBackup.Name)"
    
    # Dossier temporaire pour l'extraction
    $TempDir = "$BackupPath\temp"
    if (Test-Path $TempDir) {
        Remove-Item $TempDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $TempDir | Out-Null
    
    # Extraction du backup
    Expand-Archive -Path $LatestBackup.FullName -DestinationPath $TempDir
    $SqlFile = Get-ChildItem -Path $TempDir -Filter "*.sql" | Select-Object -First 1
    
    if ($null -eq $SqlFile) {
        throw "Fichier SQL non trouvé dans l'archive"
    }
    
    # Restauration de la base de données
    $env:MYSQL_PWD = $MySQLPassword
    & "$MySQLPath\mysql" -u$MySQLUser $DatabaseName < $SqlFile.FullName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Restauration terminée avec succès"
        
        # Nettoyage
        Remove-Item $TempDir -Recurse -Force
    } else {
        throw "Erreur lors de la restauration de la base de données"
    }
} catch {
    Write-Log "ERREUR : $_"
    exit 1
} finally {
    if (Test-Path $TempDir) {
        Remove-Item $TempDir -Recurse -Force
    }
}
