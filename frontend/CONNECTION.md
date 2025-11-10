# 🔌 Frontend-Backend Connection Guide

## ✅ Current Setup

Your frontend and backend are now properly connected!

### Project Structure
```
wellBeingAPP/
├── frontend/           # React app on http://localhost:5173
│   └── src/
│       └── lib/
│           └── api.ts  # API client for backend
└── backend/            # Express API on http://localhost:5000
    └── src/
        └── routes/     # API endpoints
```

## 🚀 Start Both Servers

### Terminal 1 - Backend
```powershell
cd backend
npm run dev
```
✅ Backend running at: **http://localhost:5000**

### Terminal 2 - Frontend
```powershell
cd frontend
npm run dev
```
✅ Frontend running at: **http://localhost:5173**

## 📡 API Client Usage

The API client is located at `frontend/src/lib/api.ts`

### Example: Login Flow

```typescript
import { api, setToken } from '@/lib/api';

// Login
const handleLogin = async () => {
  try {
    const { user, token } = await api.login({
      email: 'student@aui.ma',
      password: 'password123'
    });
    
    // Save token
    setToken(token);
    
    // User is now authenticated
    console.log('Logged in:', user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Example: Protected API Calls

```typescript
import { api } from '@/lib/api';

// Get current user (requires auth)
const user = await api.getMe();

// Submit triage form
const result = await api.createTriage({
  topic: 'Anxiety',
  moodScore: 6,
  urgency: 'medium',
  message: 'Feeling stressed'
});

// Get counselors
const { counselors } = await api.getCounselors();

// Book session
const { booking } = await api.createBooking({
  counselorId: 'counselor_id',
  startAt: '2025-11-08T14:00:00Z',
  endAt: '2025-11-08T15:00:00Z'
});
```

### Example: Real-time Chat

```typescript
import io from 'socket.io-client';
import { WS_URL, getToken } from '@/lib/api';

// Connect to Socket.IO
const socket = io(WS_URL, {
  auth: { token: getToken() }
});

// Join room
socket.emit('joinRoom', { roomId: 'room_123' });

// Send message
socket.emit('sendMessage', {
  roomId: 'room_123',
  content: 'Hello everyone!'
});

// Listen for messages
socket.on('receiveMessage', (message) => {
  console.log('New message:', message);
});
```

## 🔐 Authentication

Tokens are automatically included in all API requests:

```typescript
// Login saves token
const { token } = await api.login(...);
setToken(token); // Saves to localStorage

// All subsequent requests include token
await api.getMyBookings(); // ✅ Authenticated

// Logout removes token
removeToken();
```

## 🧪 Test the Connection

### 1. Test Backend Health

Open browser console (F12) and run:
```javascript
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(console.log);
// Should return: {status: "ok", timestamp: "..."}
```

### 2. Test Login API

```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@aui.ma',
    password: 'password123'
  })
})
  .then(r => r.json())
  .then(console.log);
```

### 3. Use the API Client

```javascript
import { api } from '@/lib/api';

// Login
const result = await api.login({
  email: 'student@aui.ma',
  password: 'password123'
});
console.log('Logged in:', result);
```

## 📦 Available API Methods

All methods available in `frontend/src/lib/api.ts`:

### Auth
- `api.register(data)` - Register new user
- `api.login(data)` - Login user
- `api.getMe()` - Get current user

### Triage
- `api.createTriage(data)` - Submit triage form
- `api.getMyTriages()` - Get triage history

### Bookings
- `api.getCounselors()` - List counselors
- `api.createBooking(data)` - Book session
- `api.getMyBookings()` - Get my bookings
- `api.updateBooking(id, data)` - Update booking

### Peer Rooms
- `api.getRooms()` - List rooms
- `api.getRoom(id)` - Get room details
- `api.sendMessage(roomId, content)` - Send message
- `api.getFlaggedMessages()` - Get flagged (moderator)

### Crisis
- `api.createCrisisAlert(message)` - Create alert
- `api.getCrisisAlerts()` - List alerts (counselor/admin)
- `api.updateCrisisAlert(id, status)` - Update status

### Admin
- `api.getMetrics()` - Get analytics (admin only)

## 🎯 Integration Checklist

- [x] Backend running on port 5000
- [x] Frontend running on port 5173
- [x] API client created (`frontend/src/lib/api.ts`)
- [x] Environment variables configured
- [x] CORS enabled in backend
- [x] JWT authentication working
- [ ] Update components to use real API
- [ ] Implement login page
- [ ] Add error handling
- [ ] Implement Socket.IO chat

## 🔧 Next Steps

### 1. Create Login Page

```typescript
// frontend/src/pages/Login.tsx
import { useState } from 'react';
import { useLogin } from '@/hooks/useLogin';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p>{error}</p>}
    </form>
  );
};
```

### 2. Protect Routes

```typescript
// frontend/src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { getToken } from '@/lib/api';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getToken();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

### 3. Update Dashboard to Fetch Real Data

```typescript
// frontend/src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const { bookings } = await api.getMyBookings();
      setBookings(bookings);
    };
    fetchData();
  }, []);
  
  // Render bookings...
};
```

## 🐛 Troubleshooting

### CORS Error
If you see CORS errors, make sure:
- Backend is running
- `FRONTEND_URL` in backend `.env` matches frontend URL
- Backend CORS is configured (already done)

### 401 Unauthorized
- Token expired or invalid
- Call `removeToken()` and login again

### Connection Refused
- Backend not running
- Check backend is on port 5000
- Check `VITE_API_URL` in frontend `.env`

## 📚 Resources

- Main README: `../README.md`
- Backend API Docs: `../backend/README.md`
- Frontend Docs: `./README.md`

---

**Your frontend and backend are now connected! 🎉**
