import { useState } from 'react'
import { Eye, EyeOff, User, Phone, Mail, Lock, Store, Building } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

const AuthForm = ({
    type = 'vendor', // 'vendor' or 'supplier'
    mode = 'login', // 'login' or 'signup'
    onSubmit,
    loading = false,
    error = null
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        address: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { t } = useLanguage()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (mode === 'signup') {
            if (formData.password !== formData.confirmPassword) {
                alert(t('passwordsDoNotMatch') || 'Passwords do not match')
                return
            }
            if (formData.password.length < 6) {
                alert(t('passwordMinLength') || 'Password must be at least 6 characters')
                return
            }
        }

        onSubmit(formData)
    }

    const isSignup = mode === 'signup'
    const title = isSignup
        ? (type === 'vendor' ? t('createVendorAccount') : t('createSupplierAccount'))
        : (type === 'vendor' ? t('vendorLogin') : t('supplierLogin'))

    const subtitle = isSignup
        ? (type === 'vendor' ? t('joinAsVendor') : t('joinAsSupplier'))
        : (type === 'vendor' ? t('welcomeBackVendor') : t('welcomeBackSupplier'))

    return (
        <div className="card max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {type === 'vendor' ? (
                        <Store className="w-8 h-8 text-primary-600" />
                    ) : (
                        <Building className="w-8 h-8 text-primary-600" />
                    )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-600 mt-2">
                    {subtitle}
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('fullName')}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input pl-10"
                                    placeholder={t('enterFullName')}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {type === 'vendor' ? t('shopName') : t('businessName')}
                            </label>
                            <div className="relative">
                                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    className="input pl-10"
                                    placeholder={type === 'vendor' ? t('enterShopName') : t('enterBusinessName')}
                                    required
                                />
                            </div>
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('emailAddress')}
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input pl-10"
                            placeholder={t('enterEmail')}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('phoneNumber')}
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input pl-10"
                            placeholder={t('enterPhone')}
                            required
                        />
                    </div>
                </div>

                {isSignup && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('businessAddress')}
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="input"
                            placeholder={t('enterBusinessAddress')}
                            rows={3}
                            required
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('password')}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input pl-10 pr-10"
                            placeholder={t('enterPassword')}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {isSignup && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('confirmPassword')}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input pl-10 pr-10"
                                placeholder={t('confirmYourPassword')}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full"
                >
                    {loading ? t('processing') : (isSignup ? t('createAccount') : t('signIn'))}
                </button>
            </form>
        </div>
    )
}

export default AuthForm