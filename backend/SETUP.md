# 🚀 Backend Setup Guide

Step-by-step guide to set up the AUI Wellbeing Hub backend.

## 📋 Prerequisites

Before starting, ensure you have:

1. ✅ **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. ✅ **PostgreSQL** (v14 or higher)
   - **Windows**: Download from https://www.postgresql.org/download/windows/
   - **Mac**: `brew install postgresql@14`
   - **Linux**: `sudo apt install postgresql`
   - Verify: `psql --version`

3. ✅ **Redis** (v6 or higher)
   - **Windows**: Download from https://github.com/microsoftarchive/redis/releases
   - **Mac**: `brew install redis`
   - **Linux**: `sudo apt install redis-server`
   - Verify: `redis-cli --version`

## 🔧 Step 1: Install Dependencies

```bash
cd backend
npm install
```

## 🗄️ Step 2: Set Up PostgreSQL Database

### Create Database

```bash
# Login to PostgreSQL (default user: postgres)
psql -U postgres

# Create database
CREATE DATABASE wellbeing;

# Create user (optional)
CREATE USER wellbeing_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE wellbeing TO wellbeing_user;

# Exit
\q
```

### Alternative: Using GUI Tools
- **pgAdmin**: https://www.pgadmin.org/
- **DBeaver**: https://dbeaver.io/
- **TablePlus**: https://tableplus.com/

## 🔴 Step 3: Start Redis Server

### Windows
```powershell
# Start Redis server
redis-server
```

### Mac/Linux
```bash
# Start Redis
redis-server

# Or run as background service
brew services start redis    # Mac
sudo systemctl start redis   # Linux
```

Verify Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

## ⚙️ Step 4: Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env file
```

Update `.env` with your values:

```env
# Database connection
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/wellbeing"

# JWT secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"

# Redis connection
REDIS_URL="redis://localhost:6379"

# Server configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Generate JWT Secret

Use one of these methods:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Online
# Visit: https://randomkeygen.com/
```

## 🗃️ Step 5: Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

## ▶️ Step 6: Start Development Server

```bash
npm run dev
```

You should see:
```
===========================================
🏥 AUI Wellbeing Hub Backend
===========================================
🚀 Server running on port 5000
📡 Socket.IO initialized
⚡ Environment: development
🔄 Crisis alert worker running
===========================================
```

## ✅ Step 7: Test the API

### Health Check

```bash
# Using curl
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-07T..."}
```

### Login with Test Account

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@aui.ma",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "user": {
    "id": "...",
    "email": "student@aui.ma",
    "name": "Mohamed Tantaoui",
    "role": "student",
    "ageBracket": "18-24"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🎯 Test Accounts (from seed data)

| Role       | Email                | Password     |
|------------|----------------------|--------------|
| Student    | student@aui.ma       | password123  |
| Counselor  | counselor@aui.ma     | password123  |
| Moderator  | moderator@aui.ma     | password123  |
| Admin      | admin@aui.ma         | password123  |

## 🛠️ Useful Commands

```bash
# Development
npm run dev                  # Start with hot reload

# Database
npm run prisma:studio        # Open database GUI
npm run prisma:migrate       # Create new migration
npm run prisma:seed          # Re-seed database

# Production
npm run build                # Compile TypeScript
npm start                    # Run production server
```

## 🔍 Troubleshooting

### Issue: Cannot connect to PostgreSQL

**Solution:**
1. Check if PostgreSQL is running
2. Verify connection string in `.env`
3. Check PostgreSQL logs

```bash
# Windows
# Check services: services.msc

# Mac
brew services list

# Linux
sudo systemctl status postgresql
```

### Issue: Cannot connect to Redis

**Solution:**
1. Start Redis server: `redis-server`
2. Verify: `redis-cli ping`
3. Check `REDIS_URL` in `.env`

### Issue: Prisma migration errors

**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npm run prisma:migrate -- reset

# Or manually drop and recreate
psql -U postgres
DROP DATABASE wellbeing;
CREATE DATABASE wellbeing;
\q

# Then run migrations again
npm run prisma:migrate
```

### Issue: Port 5000 already in use

**Solution:**
1. Change `PORT` in `.env` to another port (e.g., 5001)
2. Or kill process using port 5000:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Issue: TypeScript errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npm run prisma:generate
```

## 🌐 Connect Frontend to Backend

In your frontend project:

1. Update API base URL to: `http://localhost:5000/api`
2. Update WebSocket URL to: `http://localhost:5000`
3. Include JWT token in requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

## 📊 Monitor Background Jobs

Crisis alert jobs are processed automatically. Check console for:

```
🚨 CRISIS ALERT DETECTED 🚨
===========================================
Alert ID: ...
User: ...
Message: ...
===========================================
```

## 📱 View Database

```bash
# Open Prisma Studio (web-based database viewer)
npm run prisma:studio
```

Access at: http://localhost:5555

## 🎉 Next Steps

1. ✅ Backend is running on `http://localhost:5000`
2. ✅ Database is set up and seeded
3. ✅ Redis worker is processing jobs
4. ✅ Socket.IO is ready for real-time chat

Now you can:
- Test API endpoints with Postman/Insomnia
- Connect your frontend application
- Start building features!

## 📚 Additional Resources

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Socket.IO Docs](https://socket.io/docs/v4/)
- [BullMQ Guide](https://docs.bullmq.io/)

---

Need help? Check the main [README.md](./README.md) for API documentation.
