@echo off
echo ========================================
echo CLB Driver - Development Server
echo ========================================
echo.
echo Starting Expo development server...
echo.
echo 1. Install "Expo Go" app on your Android phone
echo    Download: https://play.google.com/store/apps/details?id=host.exp.exponent
echo.
echo 2. Scan the QR code that appears below with Expo Go
echo.
echo 3. The app will load on your phone instantly!
echo.
echo ========================================
echo.

call npm install
call npm start

pause
