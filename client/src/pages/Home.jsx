import { Link } from 'react-router-dom'
import { Users, Package } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import BigVoiceButton from '../components/BigVoiceButton'
import LanguageSelector from '../components/LanguageSelector'

const Home = () => {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 space-y-12">
        
        {/* Logo/Title Area */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BazzarBandhu
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-md">
            {t('speakYourOrder')}
          </p>
        </div>

        {/* Voice Button - Main Feature */}
        <BigVoiceButton />

        {/* User Type Selection */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link
            to="/vendor"
            className="flex-1 flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
          >
            <Package className="w-12 h-12 text-blue-600 mb-3" />
            <span className="text-lg font-semibold text-gray-800">{t('vendor')}</span>
            <span className="text-sm text-gray-500 mt-1">{t('startSelling')}</span>
          </Link>

          <Link
            to="/supplier"
            className="flex-1 flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-purple-200"
          >
            <Users className="w-12 h-12 text-purple-600 mb-3" />
            <span className="text-lg font-semibold text-gray-800">{t('supplier')}</span>
            <span className="text-sm text-gray-500 mt-1">{t('startSupplying')}</span>
          </Link>
        </div>

        {/* Visual Indicators */}
        <div className="flex space-x-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mb-2 animate-pulse"></div>
            <span className="text-xs text-gray-500">🎙️ हिंदी</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mb-2 animate-pulse"></div>
            <span className="text-xs text-gray-500">🎙️ English</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mb-2 animate-pulse"></div>
            <span className="text-xs text-gray-500">🎙️ తెలుగు</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mb-2 animate-pulse"></div>
            <span className="text-xs text-gray-500">🎙️ தமிழ்</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
