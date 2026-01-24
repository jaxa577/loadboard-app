  # 📦 Building APK for CLB Driver App

## Quick Options

### Option 1: Use Expo Go (Fastest - No Build) ⚡

**Recommended for testing:**

1. Install **Expo Go** on your Android phone:
   - Download from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the development server:
   ```bash
   cd clb-mobile-driver
   npm install
   npm start
   ```

3. Scan the QR code with Expo Go app

**Done!** The app will run on your phone immediately.

---

### Option 2: Build APK with EAS (Standalone App) 📦

**For a standalone APK file:**

#### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

#### Step 2: Login to Expo
```bash
eas login
```

If you don't have an account:
- Go to https://expo.dev
- Sign up for free
- Use those credentials to login

#### Step 3: Build the APK
```bash
cd clb-mobile-driver

# Build APK (preview profile for testing)
eas build --platform android --profile preview
```

This will:
- Upload your code to Expo servers
- Build the APK in the cloud
- Take about 10-15 minutes
- Give you a download link when done

#### Step 4: Download and Install
- Click the download link from the terminal
- Download the APK to your phone
- Install it (you may need to enable "Install from unknown sources")

---

## Build Profiles

The `eas.json` file defines 3 build profiles:

### 1. **preview** (For Testing)
```bash
eas build --platform android --profile preview
```
- Builds APK file
- Easy to share and install
- Good for testing

### 2. **production** (For Play Store)
```bash
eas build --platform android --profile production
```
- Builds AAB (Android App Bundle)
- Required for Google Play Store
- Optimized and signed

### 3. **development** (With Dev Tools)
```bash
eas build --platform android --profile development
```
- Includes debugging tools
- For development only

---

## App Configuration

The app is configured in `app.json`:

```json
{
  "name": "CLB Driver",
  "version": "1.0.0",
  "android": {
    "package": "com.clb.driver"
  }
}
```

---

## What You Get

After building, you'll have:

**APK File:**
- Size: ~50-80 MB
- Name: `clb-driver-{version}.apk`
- Installable on any Android device
- No Play Store needed

**Features:**
- Full GPS tracking
- Background location updates
- All mobile app features
- Works offline (after initial login)

---

## Troubleshooting

### "eas: command not found"
```bash
npm install -g eas-cli
```

### "Not logged in"
```bash
eas login
# Use your Expo account
```

### "Build failed"
Check the error message. Common issues:
- Missing dependencies: Run `npm install`
- Wrong Node version: Use Node 18+
- Network issues: Try again

### APK won't install
- Enable "Install from unknown sources" in Android settings
- Make sure you downloaded the full APK file

---

## Quick Start Commands

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Navigate to project
cd clb-mobile-driver

# Build APK
eas build --platform android --profile preview

# Wait 10-15 minutes, then download the APK from the link
```

---

## Alternative: Local Build (Advanced)

If you have Android Studio installed:

```bash
cd clb-mobile-driver

# Prebuild native code
npx expo prebuild --platform android

# Build locally
npx expo run:android
```

**Requirements:**
- Android Studio
- Android SDK
- Java JDK
- More complex setup

---

## Recommended Approach

**For quick testing:** Use **Expo Go** (Option 1)
**For sharing with others:** Build **APK** with EAS (Option 2)
**For Play Store:** Use production profile

---

## Need Help?

1. Check Expo documentation: https://docs.expo.dev/build/setup/
2. View build logs in terminal
3. Contact Expo support if issues persist

---

## App Info

- **App Name:** CLB Driver
- **Package:** com.clb.driver
- **Version:** 1.0.0
- **Platform:** Android (iOS can also be built)
- **Min SDK:** Android 5.0+

---

**Ready to build!** Start with `npm start` for instant testing or `eas build` for a standalone APK.
