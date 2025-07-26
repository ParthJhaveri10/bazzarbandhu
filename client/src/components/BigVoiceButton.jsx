import { useState, useRef } from 'react'
import { Mic, Square } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useVoice } from '../hooks/useVoice'

const BigVoiceButton = () => {
  const { t } = useLanguage()
  const {
    isRecording,
    isProcessing,
    transcript,
    liveTranscript,
    detectedLanguage,
    startRecording,
    stopRecording
  } = useVoice()

  const [isPressed, setIsPressed] = useState(false)
  const buttonRef = useRef(null)

  // Simple press handlers
  const handleStart = () => {
    setIsPressed(true)
    if (!isRecording && !isProcessing) {
      startRecording()
    }
  }

  const handleStop = () => {
    setIsPressed(false)
    if (isRecording) {
      stopRecording()
    }
  }

  // Get current state
  const isActive = isRecording || isProcessing
  const showMic = !isRecording

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 px-4">
      {/* Large, Simple Voice Button */}
      <div className="relative flex flex-col items-center">
        
        {/* Pulsing Ring for Recording */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping scale-110"></div>
        )}
        
        {/* Main Button */}
        <button
          ref={buttonRef}
          onMouseDown={handleStart}
          onMouseUp={handleStop}
          onMouseLeave={handleStop}
          onTouchStart={handleStart}
          onTouchEnd={handleStop}
          disabled={isProcessing}
          className={`
            relative
            w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72
            rounded-full
            ${isRecording 
              ? 'bg-red-500 shadow-2xl shadow-red-500/50' 
              : isProcessing 
                ? 'bg-orange-500 shadow-2xl shadow-orange-500/50'
                : 'bg-blue-500 shadow-2xl shadow-blue-500/30'
            }
            text-white
            transition-all duration-200 ease-out
            ${isPressed ? 'scale-95' : 'scale-100 hover:scale-105'}
            ${isProcessing ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
            border-8 border-white
            transform-gpu
          `}
        >
          {/* Icon */}
          <div className="flex items-center justify-center h-full">
            {isProcessing ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xl font-bold">{t('processing')}</span>
              </div>
            ) : showMic ? (
              <div className="flex flex-col items-center space-y-4">
                <Mic className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 drop-shadow-lg" />
                <span className="text-xl md:text-2xl font-bold">{t('tapToSpeak')}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Square className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 drop-shadow-lg animate-pulse" />
                <span className="text-xl md:text-2xl font-bold">{t('listening')}</span>
              </div>
            )}
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent"></div>
        </button>
      </div>

      {/* Simple Status Text */}
      <div className="text-center max-w-md">
        <p className="text-lg md:text-xl text-gray-700 font-medium leading-relaxed">
          {!isActive && t('holdAndSpeak')}
          {isRecording && t('releaseToSend')}
          {isProcessing && 'माल की जानकारी मिल रही है...'} {/* Processing in Hindi */}
        </p>
        
        {/* Language Detection Badge */}
        {detectedLanguage && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            🗣️ {detectedLanguage} detected
          </div>
        )}
      </div>

      {/* Live Transcription Below Button */}
      {(isRecording && liveTranscript) && (
        <div className="w-full max-w-2xl mx-auto mt-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-600">Live Transcription</span>
                {detectedLanguage && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {detectedLanguage}
                  </span>
                )}
              </div>
            </div>
            <div className="min-h-[60px] max-h-[200px] overflow-y-auto">
              <p className="text-gray-800 text-base leading-relaxed">
                {liveTranscript || "Start speaking..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Instructions with Icons */}
      <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 mt-8">
        {/* Step 1 */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">👆</span>
          </div>
          <span className="text-sm text-gray-600 text-center">{t('press') || 'दबाएं'}</span>
        </div>
        
        {/* Step 2 */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🗣️</span>
          </div>
          <span className="text-sm text-gray-600 text-center">{t('speak') || 'बोलें'}</span>
        </div>
        
        {/* Step 3 */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">👋</span>
          </div>
          <span className="text-sm text-gray-600 text-center">{t('release') || 'छोड़ें'}</span>
        </div>
      </div>

      {/* Live Transcript Display */}
      {(transcript || liveTranscript || isProcessing) && (
        <div className="w-full max-w-lg mx-auto">
          {/* Live transcription while recording */}
          {isRecording && liveTranscript && (
            <div className="p-6 bg-yellow-50 rounded-3xl border-4 border-yellow-200 shadow-lg mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-bold text-yellow-800">सुन रहे हैं...</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border-2 border-yellow-100">
                <p className="text-gray-800 text-lg leading-relaxed font-medium">{liveTranscript}</p>
              </div>
            </div>
          )}
          
          {/* Processing state */}
          {isProcessing && (
            <div className="p-6 bg-blue-50 rounded-3xl border-4 border-blue-200 shadow-lg mb-4 animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg font-bold text-blue-800">{t('transcribing') || 'प्रोसेसिंग...'}:</span>
              </div>
              <p className="text-blue-700 text-lg">आपकी आवाज़ को समझा जा रहा है...</p>
            </div>
          )}
          
          {/* Final transcript */}
          {transcript && !isProcessing && (
            <div className="p-6 bg-green-50 rounded-3xl border-4 border-green-200 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-lg font-bold text-green-800">{t('yourOrder') || 'आपका ऑर्डर'}:</span>
                </div>
                {detectedLanguage && (
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    {detectedLanguage}
                  </span>
                )}
              </div>
              <div className="bg-white rounded-2xl p-4 border-2 border-green-100">
                <p className="text-gray-800 text-lg leading-relaxed font-medium">{transcript}</p>
              </div>
              
              {/* Order Processing Status */}
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">ऑर्डर प्रोसेस हो गया है! ✅</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BigVoiceButton
