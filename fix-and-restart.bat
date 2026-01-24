@echo off
echo ========================================
echo Fixing Dependencies and Restarting
echo ========================================
echo.

echo Step 1: Removing old node_modules...
if exist node_modules rmdir /s /q node_modules
echo.

echo Step 2: Removing package-lock.json...
if exist package-lock.json del package-lock.json
echo.

echo Step 3: Installing compatible dependencies...
call npm install
echo.

echo Step 4: Clearing Expo cache...
call npx expo start --clear

pause
