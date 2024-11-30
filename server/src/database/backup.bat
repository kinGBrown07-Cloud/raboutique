@echo off
SET TIMESTAMP=%DATE:~6,4%%DATE:~3,2%%DATE:~0,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
SET BACKUP_PATH=C:\backup\remag_db
SET MYSQL_PATH=C:\wamp\bin\mysql\mysql5.7.36\bin

IF NOT EXIST "%BACKUP_PATH%" mkdir "%BACKUP_PATH%"

:: Backup de la base de données
"%MYSQL_PATH%\mysqldump" -u root remag_db > "%BACKUP_PATH%\remag_db_%TIMESTAMP%.sql"

:: Garder seulement les 7 derniers backups
forfiles /P "%BACKUP_PATH%" /M *.sql /D -7 /C "cmd /c del @path"

:: Compression du backup
powershell Compress-Archive -Path "%BACKUP_PATH%\remag_db_%TIMESTAMP%.sql" -DestinationPath "%BACKUP_PATH%\remag_db_%TIMESTAMP%.zip"
del "%BACKUP_PATH%\remag_db_%TIMESTAMP%.sql"

echo Backup completed: %BACKUP_PATH%\remag_db_%TIMESTAMP%.zip
