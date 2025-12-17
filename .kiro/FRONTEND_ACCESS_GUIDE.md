# GamifyX Frontend - Access Guide

## ✅ System Status

- **Backend**: Running on http://localhost:5001 ✓
- **Frontend**: Running on http://localhost:3000 ✓
- **Database**: PostgreSQL connected ✓
- **Cache**: Redis connected ✓

---

## 🚀 How to Access the Frontend

### Step 1: Open Browser
Open your web browser and navigate to:
```
http://localhost:3000
```

### Step 2: Wait for Page to Load
- The page may take 5-10 seconds to fully load on first visit
- You should see the GamifyX login page with:
  - GamifyX logo
  - Email input field
  - Password input field
  - Login button
  - Register link

### Step 3: Login with Test Credentials
```
Email: test@example.com
Password: test123
```

### Step 4: After Login
You should see the Dashboard with:
- User avatar
- Current level
- Total XP
- Earned badges
- Leaderboard rank
- Navigation sidebar

---

## 🔍 If You See a Blank Page

### Quick Fix
1. **Hard Refresh**: Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Wait**: Give it 10 seconds to load
3. **Check Console**: Press `F12` to open DevTools and check for errors

### Verify Backend is Running
```bash
# In terminal, check if backend is responding
curl http://localhost:5001/api/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

### Verify Frontend is Running
```bash
# In terminal, check if frontend is serving
curl http://localhost:3000 | head -20

# Should return HTML content
```

### Clear Browser Cache
1. **Chrome**: Settings → Privacy → Clear browsing data
2. **Firefox**: Preferences → Privacy → Clear Data
3. **Safari**: Develop → Empty Web Caches

### Check Browser Console
1. Press `F12` to open DevTools
2. Go to "Console" tab
3. Look for any red error messages
4. Look for "GamifyX: React app mounted successfully" message

---

## 📱 Expected Pages After Login

### Dashboard (/)
- Shows user stats (XP, Level, Badges, Streak)
- Shows leaderboard preview
- Shows recent activity

### Leaderboard (/leaderboard)
- Shows top 10 users by XP
- Shows user rank
- Shows XP amount
- Filters by period (daily, weekly, monthly)

### Achievements (/achievements)
- Shows all available badges
- Shows earned badges in color
- Shows unearned badges in grayscale
- Shows badge details on hover

### Submissions (/submissions)
- Shows all code submissions
- Shows submission status (PASS/REVIEW/FAIL)
- Shows score (0-100)
- Shows AI feedback

### Analytics (/analytics)
- Shows activity chart (submissions per day)
- Shows skill chart (languages used)
- Shows progress chart (XP growth)

### Focus Lock (/focus)
- Shows focus session button
- Shows timer during session
- Shows XP multiplier
- Shows session summary after completion

### Teacher Dashboard (/teacher)
- Shows student list
- Shows student progress
- Shows submission history
- Shows intervention indicators

### Feedback (/feedback)
- Shows feedback form
- Shows feedback history
- Shows ticket numbers

### Profile (/profile)
- Shows user profile
- Shows edit form
- Shows badges earned
- Shows statistics

---

## 🔧 Troubleshooting

### Issue: "API Error: Unauthorized"
**Solution**: 
- Clear localStorage: Open console and run `localStorage.clear()`
- Reload page
- Login again

### Issue: "Failed to fetch"
**Solution**:
- Check backend is running: `npm run dev` in backend folder
- Check port 5001 is not blocked
- Try hard refresh

### Issue: "Cannot read property 'username' of null"
**Solution**:
- Check `/users/me` endpoint returns data
- Verify token is valid
- Check database connection

### Issue: Page loads but no content
**Solution**:
- Check browser console for React errors
- Check Network tab for failed API calls
- Try hard refresh

---

## 📊 Test Data

### Test User
- Email: test@example.com
- Password: test123
- Role: Student
- Level: 1
- XP: 0

### Test Credentials for Registration
You can also create a new account:
1. Click "Register" on login page
2. Enter username, email, password
3. Click "Register"
4. You'll be logged in automatically

---

## 🎯 Demo Flow

1. **Login** (30 seconds)
   - Navigate to http://localhost:3000
   - Enter test credentials
   - Click Login

2. **View Dashboard** (30 seconds)
   - See user stats
   - See leaderboard
   - See badges

3. **Navigate Pages** (1 minute)
   - Click sidebar items
   - View different pages
   - See real-time updates

4. **Accept Assignment** (20 seconds)
   - Go to Submissions
   - Click "Accept Quest"
   - Enter GitHub repo URL

5. **View Results** (30 seconds)
   - See submission status
   - See AI feedback
   - See XP earned

---

## 💡 Tips

- **Keyboard Navigation**: Use Tab to navigate, Enter to select
- **Mobile Friendly**: Works on mobile, tablet, and desktop
- **Real-time Updates**: Leaderboard and notifications update in real-time
- **Dark Theme**: Cyberpunk theme with neon glow effects
- **Animations**: Smooth transitions and animations throughout

---

## 🆘 Still Having Issues?

1. Check the troubleshooting guide: `frontend/FRONTEND_TROUBLESHOOTING.md`
2. Check browser console for errors (F12)
3. Check backend logs: `npm run dev` output
4. Verify all services are running:
   - Backend: `npm run dev` in backend folder
   - Frontend: `npm run dev` in frontend folder
   - PostgreSQL: `brew services list`
   - Redis: `brew services list`

---

**Last Updated**: December 17, 2025
**Status**: ✅ READY FOR USE
