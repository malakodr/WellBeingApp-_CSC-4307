# 🏥 AUI Wellbeing Hub - Full Stack Application

A complete mental health and wellbeing platform with React frontend and Node.js backend.

## 📁 Project Structure

```
wellBeingAPP/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── ...
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (v14+)
- **Redis** (v6+)

### 1️⃣ Setup Backend

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
Copy-Item .env.example .env

# Edit .env and configure:
# - DATABASE_URL (PostgreSQL connection)
# - JWT_SECRET (random secret key)
# - REDIS_URL (Redis connection)

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed

# Start backend server
npm run dev
```

Backend will run on: **http://localhost:5000**

### 2️⃣ Setup Frontend

```powershell
# Open a NEW terminal
# Navigate to frontend
cd frontend

# Install dependencies (if not already done)
npm install

# Environment is already configured in .env
# VITE_API_URL=http://localhost:5000/api
# VITE_WS_URL=http://localhost:5000

# Start frontend dev server
npm run dev
```

Frontend will run on: **http://localhost:5173**

## 🔌 How They Connect

### Backend API
- **Base URL**: `http://localhost:5000/api`
- **WebSocket**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`

### Frontend API Client
Located at: `frontend/src/lib/api.ts`

**Usage Example:**
```typescript
import { api, setToken } from '@/lib/api';

// Login
const { user, token } = await api.login({
  email: 'student@aui.ma',
  password: 'password123'
});
setToken(token);

// Create triage
const result = await api.createTriage({
  topic: 'Anxiety',
  moodScore: 6,
  urgency: 'medium',
  message: 'Feeling stressed about exams'
});
```

## 🎯 Test Accounts (Pre-seeded)

| Role       | Email                | Password     |
|------------|----------------------|--------------|
| Student    | student@aui.ma       | password123  |
| Counselor  | counselor@aui.ma     | password123  |
| Moderator  | moderator@aui.ma     | password123  |
| Admin      | admin@aui.ma         | password123  |

## 📡 Available API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Triage System
- `POST /api/triage` - Submit mental health assessment
- `GET /api/triage/my` - Get my triage history

### Bookings
- `GET /api/bookings/counselors` - List available counselors
- `POST /api/bookings` - Book a counseling session
- `GET /api/bookings/my` - Get my bookings
- `PATCH /api/bookings/:id` - Update booking status

### Peer Rooms (Chat)
- `GET /api/rooms` - List active chat rooms
- `GET /api/rooms/:id` - Get room details with messages
- `POST /api/rooms/:id/message` - Send message

### Crisis Support
- `POST /api/crisis/alert` - Create crisis alert
- `GET /api/crisis/alerts` - List alerts (counselor/admin)

### Admin Analytics
- `GET /api/admin/metrics` - Get platform metrics (admin only)

## 💬 Real-time Chat (Socket.IO)

**Connect to WebSocket:**
```typescript
import io from 'socket.io-client';
import { WS_URL, getToken } from '@/lib/api';

const socket = io(WS_URL, {
  auth: { token: getToken() }
});

// Join a room
socket.emit('joinRoom', { roomId: 'room_id' });

// Send message
socket.emit('sendMessage', { 
  roomId: 'room_id', 
  content: 'Hello!' 
});

// Receive messages
socket.on('receiveMessage', (message) => {
  console.log('New message:', message);
});
```

## 🛠️ Development Workflow

### Running Both Servers

**Option 1: Two Terminals**
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option 2: Using VSCode**
- Open integrated terminal
- Split terminal (Ctrl + Shift + 5)
- Run backend in one, frontend in other

### Making Changes

**Frontend Changes:**
- Hot reload enabled (Vite)
- Changes appear instantly
- No restart needed

**Backend Changes:**
- Auto-restart enabled (tsx watch)
- API changes apply automatically
- Database changes need migration:
  ```powershell
  cd backend
  npm run prisma:migrate
  ```

## 📊 Database Management

```powershell
cd backend

# View database in GUI
npm run prisma:studio
# Opens at http://localhost:5555

# Create new migration
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Re-seed data
npm run prisma:seed
```

## 🔐 Authentication Flow

1. **User logs in** via `api.login()`
2. **Backend returns JWT token**
3. **Frontend saves token** via `setToken()`
4. **Token included in all requests** via Authorization header
5. **Backend validates token** via authMiddleware

## 🎨 Features

### Frontend
✅ Role-based dashboard  
✅ Responsive design  
✅ Dark/Light mode ready  
✅ Real-time chat UI ready  
✅ API client integrated  

### Backend
✅ JWT Authentication  
✅ Role-based access control  
✅ Triage with risk detection  
✅ Booking system with availability  
✅ Real-time Socket.IO chat  
✅ Background crisis alerts (BullMQ)  
✅ Admin analytics  
✅ PostgreSQL + Prisma ORM  

## 🧪 Testing the Connection

### Test Backend Health
```powershell
curl http://localhost:5000/health
```

### Test Login API
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"student@aui.ma","password":"password123"}'
```

### Test from Frontend
1. Open http://localhost:5173
2. Open browser DevTools (F12)
3. Run in console:
```javascript
// Test API connection
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(console.log);
```

## 🚨 Troubleshooting

### Backend won't start
- ✅ PostgreSQL running?
- ✅ Redis running?
- ✅ `.env` file configured?
- ✅ Database migrated? (`npm run prisma:migrate`)

### Frontend can't connect to backend
- ✅ Backend running on port 5000?
- ✅ CORS enabled in backend
- ✅ `.env` file in frontend has correct URLs

### CORS errors
Backend already configured to allow frontend origin:
```typescript
// backend/src/app.ts
cors({
  origin: 'http://localhost:5173',
  credentials: true,
})
```

### Database errors
```powershell
cd backend
npm run prisma:migrate -- reset
npm run prisma:seed
```

## 📚 Documentation

- **Frontend README**: `frontend/README.md`
- **Backend README**: `backend/README.md`
- **Backend Setup**: `backend/SETUP.md`
- **API Docs**: See backend README

## 🎯 Next Steps

1. ✅ **Start both servers**
2. ✅ **Login with test account**
3. ✅ **Integrate API calls in frontend components**
4. ✅ **Implement real-time chat**
5. ✅ **Add error handling**
6. ✅ **Build features!**

## 📝 Common Tasks

### Add New API Endpoint

**Backend:**
```typescript
// 1. Add to controller (backend/src/controllers/)
export const myFunction = async (req, res) => { ... }

// 2. Add route (backend/src/routes/)
router.get('/my-endpoint', authMiddleware, myFunction);
```

**Frontend:**
```typescript
// 3. Add to API client (frontend/src/lib/api.ts)
async myFunction() {
  return this.request('/my-endpoint');
}

// 4. Use in component
const data = await api.myFunction();
```

### Update Database Schema

```powershell
# 1. Edit backend/prisma/schema.prisma
# 2. Create migration
cd backend
npm run prisma:migrate

# 3. Prisma client auto-updates
```

## 🤝 Team Development

```powershell
# Pull latest code
git pull

# Backend setup
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate

# Frontend setup  
cd frontend
npm install

# Start developing!
```

## 📄 License

Private project for AUI Wellbeing Hub.

---

**Built with ❤️ for mental health support at AUI**

## 🆘 Need Help?

- Backend issues: Check `backend/SETUP.md`
- Frontend issues: Check `frontend/README.md`
- API questions: Check `backend/README.md`
