#!/bin/bash

echo "🚀 Starting Expense Sharing Application..."

# Check if backend node_modules exist
if [ ! -d "backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd backend
  npm install
  cd ..
fi

# Check if frontend node_modules exist
if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd frontend
  npm install
  cd ..
fi

echo "✅ Installation complete!"
echo ""
echo "📝 Make sure MongoDB is running!"
echo ""
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

sleep 3

echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✨ Application is starting!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
