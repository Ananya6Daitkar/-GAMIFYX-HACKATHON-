# Frontend Troubleshooting Guide

## Issue: Blank White Page

### Step 1: Check Browser Console
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to "Console" tab
3. Look for any red error messages
4. Take a screenshot of any errors

### Step 2: Check Network Tab
1. Go to "Network" tab
2. Reload the page (Cmd+R or Ctrl+R)
3. Look for failed requests (red X)
4. Check if requests to `http://localhost:5001/api/*` are working

### Step 3: Verify Backend is Running
```bash
# Check if backend is responding
curl http://localhost:5001/api/health

# Expected response:
# {"status":"ok","timestamp":"2025-12-17T..."}
```

### Step 4: Verify Frontend is Running
```bash
# Check if frontend is running on port 3000
curl http://localhost:3000

# Should return HTML content
```

### Step 5: Clear Cache and Reload
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Or clear browser cache:
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Preferences → Privacy → Clear Data

### Step 6: Check Local Storage
In browser console, run:
```javascript
console.log('Token:', localStorage.getItem('token'))
console.log('All storage:', localStorage)
```

### Step 7: Test Login Flow
1. Open http://localhost:3000
2. You should see the GamifyX login page
3. Enter credentials:
   - Email: test@example.com
   - Password: test123
4. Click "Login"
5. Check console for any errors

### Step 8: If Still Blank
Try these commands in browser console:
```javascript
// Check if React is loaded
console.log('React version:', React.version)

// Check if App component mounted
console.log('DOM root:', document.getElementById('root'))

// Check API connectivity
fetch('http://localhost:5001/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend OK:', d))
  .catch(e => console.error('Backend error:', e))
```

---

## Common Issues & Solutions

### Issue: "API Error: Unauthorized"
**Cause**: Token not being sent or invalid
**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Reload page
3. Login again

### Issue: "Failed to fetch"
**Cause**: Backend not running or CORS issue
**Solution**:
1. Check backend is running: `npm run dev` in backend folder
2. Check port 5001 is not blocked
3. Check CORS headers in browser console

### Issue: "Cannot read property 'username' of null"
**Cause**: User data not loaded
**Solution**:
1. Check `/users/me` endpoint returns data
2. Verify token is valid
3. Check database connection

### Issue: Page loads but no content
**Cause**: Components not rendering
**Solution**:
1. Check browser console for React errors
2. Check Network tab for failed API calls
3. Try hard refresh (Cmd+Shift+R)

---

## Debug Mode

Add this to browser console to enable debug logging:
```javascript
// Enable debug mode
localStorage.setItem('DEBUG', 'true')
window.location.reload()
```

Then check console for detailed logs.

---

## Quick Restart

If nothing works, try a complete restart:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Then open http://localhost:3000 in browser
```

---

## Expected Behavior

### On First Load (No Token)
- Should show GamifyX login page
- Email/password fields visible
- "Login" and "Register" buttons visible

### After Login
- Should redirect to dashboard
- Should show user avatar, level, XP
- Should show leaderboard, badges, etc.
- Should show sidebar with navigation

### If Errors
- Should show error message in red box
- Should have "Clear & Reload" button
- Should show error details in console

---

## Contact Support

If you're still seeing a blank page:
1. Take a screenshot
2. Open browser console (F12)
3. Copy all console messages
4. Check backend logs: `npm run dev` output
5. Share this information for debugging

