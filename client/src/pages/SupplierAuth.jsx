import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, Users, Eye, EyeOff, User, Building, Phone, Mail, MapPin } from 'lucide-react'
import { useAuthStore } from '../context/AuthContext'

const SupplierAuth = () => {
    const [mode, setMode] = useState('login')
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        businessName: '',
        address: '',
        pincode: ''
    })

    const navigate = useNavigate()
    const location = useLocation()
    const { login, signup, loading, error, user } = useAuthStore()

    const from = location.state?.from?.pathname || '/supplier-dashboard'

    useEffect(() => {
        if (user && user.type === 'supplier') {
            // Replace history so user can't go back to role selection
            navigate('/supplier-dashboard', { replace: true })
        }
    }, [user, navigate])

    // Generate unique supplier ID
    const generateSupplierId = (name, phone) => {
        const timestamp = Date.now().toString().slice(-6)
        const namePrefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase()
        const phonePrefix = phone.replace(/[^0-9]/g, '').slice(-4)
        return `S${namePrefix}${phonePrefix}${timestamp}`
    }

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (mode === 'login') {
                await login(formData.email, formData.password, 'supplier')
                // Navigate with replace to remove auth pages from history
                navigate('/supplier-dashboard', { replace: true })
            } else {
                // Registration with unique ID
                const supplierId = generateSupplierId(formData.name, formData.phone)

                await signup({
                    ...formData,
                    type: 'supplier',
                    uniqueId: supplierId,
                    userType: 'supplier'
                })
                // Navigate with replace to remove auth pages from history
                navigate('/supplier-dashboard', { replace: true })
            }
        } catch (err) {
            console.error('Authentication error:', err)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 relative">
            {/* Header */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                <Link
                    to="/"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back to Role Selection</span>
                </Link>
            </div>

            <div className="flex items-center justify-center min-h-screen px-6 pt-20">
                <div className="w-full max-w-md">

                    {/* Logo and Title */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {mode === 'login' ? 'Supplier Sign In' : 'Create Supplier Account'}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {mode === 'login'
                                ? 'Welcome back! Please sign in to your supplier account.'
                                : 'Join our network of suppliers and grow your business reach.'
                            }
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Auth Form */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Registration Fields */}
                            {mode === 'signup' && (
                                <>
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <User className="w-4 h-4 inline mr-2" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-400"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    {/* Business Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Building className="w-4 h-4 inline mr-2" />
                                            Business Name
                                        </label>
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-400"
                                            placeholder="Enter your business name"
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Phone className="w-4 h-4 inline mr-2" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-400"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>

                                    {/* Business Address */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <MapPin className="w-4 h-4 inline mr-2" />
                                            Business Address
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none text-gray-900 placeholder-gray-400"
                                            placeholder="Enter your business address"
                                        />
                                    </div>

                                    {/* Pincode */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <MapPin className="w-4 h-4 inline mr-2" />
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            required
                                            maxLength="6"
                                            pattern="[0-9]{6}"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-400"
                                            placeholder="Enter 6-digit pincode"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Email Address */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-400"
                                    placeholder="Enter your email address"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-400"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                                    </div>
                                ) : (
                                    mode === 'login' ? 'Sign In to Your Account' : 'Create Supplier Account'
                                )}
                            </button>
                        </form>

                        {/* Toggle Login/Signup */}
                        <div className="text-center mt-8">
                            <p className="text-gray-600">
                                {mode === 'login'
                                    ? "Don't have a supplier account?"
                                    : "Already have a supplier account?"
                                }
                                <button
                                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                    className="ml-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                                >
                                    {mode === 'login' ? 'Create Account' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Role Switch */}
                    <div className="text-center mt-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                            <p className="text-gray-700 mb-2">
                                Looking to sell products instead of supplying?
                            </p>
                            <Link
                                to="/vendor-auth"
                                className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                            >
                                Switch to Vendor Account
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SupplierAuth