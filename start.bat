@echo off
REM Windows batch script to start the Expense Sharing Application

echo 🚀 Starting Expense Sharing Application...
echo.

REM Check and install backend dependencies
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Check and install frontend dependencies
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo ✅ Installation complete!
echo.
echo 📝 Make sure MongoDB is running!
echo.

REM Start backend server
echo Starting backend server...
cd backend
start cmd /k "npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend server
echo Starting frontend server...
cd ../frontend
start cmd /k "npm start"

cd ..

echo.
echo ✨ Application is starting!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Close the command windows to stop the servers.
