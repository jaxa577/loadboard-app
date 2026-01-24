# Mobile App - Loads Not Displaying Fix

## Issue
Loads were not displaying in the mobile app's AvailableLoadsScreen even though loads existed on the website.

## Root Cause
The mobile app's `loadsService.getAvailableLoads()` was expecting the backend to return a simple array of loads:
```typescript
Load[]
```

However, the backend's `/loads` endpoint actually returns a paginated response:
```typescript
{
  loads: Load[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

## Solution
Updated `src/services/loads.ts` to handle the correct response structure:

```typescript
async getAvailableLoads(): Promise<Load[]> {
  const response = await api.get<{ loads: Load[]; pagination: any }>('/loads', {
    params: {
      page: 1,
      limit: 100,
    },
  });
  // Backend returns { loads, pagination } structure
  return response.data.loads || response.data;
}
```

## Changes Made
1. **File**: `src/services/loads.ts`
   - Changed response type to `{ loads: Load[]; pagination: any }`
   - Extract `response.data.loads` instead of just `response.data`
   - Added fallback to `response.data` for backward compatibility
   - Added pagination params (page=1, limit=100) to fetch more loads

2. **File**: `src/screens/AvailableLoadsScreen.tsx`
   - Added better error logging
   - Added null checks for data
   - Console logs to help debug

## Testing
After this fix, loads should now display correctly in the mobile app's Available Loads screen.
