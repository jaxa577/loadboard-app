@echo off
echo ========================================
echo STEP 2: Build APK
echo ========================================
echo.

REM Check if logged in
eas whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: You are not logged in to Expo!
    echo Please run "1-login.bat" first.
    echo.
    pause
    exit /b 1
)

echo Logged in to Expo ✓
echo.
echo Installing dependencies...
call npm install
echo.

echo ========================================
echo Starting APK Build
echo ========================================
echo.
echo This will take 10-15 minutes.
echo You'll get a download link when it's done.
echo.
echo Build profile: preview (APK format)
echo Platform: Android
echo.

call eas build --platform android --profile preview

echo.
echo ========================================
echo Build Started!
echo ========================================
echo.
echo The build is running on Expo servers.
echo Wait for the download link to appear above.
echo.
echo When you get the link:
echo 1. Click it or copy to browser
echo 2. Download the APK file
echo 3. Transfer to your phone
echo 4. Install it (enable "Unknown sources" if needed)
echo.
pause
