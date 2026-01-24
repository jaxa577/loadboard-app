@echo off
echo ============================================
echo   Building CLB Mobile Driver APK
echo ============================================
echo.
cd /d "%~dp0"
echo [1/3] Logging into Expo...
echo Username: jonyesto
echo Password: sG2.rdt,wVs35R2
echo.
call npx eas login
echo.
echo [2/3] Starting APK build...
call npx eas build --platform android --profile preview
echo.
echo Done! Check download link above.
pause
