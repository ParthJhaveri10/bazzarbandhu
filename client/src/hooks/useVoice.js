import { useState, useRef } from 'react'
import api from '../utils/api'

export const useVoice = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [liveTranscript, setLiveTranscript] = useState('')
  const [detectedLanguage, setDetectedLanguage] = useState('')
  const [error, setError] = useState(null)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recognitionRef = useRef(null)

  // Simple language detection based on script/common words
  const detectLanguageFromText = (text) => {
    if (!text) return
    
    // Hindi/Devanagari script
    if (/[\u0900-\u097F]/.test(text)) {
      setDetectedLanguage('Hindi')
    }
    // Tamil script
    else if (/[\u0B80-\u0BFF]/.test(text)) {
      setDetectedLanguage('Tamil')
    }
    // Telugu script
    else if (/[\u0C00-\u0C7F]/.test(text)) {
      setDetectedLanguage('Telugu')
    }
    // Bengali script
    else if (/[\u0980-\u09FF]/.test(text)) {
      setDetectedLanguage('Bengali')
    }
    // Gujarati script
    else if (/[\u0A80-\u0AFF]/.test(text)) {
      setDetectedLanguage('Gujarati')
    }
    // Kannada script
    else if (/[\u0C80-\u0CFF]/.test(text)) {
      setDetectedLanguage('Kannada')
    }
    // Malayalam script
    else if (/[\u0D00-\u0D7F]/.test(text)) {
      setDetectedLanguage('Malayalam')
    }
    // Punjabi script
    else if (/[\u0A00-\u0A7F]/.test(text)) {
      setDetectedLanguage('Punjabi')
    }
    // Odia script
    else if (/[\u0B00-\u0B7F]/.test(text)) {
      setDetectedLanguage('Odia')
    }
    // English (Latin script)
    else if (/^[a-zA-Z\s.,!?]+$/.test(text)) {
      setDetectedLanguage('English')
    }
    // Default fallback
    else {
      setDetectedLanguage('Mixed/Unknown')
    }
  }

  const processVoiceOrder = async (audioBlob, vendorPhone, location) => {
    setIsProcessing(true)
    setError(null)

    try {
      // Create FormData for audio upload
      const formData = new FormData()
      formData.append('audio', audioBlob, 'order.webm')
      formData.append('vendorPhone', vendorPhone)
      formData.append('location', location)

      // Send to backend for processing
      const response = await api.post('/voice/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout for voice processing
      })

      const result = response.data
      
      // Handle both old and new API response formats
      const orderData = result.data || result
      setTranscript(orderData.transcript)
      setDetectedLanguage(orderData.languageDetected || orderData.language_detected || 'hindi')
      
      return {
        vendorPhone,
        items: orderData.items,
        location: orderData.location,
        transcript: orderData.transcript,
        confidence: orderData.confidence,
        detectedLanguage: orderData.languageDetected || orderData.language_detected,
        status: 'pending',
        timestamp: new Date(),
        estimatedValue: orderData.estimatedValue || orderData.totalEstimate
      }
    } catch (error) {
      console.error('Voice processing error:', error)
      setError(error.response?.data?.message || 'Failed to process voice order')
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const processTextOrder = async (text, vendorPhone, location) => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await api.post('/voice/process-text', {
        text,
        vendorPhone,
        location
      })

      const result = response.data
      setTranscript(text)
      
      return {
        vendorPhone,
        items: result.items,
        location: result.location,
        transcript: text,
        status: 'pending',
        timestamp: new Date(),
        estimatedValue: result.estimatedValue
      }
    } catch (error) {
      console.error('Text processing error:', error)
      setError(error.response?.data?.message || 'Failed to process text order')
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  // Speech recognition for browsers that support it
  const startSpeechRecognition = (onResult, onError) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError('Speech recognition not supported in this browser')
      return null
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'hi-IN' // Hindi language
    
    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      onResult(finalTranscript, interimTranscript)
    }

    recognition.onerror = (event) => {
      onError(`Speech recognition error: ${event.error}`)
    }

    recognition.onend = () => {
      console.log('Speech recognition ended')
    }

    return recognition
  }

  const clearTranscript = () => {
    setTranscript('')
    setLiveTranscript('')
    setDetectedLanguage('')
    setError(null)
  }

  // Start recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Clear previous transcripts
      setTranscript('')
      setLiveTranscript('')
      setDetectedLanguage('')
      setError(null)
      
      audioChunksRef.current = []
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      // Start speech recognition for live transcription with language detection
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'hi-IN' // Start with Hindi, will auto-detect
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
              // Detect language from transcript content
              detectLanguageFromText(transcript)
            } else {
              interimTranscript += transcript
            }
          }
          
          setLiveTranscript(interimTranscript || finalTranscript)
        }
        
        recognitionRef.current.onerror = (event) => {
          console.warn('Speech recognition error:', event.error)
          // Don't stop recording on speech recognition errors
        }
        
        recognitionRef.current.start()
      }
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = async () => {
        // Stop speech recognition
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        
        // Process the audio automatically
        try {
          const vendorPhone = '1234567890' // Default for demo
          const location = 'Demo Location'  // Default for demo
          
          setLiveTranscript('') // Clear live transcript
          const order = await processVoiceOrder(audioBlob, vendorPhone, location)
          console.log('Order processed:', order)
        } catch (err) {
          console.error('Failed to process order:', err)
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      
    } catch (err) {
      setError('Failed to access microphone')
      console.error('Recording error:', err)
    }
  }

  // Stop recording functionality  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  return {
    processVoiceOrder,
    processTextOrder,
    startSpeechRecognition,
    startRecording,
    stopRecording,
    isRecording,
    isProcessing,
    transcript,
    liveTranscript,
    detectedLanguage,
    error,
    clearTranscript,
    setTranscript
  }
}
