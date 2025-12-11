#!/bin/bash

# Chat System Migration Script
# Run this from the project root directory

echo "🚀 Starting Chat System Migration..."
echo ""

# Step 1: Backend Migration
echo "📦 Step 1: Running Prisma Migration..."
cd backend || { echo "❌ backend directory not found!"; exit 1; }

echo "Creating migration..."
npx prisma migrate dev --name enhanced_chat_features

echo "Generating Prisma Client..."
npx prisma generate

echo "✅ Backend migration complete!"
echo ""

# Step 2: Install Dependencies
echo "📦 Step 2: Checking Dependencies..."
echo "Backend dependencies..."
npm install

cd ../frontend || { echo "❌ frontend directory not found!"; exit 1; }
echo "Frontend dependencies..."
npm install

echo "✅ Dependencies checked!"
echo ""

# Step 3: Build Check
echo "🔍 Step 3: Type Checking..."
cd ../backend
npm run build 2>&1 | head -n 20

cd ../frontend
npm run build 2>&1 | head -n 20

echo ""
echo "✅ Migration Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Start backend: cd backend && npm run dev"
echo "2. Start frontend: cd frontend && npm run dev"
echo "3. Test the chat system"
echo "4. Read CHAT_REDESIGN_COMPLETE.md for full documentation"
echo ""
echo "🎉 Happy Chatting!"
