@echo off
REM Chat System Migration Script for Windows
REM Run this from the project root directory

echo 🚀 Starting Chat System Migration...
echo.

REM Step 1: Backend Migration
echo 📦 Step 1: Running Prisma Migration...
cd backend
if errorlevel 1 (
    echo ❌ backend directory not found!
    exit /b 1
)

echo Creating migration...
call npx prisma migrate dev --name enhanced_chat_features

echo Generating Prisma Client...
call npx prisma generate

echo ✅ Backend migration complete!
echo.

REM Step 2: Install Dependencies
echo 📦 Step 2: Checking Dependencies...
echo Backend dependencies...
call npm install

cd ..\frontend
if errorlevel 1 (
    echo ❌ frontend directory not found!
    exit /b 1
)
echo Frontend dependencies...
call npm install

echo ✅ Dependencies checked!
echo.

echo.
echo ✅ Migration Complete!
echo.
echo 📝 Next Steps:
echo 1. Start backend: cd backend ^&^& npm run dev
echo 2. Start frontend: cd frontend ^&^& npm run dev
echo 3. Test the chat system
echo 4. Read CHAT_REDESIGN_COMPLETE.md for full documentation
echo.
echo 🎉 Happy Chatting!

pause
