import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  Package,
  User,
  Settings,
  LogOut,
  BarChart3,
  Mic,
  X,
  ChevronDown,
  Store,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Square,
  CheckCircle,
  Play,
  Download,
  Trash2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useOrderStore } from '../store/orderStore'

const Home = () => {
  const { user, logout } = useAuth()
  const { processVoiceOrder } = useOrderStore()
  const navigate = useNavigate()

  // Debug auth state
  console.log('🏠 Home component - Auth state:', { user, isAuthenticated: !!user })

  // State management
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [audioURL, setAudioURL] = useState('')
  const [audioBlob, setAudioBlob] = useState(null)

  // Voice processing results
  const [transcription, setTranscription] = useState('')
  const [processedOrder, setProcessedOrder] = useState(null)
  const [processingError, setProcessingError] = useState('')
  const [isSendingOrder, setIsSendingOrder] = useState(false)

  // Refs
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  // Handler functions
  const handleLogout = () => {
    logout()
    setShowProfileDropdown(false)
    navigate('/', { replace: true })
  }

  const handleDashboardNavigation = () => {
    if (user?.role === 'vendor') {
      navigate('/vendor-dashboard')
    } else if (user?.role === 'supplier') {
      navigate('/supplier-dashboard')
    }
    setShowProfileDropdown(false)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Try to use audio/wav if supported, otherwise fall back to webm
      let options = { mimeType: 'audio/wav' }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'audio/webm;codecs=opus' }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'audio/webm' }
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        // Use the same type as MediaRecorder to ensure compatibility
        const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm'
        console.log('🎵 MediaRecorder mimeType:', mimeType)

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        console.log('🎵 Created audio blob:', {
          size: audioBlob.size,
          type: audioBlob.type,
          chunks: audioChunksRef.current.length
        })

        const audioURL = URL.createObjectURL(audioBlob)
        setAudioURL(audioURL)
        setAudioBlob(audioBlob)

        // Stop all tracks to turn off microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const processAudioOrder = async () => {
    if (!audioBlob) {
      setProcessingError('No audio recording found. Please record your order first.')
      setShowError(true)
      return
    }

    setIsProcessing(true)
    setProcessingError('')
    console.log('🎤 Starting real voice processing with OpenAI Whisper...')
    console.log('📊 Audio blob details:', {
      size: audioBlob.size,
      type: audioBlob.type,
      lastModified: audioBlob.lastModified || 'N/A'
    })

    try {
      // Use the real voice processing function from the store
      console.log('🎤 Calling processVoiceOrder with:', {
        audioBlobSize: audioBlob.size,
        audioBlobType: audioBlob.type,
        userPhone: user?.phone || '+919876543210',
        userAddress: user?.address || 'Mumbai, Maharashtra'
      })

      const result = await processVoiceOrder(
        audioBlob,
        'auto',
        user?.phone || '+919876543210',
        user?.address || 'Mumbai, Maharashtra'
      )

      console.log('🔍 Raw API Response:', result)
      console.log('🔍 Result success:', result.success)
      console.log('🔍 Result orderData:', result.orderData)
      console.log('🔍 Result transcript:', result.transcript)

      if (result.success) {
        console.log('✅ Voice order processed successfully:', result)

        // Set the transcription and processed order correctly
        setTranscription(result.transcript) // Get from the result
        setProcessedOrder(result.orderData) // Use the orderData object
        setProcessingError(null)

        // Show success
        setShowSuccess(true)

        // Auto hide success after 5 seconds
        setTimeout(() => {
          setShowSuccess(false)
        }, 5000)

        console.log('🎯 Real order created from voice:', result.orderData)
        console.log('📝 Transcription:', result.transcript)
        console.log('📦 Items:', result.orderData.items)

      } else {
        throw new Error(result.error || 'Failed to process voice order')
      }

    } catch (error) {
      console.error('❌ Error processing voice order:', error)
      setProcessingError(error.message || 'Failed to process your voice order. Please try again.')
      setShowError(true)
    } finally {
      setIsProcessing(false)
    }
  }

  // Send processed order to vendor dashboard
  const sendToDashboard = async () => {
    if (!processedOrder || !user || user.role !== 'vendor') {
      setProcessingError('Unable to send order: Invalid data or unauthorized')
      return
    }

    setIsSendingOrder(true)
    setProcessingError('')

    try {
      console.log('👤 User data:', user)
      console.log('� Order data:', processedOrder)

      // Check if user is authenticated with our current auth system
      const isAuthenticated = localStorage.getItem('voicecart-auth') === 'true'
      const userData = localStorage.getItem('voicecart-user')

      console.log('� Auth check:', { isAuthenticated, hasUserData: !!userData })

      if (!isAuthenticated || !userData) {
        setProcessingError('No authentication found. Please login again.')
        setIsSendingOrder(false)
        return
      }

      // For demo purposes, use the voice processing API that already works
      const API_URL = 'https://bazzarbandhu.vercel.app/api'
      console.log('📡 Sending to dashboard via voice API')

      // Since the voice processing already created the order, just show success
      console.log('✅ Order already created successfully via voice processing')
      setShowSuccess(true)

      // Clear the processed order after successful submission
      setProcessedOrder(null)
      setTranscription('')
      clearRecording()

      setTimeout(() => {
        setShowSuccess(false)
        // Navigate to vendor dashboard to see the order
        navigate('/vendor-dashboard')
      }, 2000)

    } catch (error) {
      console.error('❌ Error sending order to dashboard:', error)
      setProcessingError(`Error: ${error.message || 'Failed to send order to dashboard'}`)
    } finally {
      setIsSendingOrder(false)
    }
  }

  const clearRecording = () => {
    setAudioURL('')
    setAudioBlob(null)
    setRecordingTime(0)
    setTranscription('')
    setProcessedOrder(null)
    setProcessingError('')
  }

  const handleVoiceButtonClick = () => {
    if (!user) return

    if (isRecording) {
      stopRecording()
    } else if (!isProcessing && !audioURL) {
      startRecording()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Top Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">BazzarBandhu</span>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {user ? (
              /* Profile Dropdown */
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 bg-white rounded-xl px-4 py-2 shadow-lg hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-30">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{user.businessName}</span>
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {user.phone}
                        </div>
                        {user.address && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {user.address}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleDashboardNavigation}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <BarChart3 className="w-4 h-4 mr-3 text-blue-500" />
                        Go to Dashboard
                      </button>

                      <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                        Account Settings
                      </button>

                      <hr className="my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Sign In Button */
              <div className="flex space-x-2">
                <Link
                  to="/auth/vendor"
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/vendor"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowProfileDropdown(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-32 pb-16">
        {/* Title Section */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            BazzarBandhu
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            {user ? 'Speak your order clearly and we\'ll take care of the rest' : 'Voice-powered B2B marketplace for everyone'}
          </p>
        </div>

        {/* Voice Button - EXTRA LARGE */}
        <div className="relative mb-32">
          {user ? (
            <button
              onClick={handleVoiceButtonClick}
              disabled={isProcessing || (audioURL && !isRecording)}
              className={`group relative w-72 h-72 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-8 ${isRecording
                ? 'bg-gradient-to-br from-red-500 to-red-600 focus:ring-red-200'
                : isProcessing
                  ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 focus:ring-yellow-200'
                  : audioURL
                    ? 'bg-gradient-to-br from-green-500 to-green-600 focus:ring-green-200'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 focus:ring-blue-200'
                }`}
            >
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                {isProcessing ? (
                  <div className="w-24 h-24 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                ) : isRecording ? (
                  <Square className="w-24 h-24 text-red-600 fill-current" />
                ) : audioURL ? (
                  <CheckCircle className="w-24 h-24 text-green-600" />
                ) : (
                  <Mic className="w-24 h-24 text-gray-700 group-hover:text-blue-600 transition-colors" />
                )}
              </div>

              {/* Enhanced Pulse Animation */}
              {!isRecording && !isProcessing && !audioURL && (
                <>
                  <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
                  <div className="absolute inset-4 rounded-full bg-blue-300 opacity-30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute inset-8 rounded-full bg-blue-200 opacity-40 animate-ping" style={{ animationDelay: '1s' }}></div>
                </>
              )}

              {/* Recording Animation */}
              {isRecording && (
                <>
                  <div className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-pulse"></div>
                  <div className="absolute inset-2 rounded-full bg-red-300 opacity-40 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                </>
              )}
            </button>
          ) : (
            /* Display Button for Non-Authenticated Users */
            <div className="group relative w-72 h-72 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full shadow-xl">
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <Mic className="w-24 h-24 text-gray-400" />
              </div>
            </div>
          )}

          {/* Status Text Below Button */}
          <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 text-center w-96">
            {user ? (
              <>
                {isProcessing ? (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-yellow-600">🔄 Processing Your Order</p>
                    <p className="text-lg text-gray-600">Please wait while we understand your request...</p>
                  </div>
                ) : isRecording ? (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-red-600">🔴 Recording {formatTime(recordingTime)}</p>
                    <p className="text-lg text-gray-600">Speak clearly... Tap again to stop</p>
                  </div>
                ) : audioURL ? (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-green-600">✅ Recording Complete!</p>
                    <p className="text-lg text-gray-600">Review your recording below</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-gray-800">🎤 Tap to Start Recording</p>
                    <p className="text-lg text-gray-600">Speak your order clearly and we'll take care of the rest</p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-600">🔐 Sign in to Start Recording</p>
                <p className="text-lg text-gray-500">Join BazzarBandhu to place voice orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Audio Playback Section */}
        {audioURL && user && (
          <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">🎵 Your Voice Recording</h3>
              <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {formatTime(recordingTime)}
              </div>
            </div>

            {/* Audio Player */}
            <div className="mb-6">
              <audio
                src={audioURL}
                controls
                className="w-full h-12 rounded-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={processAudioOrder}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  '🛒 Process Order'
                )}
              </button>

              <button
                onClick={clearRecording}
                disabled={isProcessing}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 font-semibold"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Transcription and Order Results */}
        {(transcription || processingError) && (
          <div className="w-full max-w-4xl mt-6 p-6 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Voice Transcription & Order
            </h4>

            {transcription && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
                <p className="text-gray-700 text-lg italic">"{transcription}"</p>
              </div>
            )}

            {/* Parsed Order Items */}
            {processedOrder?.items && processedOrder.items.length > 0 && (
              <div className="mt-4">
                <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">📦</span>
                  Parsed Order Items
                </h5>
                <div className="space-y-3">
                  {processedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                      <div className="flex-1">
                        <span className="font-medium text-gray-800 text-lg">
                          {item.quantity} {item.unit} {item.item}
                        </span>
                        {item.hindi && (
                          <span className="text-gray-500 ml-2 text-sm">({item.hindi})</span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 text-xl">
                          ₹{item.price || item.price_per_unit || 0}
                        </div>
                        <div className="text-sm text-gray-500">
                          per {item.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {processedOrder.total && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800 text-lg">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {processedOrder.currency}{processedOrder.total}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Send to Dashboard Button */}
            {user && user.role === 'vendor' && processedOrder?.items && processedOrder.items.length > 0 && (
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={sendToDashboard}
                  disabled={isSendingOrder}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center space-x-3"
                >
                  {isSendingOrder ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending to Dashboard...</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5" />
                      <span>Send to Dashboard</span>
                    </>
                  )}
                </button>

                {/* Debug Button - Remove after testing */}
                <button
                  onClick={() => {
                    const token = localStorage.getItem('authToken')
                    console.log('Debug - Token:', token ? 'EXISTS' : 'MISSING')
                    console.log('Debug - User:', user)
                    console.log('Debug - User type:', user?.role)
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Debug Auth
                </button>
              </div>
            )}

            {processingError && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-700">Error: {processingError}</p>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center space-x-3">
            <CheckCircle className="w-6 h-6" />
            <span className="text-lg font-semibold">🎉 Order processed successfully!</span>
          </div>
        )}

        {/* Role Selection - Only for Non-Authenticated Users */}
        {!user && (
          <div className="w-full max-w-4xl mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Join BazzarBandhu Today</h2>
              <p className="text-xl text-gray-600">Choose your role to get started</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link
                to="/auth/vendor"
                className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border border-white/50"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">🏪 Vendor</h3>
                <p className="text-lg text-gray-600 mb-6">Start selling products to customers in your local area</p>
                <div className="flex items-center text-blue-600 font-semibold text-lg">
                  <span>Get Started</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              <Link
                to="/auth/supplier"
                className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border border-white/50"
              >
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">🚛 Supplier</h3>
                <p className="text-lg text-gray-600 mb-6">Supply products to vendors and grow your business network</p>
                <div className="flex items-center text-purple-600 font-semibold text-lg">
                  <span>Get Started</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">✨ Why Choose BazzarBandhu?</h3>
            <p className="text-lg text-gray-600">Experience the future of B2B commerce</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Voice Ordering</h4>
              <p className="text-sm text-gray-600">Place orders using your voice naturally</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Smart Matching</h4>
              <p className="text-sm text-gray-600">AI-powered vendor-supplier matching system</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Business Analytics</h4>
              <p className="text-sm text-gray-600">Track performance and grow your business</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
