@echo off
echo 🚀 Deploying BazzarBandhu to Vercel...
echo.

echo 📦 Installing root dependencies...
call npm install

echo 📦 Building client...
cd client
call npm install
call npm run build
cd ..

echo 🚀 Deploying to Vercel...
call vercel --prod

echo.
echo ✅ Deployment complete!
echo 🌐 Your app should now work at https://bazzarbandhu.vercel.app
echo.
echo 📋 Next steps:
echo 1. Go to Vercel dashboard
echo 2. Add environment variables if not already added
echo 3. Test the login/signup functionality
pause
