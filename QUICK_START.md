# 🚀 Quick Start - CLB Driver Mobile App

## Two Ways to Test Your App:

---

## ⚡ Option 1: Instant Testing (Recommended)

**No build needed! Use Expo Go app:**

### Windows:
```bash
# Just double-click:
start-dev.bat
```

### Manual:
```bash
cd clb-mobile-driver
npm install
npm start
```

**Then:**
1. Install **Expo Go** from Play Store on your phone
2. Scan the QR code
3. App loads instantly! ✓

**Benefits:**
- ✅ No waiting (instant)
- ✅ Live reload on code changes
- ✅ Perfect for testing
- ✅ No Expo account needed

---

## 📦 Option 2: Build Standalone APK

**For a real APK file to share:**

### Windows:
```bash
# Just double-click:
build-apk.bat
```

### Manual:
```bash
# 1. Install EAS CLI (one time only)
npm install -g eas-cli

# 2. Login to Expo
eas login
# Sign up at https://expo.dev if you don't have an account

# 3. Build APK
cd clb-mobile-driver
npm install
eas build --platform android --profile preview
```

**Build time:** 10-15 minutes
**Result:** Downloadable APK file

**Benefits:**
- ✅ Standalone app (no Expo Go needed)
- ✅ Share with others easily
- ✅ Install on any Android device
- ✅ Works like a real app

---

## 🎯 Which One to Choose?

| Use Case | Recommended Option |
|----------|-------------------|
| Quick testing yourself | **Expo Go** (Option 1) |
| Share with team/users | **APK Build** (Option 2) |
| Development/debugging | **Expo Go** (Option 1) |
| Demo to stakeholders | **APK Build** (Option 2) |

---

## 📱 App Features

Your mobile app includes:
- ✅ User authentication (login/register)
- ✅ Browse available loads
- ✅ View load details
- ✅ Apply for loads
- ✅ Start/stop GPS journey tracking
- ✅ Background location updates
- ✅ Real-time position sync to server

---

## 🔗 Backend Connection

The app connects to:
```
Production: https://clb-back-production.up.railway.app/api/v1
```

Already configured in `src/services/api.ts`

---

## 🧪 Test Account

**Email:** `driver1@example.com`
**Password:** `password123`
**Role:** DRIVER

Or create your own account in the app!

---

## ⚙️ First Time Setup

1. Make sure backend is running (it's on Railway - already deployed)
2. Choose your testing method (Expo Go or APK)
3. Run the appropriate script
4. Login and start testing!

---

## 📝 Current Configuration

**App Details:**
- Name: CLB Driver
- Package: com.clb.driver
- Version: 1.0.0
- Platform: Android (iOS ready too)

**Permissions:**
- Location (foreground & background)
- Foreground service (for GPS tracking)

---

## 🆘 Troubleshooting

### Expo Go shows error
- Make sure backend is running
- Check your phone is on same network (or use production URL)
- Restart the dev server

### APK build fails
- Run `eas login` first
- Make sure you're logged in to Expo
- Check internet connection
- View full logs in terminal

### APK won't install
- Enable "Install from unknown sources" in Android Settings
- Security > Unknown sources > Enable

---

## 🚀 Start Now!

**Fastest way:**
1. Install Expo Go on your phone
2. Run `start-dev.bat` (or `npm start`)
3. Scan QR code
4. Done! ✓

**For APK:**
1. Run `build-apk.bat` (or `eas build --platform android --profile preview`)
2. Wait 10-15 minutes
3. Download APK from link
4. Install on phone

---

## 📚 More Info

- Full build guide: `BUILD_APK_GUIDE.md`
- Expo docs: https://docs.expo.dev
- EAS Build docs: https://docs.expo.dev/build/setup/

---

**Ready to test? Choose your method and go!** 🎉
