@echo off
REM update-site.bat - Schedule this script to run daily

echo Starting news site update process...
cd /d "C:\Users\user\OneDrive\Documentos\news web\news-site"

REM Run the update script
node scripts/auto-update.js

REM Copy updated files to the upload folder
xcopy /E /Y "production-build\*.*" "..\READY-TO-UPLOAD\"

REM Optional: Upload via FTP (requires Windows curl or an FTP client)
REM curl -T "..\READY-TO-UPLOAD\*" ftp://your-ftp-server/public_html/ --user username:password

echo Update process completed at %time% on %date%