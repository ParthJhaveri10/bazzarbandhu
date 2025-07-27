# 🎤 VoiceCart - Voice-Native Marketplace for Street Vendors

A revolutionary platform that empowers street vendors with voice-first ordering, smart delivery pooling, and seamless supplier connections. Built for the hackathon to solve the "last 50 meters" problem in vendor supply chains.

## 🚀 Live Demo

- **Frontend**: [https://voicecart.vercel.app](https://voicecart.vercel.app)
- **Backend**: [https://voicecart-api.railway.app](https://voicecart-api.railway.app)

## ✨ Key Features

### 🎙️ Voice-First Interface
- **Multilingual Support**: Hindi, English, and local languages
- **AI-Powered Processing**: OpenAI Whisper for speech-to-text
- **Smart Order Parsing**: GPT extracts items, quantities, and preferences
- **No Digital Literacy Required**: Vendors can order without typing

### 📦 Smart Order Pooling
- **Location-Based Grouping**: Orders pooled by proximity
- **Threshold-Triggered Dispatch**: Minimum orders/value triggers delivery
- **Real-Time Updates**: Live status via Socket.IO and SMS
- **Efficient Last-Mile Delivery**: Solves the "can't leave stall" problem

### 🤝 Vendor-Supplier Network
- **Two-Sided Marketplace**: Connects vendors with local suppliers
- **Supplier Dashboard**: Real-time pool management and dispatch
- **SMS Notifications**: Updates via Twilio for low-smartphone penetration
- **Payment Integration**: Multiple payment methods supported

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** - Fast development and hot reload
- **Tailwind CSS** - Rapid styling and mobile-first design
- **Zustand** - Simple state management
- **Socket.IO Client** - Real-time updates
- **React Router** - Navigation
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Clean, consistent icons

### Backend
- **Node.js** + **Express** - Scalable server architecture
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** + **Mongoose** - Flexible document database
- **OpenAI API** - Voice processing and order parsing
- **Twilio** - SMS notifications
- **Multer** - File upload handling

### DevOps & Deployment
- **Vercel** - Frontend deployment
- **Railway** - Backend deployment
- **MongoDB Atlas** - Cloud database
- **Environment Management** - Secure configuration

## 📁 Project Structure

```
voicecart/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── VoiceRecorder.jsx
│   │   │   ├── OrderPool.jsx
│   │   │   └── Header.jsx
│   │   ├── pages/          # Route components
│   │   │   ├── Home.jsx
│   │   │   ├── VendorDashboard.jsx
│   │   │   └── SupplierDashboard.jsx
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useVoice.js
│   │   │   └── useSocket.js
│   │   ├── store/          # State management
│   │   │   └── orderStore.js
│   │   └── utils/          # Utilities
│   │       └── api.js
├── server/                 # Node.js backend
│   ├── routes/             # API endpoints
│   │   ├── voice.js
│   │   ├── orders.js
│   │   ├── pools.js
│   │   └── suppliers.js
│   ├── models/             # Database schemas
│   │   ├── Order.js
│   │   ├── Pool.js
│   │   └── Supplier.js
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key
- Twilio account (for SMS)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/voicecart.git
cd voicecart
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

### 4. Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voicecart
OPENAI_API_KEY=your_openai_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env)
```env
VITE_SERVER_URL=http://localhost:5000
```

## 📱 User Flows

### 🛒 Vendor Journey
1. **Enter Phone Number** - Simple registration
2. **Voice Order** - Speak order in preferred language
3. **AI Processing** - System extracts items and quantities
4. **Order Confirmation** - Review and submit
5. **Real-Time Updates** - SMS notifications for status
6. **Delivery** - Supplier delivers to vendor location

### 🚚 Supplier Journey
1. **Supplier Registration** - Business details and service areas
2. **Pool Monitoring** - Real-time dashboard of order pools
3. **Dispatch Decision** - Choose when to fulfill pooled orders
4. **Delivery Management** - Track and update delivery status
5. **Payment Processing** - Handle payments and settlements

## 🎯 Problem & Solution

### The Problem
- **Can't Leave Stalls**: Vendors lose income when sourcing materials
- **Small Order Economics**: Individual orders aren't profitable for suppliers
- **Digital Barriers**: Low smartphone/literacy prevents app usage
- **Last 50 Meters**: Final delivery to vendor locations is inefficient

### Our Solution
- **Voice-First**: Eliminates digital literacy barriers
- **Smart Pooling**: Makes small orders economically viable
- **Location Delivery**: Suppliers deliver directly to vendor areas
- **Real-Time Coordination**: Efficient communication via SMS and app

## 📊 Market Impact

- **₹2.5L Crore** street food market in India
- **20M+** street vendors across the country
- **60%** daily income loss due to sourcing trips
- **Massive Opportunity** for digital transformation

## 🔧 Development Commands

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend
```bash
npm run dev        # Start with nodemon
npm start          # Start production server
npm test           # Run tests
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
vercel deploy
```

### Backend (Railway)
```bash
cd server
# Connect to Railway and deploy
railway deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Submission

This project was built for [Hackathon Name] to address critical challenges in street vendor supply chains. Our solution demonstrates:

- ✅ **Technical Innovation**: Voice-first interface with AI processing
- ✅ **Social Impact**: Empowers 20M+ street vendors across India
- ✅ **Economic Viability**: Proven business model with clear revenue streams
- ✅ **Scalability**: Cloud-native architecture ready for millions of users
- ✅ **Real-World Testing**: Built with actual vendor feedback and requirements

## 👥 Team

- **[Your Name]** - Full Stack Developer
- **[Team Member]** - Backend Developer
- **[Team Member]** - Frontend Developer
- **[Team Member]** - UI/UX Designer

## 📞 Contact

- **Email**: team@voicecart.in
- **Demo**: [Live Demo Link]
- **Presentation**: [Pitch Deck Link]

---

**VoiceCart** - Empowering street vendors with voice-native technology 🎤📦🚀
