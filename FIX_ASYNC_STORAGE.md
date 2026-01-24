# 🔧 Fix: AsyncStorage Error

## ❌ Error You Saw:

```
Login Failed
[AsyncStorage] Passing null/undefined as value is not supported.
Passed value: undefined
Passed key: token
```

---

## 🔍 Root Cause:

The backend API returns:
```json
{
  "accessToken": "...",  // ← camelCase
  "refreshToken": "...",
  "user": {...}
}
```

But the mobile app was looking for:
```json
{
  "access_token": "..."  // ← snake_case (WRONG!)
}
```

So `access_token` was `undefined`, and AsyncStorage can't save `undefined` values.

---

## ✅ What I Fixed:

### File: `src/services/auth.ts`

**Before:**
```typescript
export interface AuthResponse {
  access_token: string;  // ❌ Wrong field name
  user: User;
}

async login(credentials: LoginCredentials) {
  const { access_token, user } = response.data;
  await AsyncStorage.setItem('token', access_token); // ❌ undefined!
}
```

**After:**
```typescript
export interface AuthResponse {
  accessToken: string;   // ✅ Correct field name
  refreshToken?: string; // ✅ Also save refresh token
  user: User;
}

async login(credentials: LoginCredentials) {
  const { accessToken, refreshToken, user } = response.data;

  // ✅ Validate token exists
  if (!accessToken) {
    throw new Error('No access token received from server');
  }

  // ✅ Save tokens
  await AsyncStorage.setItem('token', accessToken);
  if (refreshToken) {
    await AsyncStorage.setItem('refreshToken', refreshToken);
  }
}
```

---

## 🚀 Test the Fix:

### Quick Restart:
```bash
# Double-click:
restart-fixed.bat
```

### Manual:
```bash
# Stop current server (Ctrl+C)
npx expo start --clear
```

### Then on your phone:
1. Open Expo Go
2. Scan QR code
3. Try logging in:
   - **Email:** `driver1@example.com`
   - **Password:** `password123`
4. Should work now! ✅

---

## 📱 What Changed:

| Before | After |
|--------|-------|
| ❌ Looking for `access_token` | ✅ Looking for `accessToken` |
| ❌ No validation | ✅ Validates token exists |
| ❌ No refresh token | ✅ Saves refresh token too |
| ❌ Error on login | ✅ Login works! |

---

## ✅ Verification:

After restarting, you should see:
- ✅ Login screen loads
- ✅ Enter credentials
- ✅ Login succeeds
- ✅ No AsyncStorage error
- ✅ App navigates to Available Loads screen

---

## 🆘 If Still Not Working:

### Clear app data:
1. In Expo Go, go to Settings
2. Clear cache for your app
3. Restart Expo Go
4. Try again

### Or try the test account:
- **Email:** `driver1@example.com`
- **Password:** `password123`
- **Role:** DRIVER

---

## 📦 Building APK:

After confirming login works:

```bash
# Login to Expo
1-login.bat

# Build APK
2-build-apk.bat
```

The APK will have the same fix applied.

---

## 🎯 Summary:

**Problem:** API field name mismatch (camelCase vs snake_case)
**Fix:** Updated interface to use `accessToken` instead of `access_token`
**Status:** ✅ Fixed
**Action:** Restart dev server and test login

---

**The error is fixed! Restart the server and try logging in again.** 🎉
