# 🎓 Complete Student Features Documentation
## AUI Wellbeing Hub - Student View Implementation

*Last Updated: November 27, 2025*

---

## 📋 Table of Contents
1. [Database Schema](#database-schema)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Real-time Features](#real-time-features)
5. [User Flows](#user-flows)
6. [API Endpoints](#api-endpoints)

---

## 🗄️ Database Schema

### **User Model (Student Role)**
```prisma
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  password       String
  name           String?
  displayName    String?
  role           String   // 'student' role
  ageBracket     String?  // 'UNDER18' or 'ADULT'
  consentMinorOk Boolean  @default(false)
  
  // OAuth fields
  oauthProvider    String?
  oauthProviderId  String?
  profilePicture   String?
  
  // Relations
  triageForms              TriageForm[]
  bookingsAsStudent        Booking[]
  supportRoomsAsStudent    SupportRoom[]
  supportMessages          SupportMessage[]
  activityLogs             ActivityLog[]
}
```

### **TriageForm Model**
```prisma
model TriageForm {
  id        String   @id @default(cuid())
  userId    String
  topic     String   // Issue category
  moodScore Int      // 1-10 scale
  urgency   String   // 'low', 'medium', 'high', 'crisis'
  message   String?
  riskFlag  Boolean  @default(false)
  route     String?  // 'CRISIS', 'BOOK', 'PEER'
  createdAt DateTime @default(now())
}
```

### **SupportRoom Model (Private 1-on-1 Chats)**
```prisma
model SupportRoom {
  id                String   @id @default(cuid())
  studentId         String
  supporterId       String?  // Nullable until claimed
  topic             String   // 'stress', 'anxiety', etc.
  urgency           String   // 'low', 'medium', 'high', 'crisis'
  status            String   @default("WAITING")
  routedTo          String   // 'counselor', 'peer_supporter'
  isPrivate         Boolean  @default(true)
  initialMessage    String?
  lastMessageAt     DateTime?
  lastMessagePreview String?
  
  messages          SupportMessage[]
}
```

### **Booking Model**
```prisma
model Booking {
  id          String   @id @default(cuid())
  studentId   String
  counselorId String
  startAt     DateTime
  endAt       DateTime
  status      String   @default("PENDING")
  notes       String?
}
```

---

## 🔧 Backend Implementation

### **1. Authentication & Authorization**

#### Middleware: `auth.ts`
```typescript
// Role-based access control
roleMiddleware(['student']) // Only students can access

// JWT Token validation
authMiddleware // Validates auth token and injects user data
```

#### Routes Protected:
- ✅ Student must be logged in
- ✅ Consent verification for minors (UNDER18)
- ✅ Session management with JWT

---

### **2. Triage System**

**File:** `backend/src/controllers/triage.controller.ts`

#### **POST /api/triage**
Creates a triage assessment to determine support routing.

**Logic:**
```typescript
1. Student submits: topic, moodScore, urgency, message
2. System analyzes risk factors:
   - Crisis keywords detection
   - Mood score < 3 = high risk
   - Urgency === 'crisis'
3. Routes to:
   - 'CRISIS' → Immediate intervention
   - 'BOOK' → Professional counselor booking
   - 'PEER' → Peer support chat
```

**Response:**
```json
{
  "recommendation": "PEER",
  "urgency": "medium",
  "message": "Recommended to chat with peer support"
}
```

---

### **3. Private Support Rooms (1-on-1 Chat)**

**File:** `backend/src/controllers/support.controller.ts`

#### **POST /api/support/request**
Student requests private support session.

**Features:**
- ✅ One active room per student (prevents duplicates)
- ✅ Auto-routing based on urgency:
  - Crisis → Professional counselor
  - High urgency → Counselor
  - Medium/Low → Peer supporter
- ✅ Initial message saved
- ✅ Queue notification to available supporters

**Request:**
```json
{
  "topic": "anxiety",
  "urgency": "medium",
  "initialMessage": "I've been feeling overwhelmed lately"
}
```

**Response:**
```json
{
  "room": {
    "id": "cm123xyz",
    "topic": "anxiety",
    "status": "WAITING",
    "routedTo": "peer_supporter"
  }
}
```

#### **GET /api/support/my-rooms**
Returns all student's support conversations.

**Response:**
```json
{
  "rooms": [
    {
      "id": "cm123xyz",
      "topic": "anxiety",
      "status": "ACTIVE",
      "supporter": {
        "displayName": "Sarah Smith",
        "role": "counselor"
      },
      "lastMessageAt": "2025-11-27T10:30:00Z",
      "lastMessagePreview": "I understand how you feel..."
    }
  ]
}
```

#### **GET /api/support/rooms/:id**
Get specific room details (only if student is participant).

#### **GET /api/support/rooms/:id/messages**
Fetch all messages in conversation (with pagination).

#### **POST /api/support/rooms/:id/messages**
Send a message in the support room.

**Request:**
```json
{
  "content": "Thank you for the advice",
  "type": "text"
}
```

#### **PATCH /api/support/rooms/:id/messages/read**
Mark messages as read (updates delivery status).

#### **PATCH /api/support/rooms/:id/archive**
Archive conversation from student's view.

---

### **4. Booking System**

**File:** `backend/src/controllers/booking.controller.ts`

#### **POST /api/bookings**
Create counseling appointment.

**Validation:**
- ✅ Available time slots only
- ✅ No overlapping bookings
- ✅ 30-minute minimum duration

**Request:**
```json
{
  "counselorId": "cuid123",
  "startAt": "2025-12-01T14:00:00Z",
  "endAt": "2025-12-01T15:00:00Z",
  "notes": "Need help with exam stress"
}
```

#### **GET /api/bookings/my**
Returns student's bookings (upcoming and past).

#### **PATCH /api/bookings/:id**
Update or cancel booking.

**Request:**
```json
{
  "status": "CANCELLED"
}
```

---

### **5. User Profile Management**

**File:** `backend/src/controllers/user.controller.ts`

#### **GET /api/user/profile**
Get student's profile with statistics.

**Response:**
```json
{
  "user": {
    "id": "cuid123",
    "displayName": "John Doe",
    "email": "john@aui.ma",
    "role": "student",
    "ageBracket": "ADULT"
  },
  "stats": {
    "totalBookings": 5,
    "completedBookings": 3,
    "activeSupportRooms": 1,
    "triageSubmissions": 8
  }
}
```

#### **PATCH /api/user/profile**
Update profile information.

**Request:**
```json
{
  "displayName": "Johnny D",
  "password": "newPassword123" // Optional
}
```

---

## 🎨 Frontend Implementation

### **1. Routing & Layout**

**File:** `frontend/src/App.tsx`

```typescript
// Student Routes (Protected)
<Route path="/student/*" element={<StudentRoute><StudentLayout /></StudentRoute>}>
  <Route path="dashboard" element={<StudentDashboard />} />
  <Route path="chat" element={<StudentChat />} />
  <Route path="chat/start" element={<ChatStart />} />
  <Route path="booking" element={<StudentBooking />} />
  <Route path="progress" element={<StudentProgress />} />
  <Route path="settings" element={<StudentSettings />} />
</Route>

// Support Room (Accessible by students)
<Route path="/support/:roomId" element={<SupportRoom />} />
<Route path="/support/my-rooms" element={<MySupportRooms />} />
```

**Protection:**
- `<StudentRoute>` → Only role='student' can access
- Redirects non-students to appropriate dashboard

---

### **2. Student Dashboard**

**File:** `frontend/src/pages/student/StudentDashboard.tsx`

#### **Features:**

##### **A. Mood Check-in Widget**
- 5-point mood scale (Struggling → Great)
- Visual emoji indicators
- Saves mood to backend via `api.saveMood()`
- Tracks 7-day streak

##### **B. Quick Actions**
1. **Chat Support**
   - Navigate to `/student/chat/start`
   - Starts triage flow
   
2. **Book Session**
   - Navigate to `/student/booking`
   - Schedule counselor appointment
   
3. **My Progress**
   - Navigate to `/student/progress`
   - View wellbeing trends

##### **C. Active Support Sessions**
- Fetches `api.getMySupportRooms()`
- Shows WAITING/ACTIVE rooms
- Click to resume conversation
- Empty state with CTA

##### **D. Upcoming Sessions**
- Fetches `api.getMyBookings()`
- Shows next 3 appointments
- Displays counselor name and time
- Empty state with booking CTA

##### **E. Recent Progress**
- Mood streak achievements
- Session completion milestones
- Gamification elements

---

### **3. Chat Request Flow**

**File:** `frontend/src/pages/ChatStart.tsx`

#### **Triage Form:**
```typescript
1. Student selects topic:
   - Stress
   - Sleep
   - Anxiety
   - Academic
   - Relationship
   - Family
   - Health
   - Other

2. Rates mood (1-10 slider)

3. Selects urgency:
   - Low: "I can wait"
   - Medium: "I'd like to talk soon"
   - High: "I need help today"
   - Crisis: "I need immediate help"

4. Writes initial message (optional)

5. Submits → POST /api/support/request
```

**Response Handling:**
```typescript
if (response.room) {
  // Room created successfully
  navigate(`/support/${response.room.id}`);
} else if (response.roomId) {
  // Existing active room
  navigate(`/support/${response.roomId}`);
}
```

---

### **4. Private Chat Room**

**File:** `frontend/src/pages/SupportRoom.tsx`

#### **Real-time Features:**

##### **A. Socket.IO Integration**
```typescript
// Join room
socket.emit('join:support-room', { roomId });

// Listen for messages
socket.on('message:received', handleNewMessage);

// Listen for supporter joining
socket.on('user:joined', handleUserJoined);

// Typing indicators
socket.on('typing:update', handleTyping);

// Presence updates
socket.on('presence:update', handlePresence);
```

##### **B. Message Display**
- Auto-scroll to latest message
- Sender name and role badges
- Timestamp formatting
- Read receipts (✓✓)
- Edit/delete indicators
- System messages (e.g., "Supporter joined")

##### **C. Message Input**
- Real-time character count
- Enter to send, Shift+Enter for new line
- Emoji support
- Typing indicator broadcast
- Message validation (1-2000 chars)

##### **D. Room Header**
- Topic display with icon
- Urgency badge (color-coded)
- Online status indicator
- Supporter name (when claimed)
- Back button to conversations list

##### **E. Empty States**
- Waiting for supporter
- No messages yet
- Connection error

---

### **5. Conversations List**

**File:** `frontend/src/pages/MySupportRooms.tsx`

#### **Features:**
- All student's support conversations
- Grouped by status:
  - Active (green)
  - Waiting (yellow)
  - Resolved (gray)
- Last message preview
- Unread message count
- Click to open conversation
- Archive option
- Empty state with "Start new chat" CTA

---

### **6. Booking Page**

**File:** `frontend/src/pages/student/StudentBooking.tsx`

#### **Features:**

##### **A. Calendar View**
- React-Calendar integration
- Available dates highlighted
- Blocked dates grayed out
- Current date indicator

##### **B. Time Slot Picker**
- Morning/Afternoon/Evening slots
- 30-minute increments
- Disabled slots shown
- Counselor availability

##### **C. Booking Form**
```typescript
{
  counselorId: string,
  date: Date,
  timeSlot: string,
  notes?: string
}
```

##### **D. My Bookings List**
- Upcoming appointments
- Past appointments
- Status badges:
  - PENDING (yellow)
  - CONFIRMED (green)
  - COMPLETED (blue)
  - CANCELLED (red)
- Cancel button (for PENDING/CONFIRMED)

---

### **7. Progress Tracking**

**File:** `frontend/src/pages/student/StudentProgress.tsx`

#### **Metrics Displayed:**
- Mood trends (chart)
- Sessions attended
- Streak days
- Topics discussed
- Support hours received
- Personal milestones

#### **Visualizations:**
- Line chart (mood over time)
- Bar chart (topic frequency)
- Progress badges
- Achievement unlocks

---

### **8. Settings Page**

**File:** `frontend/src/pages/student/StudentSettings.tsx`

#### **Sections:**

##### **A. Profile Settings**
- Display name
- Email (read-only)
- Profile picture upload
- Password change

##### **B. Notification Preferences**
- Email notifications
- In-app notifications
- Reminder settings

##### **C. Privacy Settings**
- Data visibility
- Archive conversations
- Download data (GDPR)

##### **D. Account Actions**
- Logout
- Delete account (with confirmation)

---

## 🔄 Real-time Features (Socket.IO)

### **Backend Socket Events**

**File:** `backend/src/sockets/index.ts`

#### **Connection:**
```typescript
io.on('connection', (socket) => {
  // User authenticated via JWT
  socket.user = decoded_token;
  
  // Join personal room
  socket.join(`user:${socket.user.sub}`);
});
```

#### **Student Events:**

##### **1. Join Support Room**
```typescript
socket.on('join:support-room', async ({ roomId }) => {
  // Verify access
  const room = await prisma.supportRoom.findUnique({ where: { id: roomId }});
  if (room.studentId === socket.user.sub) {
    socket.join(`support:${roomId}`);
    socket.emit('support_room_joined', { roomId, topic, status });
    socket.to(`support:${roomId}`).emit('user:joined', { userId });
  }
});
```

##### **2. Send Message**
```typescript
socket.on('message:send', async ({ roomId, content }) => {
  // Save to database
  const message = await prisma.supportMessage.create({...});
  
  // Broadcast to room
  io.to(`support:${roomId}`).emit('message:received', {
    id, content, senderId, senderName, timestamp
  });
});
```

##### **3. Typing Indicator**
```typescript
socket.on('typing:start', ({ roomId }) => {
  socket.to(`support:${roomId}`).emit('typing:update', {
    userId: socket.user.sub,
    isTyping: true
  });
});
```

##### **4. Presence Updates**
```typescript
socket.emit('presence:update', {
  userId: otherUserId,
  status: 'online',
  timestamp: new Date()
});
```

---

### **Frontend Socket Integration**

**File:** `frontend/src/context/SocketContext.tsx`

#### **Context Provider:**
```typescript
<SocketProvider>
  {/* All components can access socket */}
</SocketProvider>
```

#### **Usage in Components:**
```typescript
const { socket, isConnected, joinSupportRoom, sendMessage } = useSocket();

// Join room
useEffect(() => {
  if (isConnected && roomId) {
    joinSupportRoom(roomId);
  }
}, [isConnected, roomId]);

// Listen for messages
useEffect(() => {
  if (!socket) return;
  
  socket.on('message:received', (data) => {
    setMessages(prev => [...prev, data]);
  });
  
  return () => {
    socket.off('message:received');
  };
}, [socket]);
```

---

## 🔀 Complete User Flows

### **Flow 1: First-Time Support Request**

```
1. Student Dashboard
   └─> Click "Chat Support"

2. ChatStart Page
   └─> Fill triage form:
       - Select topic (e.g., "Anxiety")
       - Rate mood (e.g., 4/10)
       - Choose urgency (e.g., "Medium")
       - Write initial message
   └─> Submit

3. Backend Processing:
   └─> POST /api/support/request
   └─> Create SupportRoom (status: WAITING)
   └─> Determine routing: peer_supporter
   └─> Notify available supporters via Socket.IO
   └─> Return room ID

4. Redirect to SupportRoom
   └─> /support/{roomId}
   └─> Socket connects to room
   └─> Show "Waiting for supporter..." message

5. Supporter Claims Room:
   └─> Backend updates supporterId
   └─> Socket.IO emits 'support_room_claimed'
   └─> Student sees "Sarah Smith has joined"

6. Conversation Starts:
   └─> Real-time message exchange
   └─> Typing indicators
   └─> Read receipts
   └─> Online status

7. Session Ends:
   └─> Supporter clicks "Resolve"
   └─> Room status → RESOLVED
   └─> Student can still view history
   └─> Option to start new request
```

---

### **Flow 2: Booking Counselor Appointment**

```
1. Student Dashboard
   └─> Click "Book Session"

2. StudentBooking Page
   └─> View calendar
   └─> Select available date
   └─> Choose time slot
   └─> Add notes (optional)
   └─> Submit

3. Backend Processing:
   └─> POST /api/bookings
   └─> Validate availability
   └─> Create Booking (status: PENDING)
   └─> Send confirmation email
   └─> Notify counselor

4. Confirmation:
   └─> Show success message
   └─> Display booking details
   └─> Add to "Upcoming Sessions"

5. Before Appointment:
   └─> Reminder notification (24h, 1h)
   └─> Option to cancel/reschedule

6. After Appointment:
   └─> Status → COMPLETED
   └─> Request feedback (optional)
   └─> Update progress stats
```

---

### **Flow 3: Viewing Progress**

```
1. Student Dashboard
   └─> Click "My Progress"

2. StudentProgress Page
   └─> Fetch historical data:
       - GET /api/user/stats
       - GET /api/triage/my
       - GET /api/bookings/my

3. Display Metrics:
   └─> Mood trend chart (last 30 days)
   └─> Session count (completed vs. total)
   └─> Most discussed topics
   └─> Streak achievements

4. Insights:
   └─> "Your mood improved by 20% this month"
   └─> "You've attended 3 counseling sessions"
   └─> "7-day check-in streak! 🎉"
```

---

## 📡 Complete API Endpoints (Student Access)

### **Authentication**
```http
POST   /api/auth/register        # Create student account
POST   /api/auth/login           # Login
GET    /api/auth/me              # Get current user
POST   /api/auth/consent         # Submit minor consent
POST   /api/auth/logout          # Logout
```

### **Triage**
```http
POST   /api/triage               # Submit triage assessment
GET    /api/triage/my            # Get my triage history
```

### **Support Rooms (Private Chat)**
```http
POST   /api/support/request                # Request support
GET    /api/support/my-rooms               # List my conversations
GET    /api/support/rooms/:id              # Get room details
GET    /api/support/rooms/:id/messages     # Get messages
POST   /api/support/rooms/:id/messages     # Send message
PATCH  /api/support/rooms/:id/messages/read # Mark as read
PATCH  /api/support/rooms/:id/archive      # Archive conversation
DELETE /api/support/messages/:id           # Delete message
PATCH  /api/support/messages/:id           # Edit message
```

### **Bookings**
```http
POST   /api/bookings             # Create booking
GET    /api/bookings/my          # Get my bookings
PATCH  /api/bookings/:id         # Update/cancel booking
DELETE /api/bookings/:id         # Delete booking (admin only)
```

### **User Profile**
```http
GET    /api/user/profile         # Get profile + stats
PATCH  /api/user/profile         # Update profile
POST   /api/user/change-password # Change password
DELETE /api/user/account         # Delete account
```

---

## 🎨 UI Components Used

### **Core Components** (`frontend/src/components/ui/`)
- ✅ Button (primary, secondary, ghost variants)
- ✅ Input (text, password, textarea)
- ✅ Card (bordered, elevated)
- ✅ Badge (status indicators)
- ✅ Alert (info, warning, success, error)
- ✅ Modal (confirmation dialogs)
- ✅ Dropdown (menus, selects)
- ✅ Skeleton (loading states)

### **Chat Components** (`frontend/src/components/chat/`)
- ✅ ChatMessage (message bubble with sender info)
- ✅ ChatInput (message composer with char count)
- ✅ ChatHeader (room info and actions)
- ✅ TypingIndicator (animated dots)
- ✅ OnlineStatus (presence badge)

### **Custom Components**
- ✅ MoodScale (5-point emoji selector)
- ✅ UrgencyBadge (color-coded priority)
- ✅ TopicIcon (visual category indicators)
- ✅ ProgressChart (mood trends visualization)
- ✅ BookingCalendar (date/time picker)

---

## 🔐 Security Features

### **1. Authentication**
- ✅ JWT tokens (httpOnly cookies in production)
- ✅ Password hashing (bcrypt)
- ✅ OAuth integration (Google, Microsoft)
- ✅ Session expiration (7 days)

### **2. Authorization**
- ✅ Role-based access control (RBAC)
- ✅ Route protection (StudentRoute wrapper)
- ✅ API middleware (`authMiddleware`, `roleMiddleware`)
- ✅ Resource ownership verification

### **3. Data Protection**
- ✅ Private room access validation
- ✅ Message sender verification
- ✅ Input sanitization (XSS prevention)
- ✅ SQL injection protection (Prisma ORM)
- ✅ Rate limiting (planned)

### **4. Privacy**
- ✅ Soft delete for messages (not truly deleted)
- ✅ Archive conversations (hide from view)
- ✅ Consent tracking for minors
- ✅ GDPR data export (planned)

---

## 📊 Data Flow Summary

### **Student Requests Support:**
```
Frontend                Backend                 Database          Socket.IO
────────                ───────                 ────────          ─────────
ChatStart
  ↓
Submit Form
  ├─> POST /api/support/request
  │     ↓
  │   Validate data
  │     ↓
  │   Check existing room
  │     ↓
  │   Determine routing ──────> Create SupportRoom
  │     ↓                         ↓
  │   Return room ID          Save to DB
  │     ↓                         ↓
  │   Emit 'new_support_request' ───────────> Notify supporters
  ↓
Navigate to /support/{roomId}
  ↓
socket.emit('join:support-room')
  ├─> Backend validates
  │     ↓
  │   socket.join(room) ───────────────────────> Joined room
  │     ↓
  │   Emit 'support_room_joined'
  ↓
Display waiting state
```

### **Real-time Messaging:**
```
Student A                Backend                Student A/Supporter B
─────────                ───────                ────────────────────────
Type message
  ↓
socket.emit('message:send')
  ├─> Validate access
  │     ↓
  │   Save to database ──────> INSERT SupportMessage
  │     ↓
  │   Broadcast to room ───────────────────> socket.on('message:received')
  ↓                                              ↓
Optimistic UI update                      Display new message
```

---

## ✅ Complete Feature Checklist

### **Authentication & Onboarding**
- ✅ Student registration
- ✅ Email/password login
- ✅ OAuth (Google/Microsoft)
- ✅ Minor consent flow
- ✅ Profile completion

### **Dashboard**
- ✅ Mood check-in widget
- ✅ Quick action cards
- ✅ Active support sessions
- ✅ Upcoming bookings
- ✅ Progress highlights

### **Support Chat**
- ✅ Triage form
- ✅ Auto-routing logic
- ✅ Private 1-on-1 rooms
- ✅ Real-time messaging
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Message edit/delete
- ✅ Online status
- ✅ Conversation history
- ✅ Archive functionality

### **Booking System**
- ✅ Calendar view
- ✅ Time slot selection
- ✅ Counselor profiles
- ✅ Booking creation
- ✅ Cancellation
- ✅ Reminders (email)
- ✅ My bookings list

### **Progress Tracking**
- ✅ Mood trends chart
- ✅ Session statistics
- ✅ Topic analysis
- ✅ Achievement badges
- ✅ Streak tracking

### **Settings**
- ✅ Profile editing
- ✅ Password change
- ✅ Notification preferences
- ✅ Privacy controls
- ✅ Account deletion

### **Real-time Features**
- ✅ Socket.IO integration
- ✅ Live message delivery
- ✅ Presence detection
- ✅ Typing indicators
- ✅ Connection resilience

---

## 🚀 Technology Stack

### **Backend**
- Node.js + Express.js
- TypeScript
- Prisma ORM (SQLite)
- Socket.IO
- JWT authentication
- Bcrypt password hashing
- Zod validation

### **Frontend**
- React 18
- TypeScript
- React Router v6
- Socket.IO Client
- TailwindCSS
- Lucide Icons
- Vite build tool

### **Infrastructure**
- SQLite database
- WebSocket server (Socket.IO)
- Environment-based config
- CORS enabled

---

## 📝 Environment Variables

### **Backend** (`.env`)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
PORT=5000
NODE_ENV="development"

# OAuth (Optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
MICROSOFT_CLIENT_ID="..."
MICROSOFT_CLIENT_SECRET="..."
```

### **Frontend** (`.env`)
```env
VITE_API_URL="http://localhost:5000/api"
VITE_WS_URL="http://localhost:5000"
```

---

## 🧪 Testing Scenarios

### **Scenario 1: New Student First Visit**
1. Register with email
2. Complete consent (if under 18)
3. Redirected to dashboard
4. See empty states (no bookings, no chats)
5. Click "Chat Support"
6. Fill triage form
7. Routed to counselor/peer
8. Wait for supporter to claim
9. Chat in real-time
10. Session resolved

### **Scenario 2: Returning Student**
1. Login
2. Dashboard shows:
   - Previous conversations
   - Upcoming bookings
   - Mood streak
3. Can resume active chats
4. Can book new session
5. Can view progress

### **Scenario 3: Crisis Scenario**
1. Student selects urgency: "Crisis"
2. Immediately routed to professional
3. Crisis alert created
4. Admin dashboard notified
5. High-priority queue position
6. Counselor claims within seconds
7. Intervention provided

---

## 📚 Code Structure

```
wellBeingAPP/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database models
│   │   └── migrations/            # DB version history
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── triage.controller.ts
│   │   │   ├── support.controller.ts  # Student chat logic
│   │   │   ├── booking.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── triage.routes.ts
│   │   │   ├── support.routes.ts
│   │   │   ├── booking.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── sockets/
│   │   │   └── index.ts            # Socket.IO handlers
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT + role check
│   │   │   └── error.ts
│   │   ├── lib/
│   │   │   └── prisma.ts
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── student/
    │   │   │   ├── StudentDashboard.tsx
    │   │   │   ├── StudentChat.tsx
    │   │   │   ├── StudentBooking.tsx
    │   │   │   ├── StudentProgress.tsx
    │   │   │   └── StudentSettings.tsx
    │   │   ├── ChatStart.tsx         # Triage form
    │   │   ├── SupportRoom.tsx       # Private chat UI
    │   │   └── MySupportRooms.tsx    # Conversations list
    │   ├── components/
    │   │   ├── routes/
    │   │   │   └── StudentRoute.tsx  # Route protection
    │   │   ├── chat/
    │   │   │   ├── ChatMessage.tsx
    │   │   │   ├── ChatInput.tsx
    │   │   │   └── ChatHeader.tsx
    │   │   └── ui/                   # Reusable components
    │   ├── context/
    │   │   ├── AuthContext.tsx
    │   │   └── SocketContext.tsx     # Socket.IO provider
    │   ├── hooks/
    │   │   ├── useAuth.ts
    │   │   └── useSocket.ts
    │   ├── lib/
    │   │   └── api.ts                # API client
    │   ├── layouts/
    │   │   └── StudentLayout.tsx     # Sidebar + nav
    │   ├── App.tsx                   # Main router
    │   └── main.tsx
    └── package.json
```

---

## 🎯 Key Differentiators

### **What Makes This Implementation Unique:**

1. **Smart Routing**
   - Automatic counselor vs. peer assignment
   - Urgency-based prioritization
   - Crisis intervention path

2. **Real-time Everything**
   - Instant message delivery
   - Live typing indicators
   - Presence detection
   - No page refreshes needed

3. **Privacy-First**
   - True 1-on-1 private rooms
   - No group exposure
   - Consent tracking for minors
   - Data archival (not deletion)

4. **Student-Centric UX**
   - Mood tracking integration
   - Progress visualization
   - Gamification (streaks, badges)
   - Empty state guidance

5. **Resilient Architecture**
   - Socket reconnection handling
   - Optimistic UI updates
   - API retry logic
   - Error boundary protection

---

## 📞 Support & Maintenance

### **Database Migrations**
```bash
# Create new migration
npm run prisma:migrate

# Reset database (dev only)
npm run prisma:reset

# Generate Prisma client
npm run prisma:generate
```

### **Debugging**
```bash
# Backend logs
npm run dev  # Shows all console.log and errors

# Frontend logs
- Open browser DevTools
- Check Console for socket events
- Network tab for API calls
```

### **Common Issues**

#### **Issue 1: Socket Disconnects**
- **Cause:** Transport close errors
- **Fix:** Improved ping/pong timeouts (already implemented)

#### **Issue 2: Messages Not Appearing**
- **Cause:** Room not joined properly
- **Fix:** Verify `join:support-room` emitted before messaging

#### **Issue 3: Unauthorized Errors**
- **Cause:** Expired JWT token
- **Fix:** Auto-logout on 401, prompt re-login

---

## 🔮 Future Enhancements

### **Planned Features:**
- [ ] Voice/Video call integration
- [ ] File sharing in chat
- [ ] Crisis hotline quick dial
- [ ] AI-powered mood insights
- [ ] Peer matching algorithm
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Multilingual support (Arabic/French)
- [ ] Wellness challenges
- [ ] Anonymous mode option

---

## 📄 License & Credits

**Project:** AUI Wellbeing Hub  
**Version:** 1.0.0  
**Last Updated:** November 27, 2025  
**Documentation By:** GitHub Copilot  

---

*This documentation covers 100% of the implemented student features across database, backend, frontend, and real-time systems.*
