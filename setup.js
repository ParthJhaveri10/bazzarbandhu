#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 VoiceCart Setup Script')
console.log('========================\n')

// Check if we're in the right directory
if (!fs.existsSync('server') || !fs.existsSync('client')) {
  console.error('❌ Please run this script from the root directory of VoiceCart project')
  process.exit(1)
}

// Step 1: Install server dependencies
console.log('📦 Installing server dependencies...')
try {
  execSync('cd server && npm install', { stdio: 'inherit' })
  console.log('✅ Server dependencies installed\n')
} catch (error) {
  console.error('❌ Failed to install server dependencies')
  process.exit(1)
}

// Step 2: Install client dependencies  
console.log('📦 Installing client dependencies...')
try {
  execSync('cd client && npm install', { stdio: 'inherit' })
  console.log('✅ Client dependencies installed\n')
} catch (error) {
  console.error('❌ Failed to install client dependencies')
  process.exit(1)
}

// Step 3: Setup environment file
console.log('⚙️  Setting up environment configuration...')
const envExamplePath = '.env.example'
const envPath = 'server/.env'

if (fs.existsSync(envExamplePath)) {
  if (!fs.existsSync(envPath)) {
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ Environment file created at server/.env')
  } else {
    console.log('⚠️  Environment file already exists at server/.env')
  }
} else {
  console.log('⚠️  .env.example not found, creating basic .env...')
  const basicEnv = `PORT=3001
NODE_ENV=development
OPENAI_API_KEY=sk-placeholder-key-get-real-key-from-openai
MONGODB_URI=mongodb://localhost:27017/voicecart
MAX_FILE_SIZE=10485760
CLIENT_URL=http://localhost:3003
`
  fs.writeFileSync(envPath, basicEnv)
  console.log('✅ Basic environment file created')
}

// Step 4: Create uploads directory
const uploadsDir = 'server/uploads'
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('✅ Uploads directory created')
}

console.log('\n🎉 Setup Complete!')
console.log('==================')
console.log('\n📝 Next Steps:')
console.log('1. Edit server/.env and add your OpenAI API key')
console.log('2. Start the server: cd server && npm start')
console.log('3. Start the client: cd client && npm run dev')
console.log('\n🔑 Get OpenAI API Key: https://platform.openai.com/api-keys')
console.log('💡 The app works in demo mode without API key too!')
