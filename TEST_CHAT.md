# Real-Time Chat Testing Guide

## ✅ Fixes Applied

1. **Backend Routes**: Fixed route conflict - removed old `roomRoutes`, now using `peerRoomRoutes`
2. **Frontend Socket URL**: Changed from `VITE_API_URL` to `VITE_WS_URL` (http://localhost:5000)
3. **Initial Messages**: Added REST API call to load last 50 messages on room join
4. **Message Format**: Backend now returns messages with `author` field for frontend compatibility
5. **API Types**: Fixed TypeScript types to match backend response format

## 🚀 How to Test

### 1. Start Backend (Terminal 1)
```powershell
cd C:\Users\buzok\Desktop\wellBeingAPP\backend
npm run dev
```

Wait for:
```
🚀 Server running on port 5000
📡 Socket.IO initialized
```

### 2. Start Frontend (Terminal 2)
```powershell
cd C:\Users\buzok\Desktop\wellBeingAPP\frontend
npm run dev
```

Wait for:
```
VITE ready
Local: http://localhost:5173/
```

### 3. Test the Chat

1. Open browser: http://localhost:5173
2. Login with your account
3. Navigate to "Peer Rooms" or "Rooms"
4. Click on any room (e.g., "Anxiety")
5. You should see:
   - Room title and topic
   - Any existing messages load immediately
   - Message input at the bottom

6. Send a test message:
   - Type a message in the input field
   - Press Enter or click Send button
   - Message should appear instantly

7. **Test Real-Time** (Open 2 browser tabs):
   - Tab 1: Login as User A
   - Tab 2: Login as User B (or use incognito)
   - Both join the same room
   - Send message from Tab 1 → should appear in Tab 2 instantly
   - Send message from Tab 2 → should appear in Tab 1 instantly

## 🔍 Debugging

### Check Browser Console
Open DevTools (F12) → Console tab

Expected logs:
```
Socket connected
Joined room: { roomSlug: '...', roomTitle: '...' }
Received message: { id: '...', body: '...', author: {...} }
```

### Check Backend Logs
Look for:
```
User connected: <userId>
User <userId> joined room <slug>
```

### If Messages Don't Appear

1. **Check Network Tab** (F12 → Network):
   - Look for WebSocket connection (WS)
   - Should show "101 Switching Protocols"
   - Check for `/socket.io/?EIO=4&transport=websocket`

2. **Verify Auth Token**:
   - Console: `localStorage.getItem('auth_token')`
   - Should return a JWT token

3. **Check API Response**:
   - Network tab → Look for `/api/rooms/<slug>/messages`
   - Should return: `{ messages: [...], nextCursor: null, hasMore: false }`

4. **Check Socket Events**:
   - Look for "error" events in console
   - Backend should log "User connected" and "joined room"

## 🛠️ Common Issues

### Port Already in Use
```powershell
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
```

### "Failed to load room"
- Check if backend is running
- Verify URL: http://localhost:5000/api/rooms
- Should return list of rooms

### Messages Load but Don't Send
- Check browser console for errors
- Verify Socket.IO connection (green dot in Network → WS)
- Check backend logs for "sendMessage" event

### Blank Page on Room Click
- Open browser console (F12)
- Check for JavaScript errors
- Verify the room exists: http://localhost:5000/api/rooms
- Check if user has access (age restrictions)

## 📝 Expected Behavior

✅ User joins room → Socket connects → Joins Socket.IO room  
✅ Initial messages load via REST API (last 50)  
✅ User sends message → Saved to DB → Broadcasted via Socket.IO  
✅ All users in room see message in real-time  
✅ On refresh → Messages reload from database  
✅ No duplicates, no silent failures  

## 🎯 Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can navigate to rooms list
- [ ] Can click on a room (not blank page)
- [ ] Existing messages load
- [ ] Can type a message
- [ ] Press Enter sends message
- [ ] Message appears immediately
- [ ] Message persists on page refresh
- [ ] Real-time works (2 tabs see each other's messages)
- [ ] No console errors
- [ ] No network errors

---

**Note**: Make sure both servers are running before testing!
