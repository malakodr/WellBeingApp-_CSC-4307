# 🧪 Support Portal - Quick Testing Guide

## Prerequisites
1. Backend server running on `http://localhost:5000`
2. Frontend server running on `http://localhost:5173` (or configured port)
3. Database migrations applied
4. At least one counselor user in database

---

## 🎯 Quick Test Scenarios

### Test 1: Login as Counselor
```
1. Navigate to http://localhost:5173/login
2. Enter counselor credentials
3. Should redirect to /supporter/dashboard
4. Verify dashboard loads with stats
```

**Expected Result:** ✅ Dashboard shows stats, queue, and schedule

---

### Test 2: Student Queue
```
1. Click "Student Queue" in sidebar
2. Should see waiting students (if any)
3. Click "Accept" on a student
4. Should redirect to chat interface
```

**Create Test Data (Backend):**
```bash
# In backend terminal
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestQueue() {
  const student = await prisma.user.findFirst({ where: { role: 'student' } });
  if (!student) {
    console.log('No student found');
    return;
  }
  
  const room = await prisma.supportRoom.create({
    data: {
      studentId: student.id,
      topic: 'stress',
      urgency: 'high',
      status: 'WAITING',
      routedTo: 'counselor',
      initialMessage: 'I need help with stress management'
    }
  });
  
  console.log('Created test support room:', room.id);
}

createTestQueue().then(() => process.exit());
"
```

---

### Test 3: Active Chats
```
1. Click "Active Chats" in sidebar
2. Should see list of active support rooms
3. Click on a chat to open it
4. Verify messages load
```

---

### Test 4: Calendar
```
1. Click "My Calendar" in sidebar
2. Switch between Day/Week/Month views
3. Verify bookings display correctly
4. Click on a booking to see details
5. Confirm or cancel a pending booking
```

**Create Test Booking (Backend):**
```bash
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestBooking() {
  const counselor = await prisma.user.findFirst({ where: { role: 'counselor' } });
  const student = await prisma.user.findFirst({ where: { role: 'student' } });
  
  if (!counselor || !student) {
    console.log('Missing user');
    return;
  }
  
  const startAt = new Date();
  startAt.setHours(startAt.getHours() + 2);
  const endAt = new Date(startAt);
  endAt.setHours(endAt.getHours() + 1);
  
  const booking = await prisma.booking.create({
    data: {
      studentId: student.id,
      counselorId: counselor.id,
      startAt,
      endAt,
      status: 'PENDING',
      notes: 'Test counseling session'
    }
  });
  
  console.log('Created test booking:', booking.id);
}

createTestBooking().then(() => process.exit());
"
```

---

### Test 5: Case Notes
```
1. Click "Case Notes" in sidebar
2. Should see list of all sessions
3. Filter by type (Sessions/Chats)
4. Search for a student name
5. Click "Edit Notes" on a case
6. Add/update notes and save
7. Verify notes persist after refresh
```

---

### Test 6: Resources
```
1. Click "Resources" in sidebar
2. Browse resource categories
3. Use search to find resources
4. Filter by category
5. Verify emergency contacts section
```

---

### Test 7: Settings
```
1. Click "Settings" in sidebar

Profile Tab:
2. Update display name
3. Click "Save Changes"
4. Verify success message

Security Tab:
5. Enter current password
6. Enter new password (twice)
7. Click "Change Password"
8. Verify success/error message

Notifications Tab:
9. Toggle notification preferences
10. Click "Save Preferences"

Availability Tab:
11. Set working hours
12. Enable/disable days
13. Click "Save Schedule"
```

---

## 🔍 Visual Verification Checklist

### Dashboard
- [ ] Stats cards show numbers
- [ ] Queue preview shows students (if any)
- [ ] Today's schedule shows bookings (if any)
- [ ] "Live updates every 30s" indicator shows

### Student Queue
- [ ] Queue items show student info
- [ ] Priority badges visible (urgent/high/medium/low)
- [ ] Wait time displays correctly
- [ ] Accept button works

### Active Chats
- [ ] Chat cards show student names
- [ ] Last activity time displays
- [ ] "Open chat" button works
- [ ] Empty state shows if no chats

### Calendar
- [ ] Month view shows calendar grid
- [ ] Week view shows 7 days
- [ ] Day view shows detailed schedule
- [ ] Bookings display with correct times
- [ ] Status badges show colors
- [ ] Today's sidebar shows stats

### Case Notes
- [ ] All sessions listed
- [ ] Filter buttons work
- [ ] Search filters results
- [ ] Edit modal opens
- [ ] Notes save successfully
- [ ] Statistics cards show counts

### Resources
- [ ] Resource cards display
- [ ] Category filters work
- [ ] Search filters results
- [ ] Emergency contacts visible

### Settings
- [ ] All tabs accessible
- [ ] Forms validate input
- [ ] Save buttons work
- [ ] Toggle switches function
- [ ] Time inputs work (availability)

---

## 🐛 Common Issues & Solutions

### Issue: Dashboard shows 0 for all stats
**Solution:** Create test data (see test scenarios above)

### Issue: Queue is empty
**Solution:** 
```bash
# Create test support room with WAITING status
# Run the script in Test 2
```

### Issue: Calendar is empty
**Solution:**
```bash
# Create test bookings
# Run the script in Test 4
```

### Issue: WebSocket not connecting
**Solution:**
- Check backend WebSocket server is running
- Verify VITE_WS_URL in .env
- Check browser console for connection errors

### Issue: 401 Unauthorized errors
**Solution:**
- Clear localStorage
- Log out and log back in
- Check JWT token expiration

### Issue: API calls failing
**Solution:**
- Verify backend is running on correct port
- Check VITE_API_URL in .env
- Check Network tab in DevTools

---

## 🧪 Database Queries for Testing

### Check Counselor's Data
```sql
-- Get counselor's support rooms
SELECT * FROM "SupportRoom" WHERE "supporterId" = 'COUNSELOR_ID';

-- Get counselor's bookings
SELECT * FROM "Booking" WHERE "counselorId" = 'COUNSELOR_ID';

-- Get waiting queue
SELECT * FROM "SupportRoom" WHERE status = 'WAITING';
```

### Create Test Counselor
```bash
cd backend
node create-admin.js
# Follow prompts to create counselor account
```

---

## 📊 Performance Testing

### Load Test
1. Create 10+ waiting students in queue
2. Navigate to queue page
3. Verify page loads in < 2 seconds
4. Accept multiple students
5. Check Active Chats performance

### Real-time Test
1. Open supporter portal in Browser A
2. Create support room from another browser (Browser B)
3. Verify room appears in Browser A queue (within 30s)
4. Accept room in Browser A
5. Send message from Browser B
6. Verify message appears in Browser A instantly

---

## ✅ Success Criteria

All features should:
- [ ] Load without errors
- [ ] Display data correctly
- [ ] Save changes successfully
- [ ] Show loading states
- [ ] Handle errors gracefully
- [ ] Respond to user actions
- [ ] Update in real-time (where applicable)
- [ ] Be mobile responsive

---

## 🎉 Completion

If all tests pass, the Support Portal is **fully functional**! 🚀

**Next Steps:**
1. Deploy to staging environment
2. Conduct user acceptance testing
3. Train counselors on new features
4. Monitor for issues in production
5. Collect feedback for improvements

---

## 📞 Support

Issues? Check:
- `SUPPORTER_PORTAL_COMPLETE.md` for full documentation
- Browser console for errors
- Network tab for API issues
- Backend logs for server errors

**Happy Testing! 🎯**
