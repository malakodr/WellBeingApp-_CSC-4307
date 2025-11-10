# ⚠️ Backend Setup Required

## 🔴 Current Issue

The backend cannot start because it requires:
1. **PostgreSQL** database
2. **Redis** server

Both need to be installed and running before the backend can start.

## 🛠️ Quick Fix Options

### Option 1: Install Prerequisites (Recommended for Full Features)

#### Install PostgreSQL
1. Download: https://www.postgresql.org/download/windows/
2. Run installer (default settings are fine)
3. Remember the password you set for 'postgres' user
4. PostgreSQL will run automatically

#### Install Redis
**For Windows:**
1. Download: https://github.com/microsoftarchive/redis/releases
2. Download `Redis-x64-3.0.504.msi`
3. Install and start the Redis service

**Alternative (Using Docker):**
```powershell
# If you have Docker installed
docker run -d -p 6379:6379 redis
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
```

#### Configure Backend
```powershell
cd backend

# Edit .env file with your PostgreSQL password
# Change this line:
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/wellbeing"
```

#### Initialize Database
```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

---

### Option 2: Run Frontend Only (For Now)

If you just want to see the frontend UI without backend:

```powershell
cd frontend
npm run dev
```

**Note:** The frontend will work but API calls will fail until backend is running.

---

### Option 3: Use Mock Data (Quick Start)

You can modify the frontend to use mock data instead of the real backend.

Update `frontend/src/hooks/useUser.ts`:

```typescript
export const useUser = () => {
  return {
    user: {
      id: '1',
      name: 'Mohamed Tantaoui',
      email: 'student@aui.ma',
      role: 'student' as const,
      ageBracket: '18-24'
    },
    loading: false,
    error: null,
    isAuthenticated: true
  };
};
```

---

## ✅ Verify Setup

### Check PostgreSQL
```powershell
psql -U postgres
# Should prompt for password and connect
```

### Check Redis
```powershell
redis-cli ping
# Should return: PONG
```

### Start Backend
```powershell
cd backend
npm run dev
# Should see: "Server running on port 5000"
```

---

## 🎯 Recommended Next Steps

**For Development:**
1. Install PostgreSQL and Redis (one-time setup)
2. Configure backend `.env`
3. Run database migrations
4. Start both frontend and backend

**For Quick Demo:**
1. Run frontend only: `cd frontend && npm run dev`
2. View UI at http://localhost:5173
3. API features won't work but you can see the design

---

## 📚 Detailed Guides

- Full Backend Setup: `backend/SETUP.md`
- Database Configuration: `backend/README.md`
- Project Overview: `README.md`
