# VoiceCart Setup Guide

## Quick Setup (3 Steps)

### 1. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your OpenAI API key:
OPENAI_API_KEY=sk-your-real-openai-api-key-here
```

### 3. Start the Application
```bash
# Terminal 1: Start the server
cd server
npm start

# Terminal 2: Start the client
cd client  
npm run dev
```

## 🎯 Features Ready

✅ **Voice Recording**: Press and hold the big blue button to record  
✅ **AI Processing**: OpenAI Whisper converts speech to text  
✅ **Order Extraction**: GPT extracts items, quantities, and units  
✅ **Multi-language**: Supports 12 Indian languages  
✅ **Order Storage**: Orders saved to database with pooling  
✅ **Real-time Updates**: WebSocket notifications  

## 🔑 API Keys Required

1. **OpenAI API Key** (Required for voice processing)
   - Get from: https://platform.openai.com/api-keys
   - Used for: Speech-to-text and order parsing
   - Cost: ~$0.006 per minute of audio

## 🎙️ How Voice Processing Works

1. **Record**: User presses button and speaks order
2. **Upload**: Audio sent to server as WebM file
3. **Transcribe**: OpenAI Whisper converts speech to text
4. **Parse**: GPT extracts structured order data
5. **Store**: Order saved with pooling logic
6. **Notify**: Real-time updates to dashboard

## 📱 Supported Languages

- Hindi (हिंदी)
- English  
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Punjabi (ਪੰਜਾਬੀ)
- Odia (ଓଡ଼ିଆ)
- Assamese (অসমীয়া)

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in .env
2. Add MongoDB URI for production database  
3. Configure proper CORS origins
4. Set up SSL certificates
5. Add monitoring and logging

## 🔧 Troubleshooting

**"OpenAI API key not configured"**
- Check your .env file has the correct OPENAI_API_KEY
- Restart the server after adding the key

**"Failed to access microphone"**  
- Enable microphone permissions in browser
- Use HTTPS in production (required for microphone access)

**"Voice processing timeout"**
- Check internet connection  
- Verify OpenAI API key has sufficient credits

## 💡 Demo Mode

Without OpenAI API key, the app runs in demo mode with:
- Mock voice transcription
- Sample order data  
- Full UI functionality

Perfect for testing and development!
