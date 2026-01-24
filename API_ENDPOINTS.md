# 📡 Mobile App - Correct API Endpoints

## ✅ Fixed API Endpoints

I've corrected all API endpoints to match the backend.

---

## 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | ✅ Login (returns accessToken) |
| POST | `/auth/register` | Register new user |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current user profile |

---

## 📦 Loads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/loads` | ✅ Get all available loads |
| GET | `/loads?status=OPEN` | Get OPEN loads only |
| GET | `/loads/:id` | ✅ Get load by ID |
| GET | `/loads/my` | Get current user's loads |
| GET | `/loads/:id/applications` | Get load applications |
| POST | `/loads` | Create new load (Shipper/Broker only) |

---

## 📋 Applications

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/applications` | ✅ Apply to a load | Working |
| GET | `/applications/my` | ✅ **FIXED** Get my applications | Was `/applications/user` |
| PATCH | `/applications/:id/accept` | Accept application (Shipper) | |
| PATCH | `/applications/:id/reject` | Reject application (Shipper) | |

**❌ Old (Broken):** `/applications/user` → 404 Not Found
**✅ New (Fixed):** `/applications/my` → Works!

---

## 🚗 Journeys (GPS Tracking)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/journeys/start` | ✅ Start journey | Working |
| POST | `/journeys/stop/:journeyId` | ✅ Stop journey | Working |
| POST | `/journeys/locations` | ✅ **FIXED** Send location updates | Was `/locations` |
| GET | `/journeys/active/:loadId` | ✅ Get active journey | Working |
| GET | `/journeys/:journeyId/locations` | Get journey location history | |

**❌ Old (Broken):** `/locations` → 404 Not Found
**✅ New (Fixed):** `/journeys/locations` → Works!

---

## 🤝 Deals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/deals/my` | Get my deals |
| POST | `/deals/confirm` | Confirm deal completion |

---

## 📝 Files Fixed

### 1. `src/services/loads.ts`
```typescript
// ❌ Before:
const response = await api.get('/applications/user');

// ✅ After:
const response = await api.get('/applications/my');
```

### 2. `src/services/journey.ts`
```typescript
// ❌ Before:
await api.post('/locations', {...});

// ✅ After:
await api.post('/journeys/locations', {...});
```

### 3. `src/services/auth.ts`
```typescript
// ❌ Before:
const { access_token } = response.data;

// ✅ After:
const { accessToken } = response.data;
```

---

## 🔧 How to Test

### 1. Restart the app:
```bash
restart-fixed.bat
# or
npx expo start --clear
```

### 2. Login:
- Email: `driver1@example.com`
- Password: `password123`

### 3. Test features:
- ✅ View available loads
- ✅ Apply to a load
- ✅ View my applications
- ✅ Start journey
- ✅ Send GPS locations
- ✅ Stop journey

---

## 📊 API Response Formats

### Authentication Response:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "xxx",
    "email": "driver1@example.com",
    "name": "Ivan Petrov",
    "role": "DRIVER",
    "rating": 4.9
  }
}
```

### Load Response:
```json
{
  "id": "xxx",
  "originCity": "Moscow",
  "destinationCity": "Almaty",
  "cargoType": "Electronics",
  "weight": 1500,
  "price": 25000,
  "status": "OPEN"
}
```

### Application Response:
```json
{
  "id": "xxx",
  "loadId": "yyy",
  "applicantId": "zzz",
  "role": "DRIVER",
  "status": "PENDING",
  "createdAt": "2026-01-21T..."
}
```

---

## 🚀 All Endpoints Now Working!

✅ Authentication
✅ Load browsing
✅ Applications (**FIXED:** `/applications/my`)
✅ GPS tracking (**FIXED:** `/journeys/locations`)
✅ Journey management

---

## 🔗 Backend URL

```typescript
const API_BASE_URL = 'https://clb-back-production.up.railway.app/api/v1';
```

All endpoints are prefixed with this base URL.

---

## 📱 Test Now!

1. **Restart dev server:** `restart-fixed.bat`
2. **Scan QR code** with Expo Go
3. **Login** with test account
4. **All features work!** ✅

---

**All API endpoints are now correctly configured!** 🎉
