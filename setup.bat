@echo off
echo 🚀 VoiceCart Quick Setup for Windows
echo ===================================
echo.

echo 📦 Installing dependencies...
echo.

echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)
cd ..

echo Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ Dependencies installed successfully!
echo.

echo ⚙️ Setting up environment...
if not exist "server\.env" (
    if exist ".env.example" (
        copy ".env.example" "server\.env"
        echo ✅ Environment file created
    ) else (
        echo PORT=3001> server\.env
        echo NODE_ENV=development>> server\.env
        echo OPENAI_API_KEY=sk-placeholder-key-get-real-key-from-openai>> server\.env
        echo MONGODB_URI=mongodb://localhost:27017/voicecart>> server\.env
        echo MAX_FILE_SIZE=10485760>> server\.env
        echo CLIENT_URL=http://localhost:3003>> server\.env
        echo ✅ Basic environment file created
    )
) else (
    echo ⚠️ Environment file already exists
)

if not exist "server\uploads" (
    mkdir "server\uploads"
    echo ✅ Uploads directory created
)

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo 📝 Next Steps:
echo 1. Edit server\.env and add your OpenAI API key
echo 2. Start the server: cd server ^&^& npm start
echo 3. Start the client: cd client ^&^& npm run dev
echo.
echo 🔑 Get OpenAI API Key: https://platform.openai.com/api-keys
echo 💡 The app works in demo mode without API key too!
echo.
pause
