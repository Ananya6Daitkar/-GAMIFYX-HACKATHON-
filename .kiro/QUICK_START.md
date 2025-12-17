# GamifyX - Quick Start Guide

## ✅ Prerequisites

Make sure these are running:
1. **Backend**: `npm run dev` in `backend/` folder (port 5001)
2. **Frontend**: `npm run dev` in `frontend/` folder (port 3000)
3. **PostgreSQL**: Running (check with `psql -U postgres -d gamifyx`)
4. **Redis**: Running (check with `redis-cli ping`)

---

## 🚀 Access the Application

### Step 1: Open Browser
```
http://localhost:3000
```

### Step 2: Wait for Login Page
- Should see GamifyX login page
- If blank, wait 10 seconds and hard refresh (Cmd+Shift+R)

### Step 3: Login
```
Email: test@example.com
Password: test123
```

### Step 4: Wait for Dashboard
- After clicking Login, wait 5-10 seconds
- You should see the Dashboard with user stats
- If still loading, check browser console (F12) for errors

---

## 🔍 Troubleshooting

### If Stuck on Loading After Login

**In Browser Console (F12):**
```javascript
// Check if token is saved
console.log('Token:', localStorage.getItem('token'))

// Check if API is responding
fetch('http://localhost:5001/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend OK:', d))
  .catch(e => console.error('Backend error:', e))

// Check if /users/me endpoint works
const token = localStorage.getItem('token')
fetch('http://localhost:5001/api/users/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log('User data:', d))
  .catch(e => console.error('User fetch error:', e))
```

### If Backend Not Responding

**In Terminal:**
```bash
# Check if backend is running
curl http://localhost:5001/api/health

# If not, restart backend
cd backend
npm run dev
```

### If Frontend Not Loading

**In Terminal:**
```bash
# Check if frontend is running
curl http://localhost:3000 | head -20

# If not, restart frontend
cd frontend
npm run dev
```

---

## 📋 Expected Behavior

### Login Page
- GamifyX logo visible
- Email/password fields
- Login button
- Register link

### After Login (Dashboard)
- User avatar
- Level (should be 1)
- Total XP (should be 0)
- Badges (should be empty)
- Leaderboard preview
- Sidebar with navigation

### Navigation
Click sidebar items to navigate:
- Dashboard
- Leaderboard
- Achievements
- Submissions
- Analytics
- Focus Lock
- Teacher Dashboard
- Feedback
- Profile

---

## 🎯 Demo Flow

1. **Login** (30 seconds)
   - Navigate to http://localhost:3000
   - Enter test@example.com / test123
   - Click Login

2. **View Dashboard** (30 seconds)
   - See user stats
   - See leaderboard
   - See navigation

3. **Navigate Pages** (1 minute)
   - Click each sidebar item
   - Verify page loads
   - Check content is different

4. **Check Console** (optional)
   - Open F12
   - Check for any errors
   - Verify API calls are working

---

## 🆘 Still Stuck?

### Option 1: Hard Refresh
```
Cmd+Shift+R (Mac)
Ctrl+Shift+R (Windows)
```

### Option 2: Clear Cache
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
window.location.reload()
```

### Option 3: Restart Everything
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Then open http://localhost:3000
```

### Option 4: Check Logs
```bash
# Backend logs show in terminal where you ran `npm run dev`
# Frontend logs show in browser console (F12)
# Check for any error messages
```

---

## ✅ Success Indicators

- [ ] Login page loads
- [ ] Can enter credentials
- [ ] Dashboard loads after login
- [ ] Can see user stats
- [ ] Can navigate to other pages
- [ ] No red errors in console
- [ ] API calls show in Network tab

---

**Status**: Ready to use
**Last Updated**: December 17, 2025
