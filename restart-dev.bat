@echo off
echo ========================================
echo Restarting Expo Dev Server (Clean)
echo ========================================
echo.

echo Stopping any running Expo processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Clearing Expo cache...
npx expo start --clear

pause
