import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Send, Loader2 } from 'lucide-react'
import { useVoice } from '../hooks/useVoice'
import { useOrderStore } from '../store/orderStore'
import toast from 'react-hot-toast'

const VoiceRecorder = ({ onOrderCreated }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [location, setLocation] = useState('')
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const { processVoiceOrder, isProcessing } = useVoice()
  const { addOrder } = useOrderStore()

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude},${position.coords.longitude}`)
        },
        (error) => {
          console.warn('Location access denied:', error)
          setLocation('Mumbai, India') // Default location
        }
      )
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      toast.success('Recording started! Speak your order...')
    } catch (error) {
      toast.error('Could not access microphone')
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.success('Recording stopped')
    }
  }

  const handleSubmitOrder = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    if (!audioBlob && !transcript.trim()) {
      toast.error('Please record your order or enter text')
      return
    }

    try {
      let orderData
      
      if (audioBlob) {
        // Process voice order
        orderData = await processVoiceOrder(audioBlob, phoneNumber, location)
      } else {
        // Process text order
        orderData = {
          vendorPhone: phoneNumber,
          items: parseTextOrder(transcript),
          location: { address: location },
          status: 'pending',
          timestamp: new Date()
        }
      }

      // Add to store and send to backend
      addOrder(orderData)
      
      toast.success('Order submitted successfully!')
      
      // Reset form
      setAudioBlob(null)
      setTranscript('')
      
      if (onOrderCreated) {
        onOrderCreated(orderData)
      }
    } catch (error) {
      toast.error('Failed to submit order')
      console.error('Error submitting order:', error)
    }
  }

  const parseTextOrder = (text) => {
    // Simple text parsing - can be enhanced
    const items = text.split(',').map(item => {
      const trimmed = item.trim()
      const match = trimmed.match(/(\d+)\s*(.+)/)
      if (match) {
        return {
          quantity: match[1],
          item: match[2],
          unit: 'kg'
        }
      }
      return {
        quantity: '1',
        item: trimmed,
        unit: 'kg'
      }
    })
    return items
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Place Your Order
      </h2>

      <div className="space-y-6">
        {/* Phone Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+91 9876543210"
            className="input w-full"
            required
          />
        </div>

        {/* Location Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location"
            className="input w-full"
          />
        </div>

        {/* Voice Recording Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Voice Order</h3>
          
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-semibold transition-all transform hover:scale-105 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
            
            <p className="text-sm text-gray-600 text-center">
              {isRecording 
                ? 'Recording... Click to stop' 
                : 'Click to start recording your order'
              }
            </p>

            {audioBlob && (
              <div className="text-center">
                <p className="text-sm text-green-600 mb-2">✓ Audio recorded</p>
                <audio controls className="w-full max-w-xs">
                  <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
                </audio>
              </div>
            )}
          </div>
        </div>

        {/* Text Alternative */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Or Type Your Order</h3>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="e.g., 2 kg rice, 1 kg dal, 500g oil"
            className="input w-full h-24 resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            Separate items with commas. Include quantities.
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitOrder}
          disabled={isProcessing || (!audioBlob && !transcript.trim()) || !phoneNumber.trim()}
          className="btn btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Order...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Send className="w-5 h-5 mr-2" />
              Submit Order
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default VoiceRecorder
