#!/bin/bash

echo "🚀 Starting VoiceCart Application"
echo "================================"
echo ""

echo "Starting server..."
cd server && npm start &
SERVER_PID=$!

echo "Starting client..."
cd ../client && npm run dev &
CLIENT_PID=$!

echo ""
echo "✅ Both applications are starting..."
echo "📱 Client will be available at: http://localhost:3003"
echo "🔧 Server will be available at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both applications"

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
