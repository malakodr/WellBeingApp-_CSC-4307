# 🏥 AUI Wellbeing Hub - Backend API

Complete backend server for the AUI Wellbeing Hub mental health platform.

## 🛠️ Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Background Jobs**: BullMQ + Redis
- **Validation**: Zod

## 📋 Features

### ✅ Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student, Counselor, Moderator, Admin)
- Protected routes with middleware

### 🧠 Triage System
- Mental health assessment forms
- Risk detection (suicide, self-harm keywords)
- Intelligent routing (CRISIS / BOOK / PEER)
- Mood scoring (1-10)

### 📅 Booking System
- Counselor session booking
- Availability checking (no overlaps)
- Status management (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- Student and counselor views

### 💬 Peer Rooms (Real-time Chat)
- Socket.IO powered chat rooms
- Message persistence
- Automatic content moderation
- Flagged message tracking

### 🚨 Crisis Alerts
- Immediate crisis detection
- Background job processing with BullMQ
- Real-time notifications (console/email ready)
- Alert status tracking

### 📊 Admin Analytics
- User statistics
- Booking metrics
- Triage data
- Crisis alert monitoring
- No PII exposure in metrics

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18+ recommended)
2. **PostgreSQL** (v14+)
3. **Redis** (v6+)

### Installation

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL, JWT_SECRET, REDIS_URL, etc.

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/wellbeing"
JWT_SECRET="your-super-secret-jwt-key-change-this"
REDIS_URL="redis://localhost:6379"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── triage.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── room.controller.ts
│   │   ├── crisis.controller.ts
│   │   └── admin.controller.ts
│   ├── routes/           # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── triage.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── room.routes.ts
│   │   ├── crisis.routes.ts
│   │   └── admin.routes.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # JWT auth & role checking
│   │   └── error.ts      # Error handler
│   ├── lib/              # Utilities
│   │   ├── prisma.ts     # Prisma client
│   │   └── riskDetection.ts
│   ├── sockets/          # Socket.IO handlers
│   │   └── index.ts
│   ├── jobs/             # BullMQ job definitions
│   │   └── crisisAlert.job.ts
│   ├── workers/          # BullMQ workers
│   │   └── crisisAlert.worker.ts
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── package.json
├── tsconfig.json
└── .env
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Triage
- `POST /api/triage` - Submit triage form (protected)
- `GET /api/triage/my` - Get my triage history (protected)

### Bookings
- `POST /api/bookings` - Create booking (protected)
- `GET /api/bookings/my` - Get my bookings (protected)
- `GET /api/bookings/counselors` - List counselors (protected)
- `PATCH /api/bookings/:id` - Update booking (protected)

### Peer Rooms
- `GET /api/rooms` - List active rooms (protected)
- `GET /api/rooms/:id` - Get room details (protected)
- `POST /api/rooms/:id/message` - Send message (protected)
- `GET /api/rooms/moderation/flagged` - Flagged messages (moderator/admin)

### Crisis
- `POST /api/crisis/alert` - Create crisis alert (protected)
- `GET /api/crisis/alerts` - List alerts (counselor/admin)
- `PATCH /api/crisis/alerts/:id` - Update alert status (counselor/admin)

### Admin
- `GET /api/admin/metrics` - Get analytics (admin only)

### Health Check
- `GET /health` - Server health status

## 🔐 Authentication

Include JWT token in requests:

```bash
Authorization: Bearer <your-jwt-token>
```

### JWT Payload Structure

```json
{
  "id": "user_id",
  "role": "student | counselor | moderator | admin",
  "ageBracket": "18-24"
}
```

## 🎭 User Roles

- **student** - Access to triage, bookings, peer rooms
- **counselor** - Manage sessions, view crisis alerts
- **moderator** - Content moderation, flagged messages
- **admin** - Full access, analytics, user management

## 💬 Socket.IO Events

### Client → Server
- `joinRoom` - Join a peer room
  ```json
  { "roomId": "room_id" }
  ```

- `sendMessage` - Send chat message
  ```json
  { "roomId": "room_id", "content": "message text" }
  ```

- `leaveRoom` - Leave a room
  ```json
  { "roomId": "room_id" }
  ```

### Server → Client
- `joinedRoom` - Confirmation of room join
- `receiveMessage` - New message in room
- `userJoined` - User joined the room
- `userLeft` - User left the room
- `messageFlagged` - Message flagged by moderation
- `error` - Error occurred

### Authentication
Include JWT in Socket.IO connection:

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});
```

## 🚨 Risk Detection

The system automatically detects high-risk keywords:
- suicide, kill myself, end my life
- self-harm, hurt myself
- die, death, worthless
- no point, give up

When detected:
1. `riskFlag` set to `true`
2. Route set to `CRISIS`
3. Crisis alert created
4. Background job queued

## 🔄 Background Jobs (BullMQ)

### Crisis Alert Worker

Processes crisis alerts in the background:
- Logs alert details
- Updates alert status to `ACKNOWLEDGED`
- Ready for email/SMS integration

To extend:
1. Add email service (e.g., SendGrid, AWS SES)
2. Add SMS service (e.g., Twilio)
3. Trigger real-time notifications to counselors

## 🗄️ Database Schema

See `prisma/schema.prisma` for full schema.

### Key Models
- **User** - User accounts with roles
- **TriageForm** - Mental health assessments
- **Booking** - Counselor session bookings
- **PeerRoom** - Chat room definitions
- **Message** - Chat messages
- **CrisisAlert** - High-risk alerts

### Run Migrations

```bash
# Create new migration
npm run prisma:migrate

# View database in GUI
npm run prisma:studio
```

## 📜 Scripts

```bash
# Development
npm run dev              # Start with hot reload (tsx)

# Production
npm run build            # Compile TypeScript
npm start                # Run compiled code

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio GUI
```

## 🧪 Testing the API

### Using curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@aui.ma",
    "password": "password123",
    "name": "John Doe",
    "role": "student",
    "ageBracket": "18-24"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@aui.ma",
    "password": "password123"
  }'

# Submit triage (use token from login)
curl -X POST http://localhost:5000/api/triage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "topic": "Anxiety",
    "moodScore": 4,
    "urgency": "high",
    "message": "Feeling overwhelmed with coursework"
  }'
```

## 🔧 Development Tips

1. **Database Reset**
   ```bash
   npm run prisma:migrate -- reset
   ```

2. **View Logs**
   - Prisma queries logged in development mode
   - Crisis alert worker logs to console

3. **Frontend Connection**
   - Update `FRONTEND_URL` in `.env`
   - Frontend should use `http://localhost:5000` as API base

## 🚀 Deployment

### Prerequisites for Production
1. PostgreSQL database (e.g., Railway, Supabase, AWS RDS)
2. Redis instance (e.g., Upstash, Redis Cloud)
3. Node.js hosting (e.g., Railway, Render, Heroku)

### Build and Deploy

```bash
# Build
npm run build

# Set production environment variables
# Run migrations
npx prisma migrate deploy

# Start server
npm start
```

## 🤝 Frontend Integration

Update frontend API client to use:
- Base URL: `http://localhost:5000/api`
- WebSocket URL: `http://localhost:5000`
- Include JWT token in requests
- Connect to Socket.IO with auth token

## 📄 License

Private project for AUI Wellbeing Hub.

---

**Built with ❤️ for mental health support at AUI**
