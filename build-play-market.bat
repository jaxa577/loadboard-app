@echo off
echo ============================================
echo   Building CLB Mobile Driver AAB for Play Market
echo ============================================
echo.
cd /d "%~dp0"
echo [1/3] Logging into Expo...
echo Username: jonyesto
echo Password: sG2.rdt,wVs35R2
echo.
call npx eas login
echo.
echo [2/3] Starting AAB (App Bundle) build for Play Market...
call npx eas build --platform android --profile production
echo.
echo Done! Please download the generated .aab file from your Expo dashboard to upload to Google Play Console.
pause
