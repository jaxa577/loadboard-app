@echo off
echo ========================================
echo Restarting with AsyncStorage Fix
echo ========================================
echo.

echo Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Expo with cleared cache...
call npx expo start --clear

pause
