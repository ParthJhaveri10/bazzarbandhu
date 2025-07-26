@echo off
echo 🚀 Starting VoiceCart Application
echo ================================
echo.

echo Starting server in new window...
start "VoiceCart Server" cmd /k "cd server && npm start"

echo Starting client in new window...
start "VoiceCart Client" cmd /k "cd client && npm run dev"

echo.
echo ✅ Both applications are starting...
echo 📱 Client will be available at: http://localhost:3003
echo 🔧 Server will be available at: http://localhost:3001
echo.
echo Press any key to exit this script (applications will continue running)
pause > nul
