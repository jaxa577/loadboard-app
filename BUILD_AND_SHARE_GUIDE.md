# How to Build & Share the Mobile App

## Quick Start - Build APK for Testing

### 1. Install EAS CLI (one-time)
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
cd clb-mobile-driver
eas login
```
**Credentials:**
- Username: `jonyesto`
- Password: `sG2.rdt,wVs35R2`

### 3. Configure EAS Build (one-time)
```bash
eas build:configure
```
This creates `eas.json` with build profiles.

### 4. Build APK
```bash
eas build --platform android --profile preview
```

**What happens:**
- ⏱️ Takes 10-15 minutes
- ☁️ Builds on Expo servers (no Android Studio needed!)
- 📦 Gives you download link when done
- ✅ Creates standalone APK that works on any Android

### 5. Download & Share
Once build completes:
1. Click the download link from terminal
2. Download the `.apk` file
3. Share with friends via:
   - WhatsApp: Send as file
   - Telegram: Send as file
   - Google Drive: Upload & share link
   - Email: Attach APK
   - USB: Copy directly to phone

### 6. Install on Phone
**On each Android phone:**
1. Go to Settings → Security
2. Enable "Install from Unknown Sources" or "Install Unknown Apps"
3. Open the APK file (from WhatsApp/Downloads/etc)
4. Tap "Install"
5. Open the app!

---

## Alternative: Expo Go (Quick Testing)

**For immediate testing without building:**

### 1. Install Expo Go
Download on phones:
- **Android:** https://play.google.com/store/apps/details?id=host.exp.exponent
- **iOS:** https://apps.apple.com/app/expo-go/id982107779

### 2. Start Dev Server
```bash
cd clb-mobile-driver
npm start
```

### 3. Connect
**Option A - Same WiFi Network:**
- Scan QR code with Expo Go (Android) or Camera (iOS)
- All devices must be on same WiFi as your PC

**Option B - Over Internet (Tunnel):**
```bash
npm start -- --tunnel
```
- Slower but works from anywhere
- Share the QR code screenshot with friends

---

## Build Profiles (eas.json)

Your `eas.json` should have these profiles:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

- **preview:** Creates APK for testing (use this)
- **production:** Creates AAB for Google Play Store

---

## Troubleshooting

### "Install blocked" on Android
1. Settings → Security
2. Enable "Unknown Sources" or "Install Unknown Apps"
3. Allow installation from the source (Chrome, WhatsApp, etc.)

### Build fails
1. Check your credentials are correct
2. Ensure `app.json` is valid
3. Run `npm install` to ensure dependencies are up to date
4. Check Expo status: https://status.expo.dev/

### Can't scan QR code (Expo Go)
1. Make sure phone and PC are on same WiFi
2. Or use tunnel mode: `npm start -- --tunnel`
3. On iOS, use Camera app (not Expo Go) to scan

### App crashes on startup
1. Check the API URL in `src/services/api.ts`
2. Ensure backend is running on Railway
3. Check app logs in Expo Go

---

## Sharing Best Practices

### For Friends Testing:
1. **Build once, share everywhere**
   - One APK works on all Android phones
   - Don't need to rebuild for each person

2. **Share via cloud storage**
   - Upload to Google Drive
   - Share link with "Anyone with link can download"
   - Friends download and install

3. **Create a test group**
   - WhatsApp/Telegram group
   - Share APK in group
   - Collect feedback there

4. **Version your builds**
   - Rename APK: `clb-driver-v1.0.apk`
   - Keep track of which version friends have
   - Easy to know if they need to update

### For Production:
1. **Google Play Store** (Android)
   ```bash
   eas build --platform android --profile production
   ```
   - Creates AAB file
   - Submit to Google Play Console
   - Takes 1-3 days for review

2. **App Store** (iOS)
   ```bash
   eas build --platform ios --profile production
   ```
   - Requires Apple Developer Account ($99/year)
   - Submit via App Store Connect
   - Takes 1-7 days for review

---

## Build Status & Logs

Check your builds:
```bash
eas build:list
```

View build logs:
```bash
eas build:view [build-id]
```

Cancel a build:
```bash
eas build:cancel
```

---

## Quick Commands Reference

```bash
# Build APK for testing
eas build -p android --profile preview

# Build for both platforms
eas build --platform all --profile preview

# Check build status
eas build:list

# View build details
eas build:view [build-id]

# Run on Expo Go
npm start

# Run with tunnel (works over internet)
npm start -- --tunnel

# Clear cache and restart
npm start -- --clear
```

---

## Cost & Limits

**Free Tier (Expo):**
- ✅ 30 builds/month
- ✅ Unlimited Expo Go development
- ✅ APK downloads
- ✅ Basic support

**Paid Plans:**
- More builds per month
- Priority build queue
- Team collaboration
- Advanced features

---

## Next Steps

1. **Build your first APK:** `eas build -p android --profile preview`
2. **Download when done:** Check terminal for link
3. **Install on your phone:** Test it yourself first
4. **Share with friends:** Send APK file
5. **Collect feedback:** Create group chat for testers
6. **Iterate:** Fix bugs, add features, rebuild

---

## Need Help?

- **Expo Docs:** https://docs.expo.dev/build/setup/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **Common Issues:** https://docs.expo.dev/build-reference/troubleshooting/

## Pro Tips

💡 **Use descriptive build names:**
```bash
eas build -p android --profile preview --message "Added GPS tracking"
```

💡 **Download builds from web:**
Visit https://expo.dev/accounts/jonyesto/projects/clb-mobile-driver/builds

💡 **Keep APKs organized:**
Create a folder like `builds/` to store all APK versions

💡 **Test before sharing:**
Always install and test on your phone first before sending to friends
