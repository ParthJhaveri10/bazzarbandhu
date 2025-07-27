import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Users, Globe } from 'lucide-react'

const RoleSelection = () => {

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
            {/* Main Content */}
            <div className="flex flex-col items-center justify-center min-h-screen px-6">

                {/* Logo and Welcome Message */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                            <Package className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                        BazzarBandhu
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto leading-relaxed mb-4">
                        Welcome to Voice-Powered B2B Marketplace
                    </p>

                    <p className="text-lg text-gray-600 max-w-xl mx-auto">
                        Choose your role to get started with our platform
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">

                    {/* Vendor Card */}
                    <Link
                        to="/auth/vendor"
                        className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border border-white/50 text-center"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                            <Package className="w-10 h-10 text-white" />
                        </div>

                        <h3 className="text-3xl font-bold text-gray-800 mb-4">
                            🏪 Vendor
                        </h3>

                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Sell products to customers in your local area. Manage inventory, receive orders, and grow your business.
                        </p>

                        <div className="flex items-center justify-center text-blue-600 font-semibold text-lg group-hover:text-blue-700">
                            <span>Get Started as Vendor</span>
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>

                    {/* Supplier Card */}
                    <Link
                        to="/auth/supplier"
                        className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border border-white/50 text-center"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                            <Users className="w-10 h-10 text-white" />
                        </div>

                        <h3 className="text-3xl font-bold text-gray-800 mb-4">
                            🚛 Supplier
                        </h3>

                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Supply products to vendors and grow your business network. Manage wholesale orders and expand your reach.
                        </p>

                        <div className="flex items-center justify-center text-purple-600 font-semibold text-lg group-hover:text-purple-700">
                            <span>Get Started as Supplier</span>
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                </div>

                {/* Features Preview */}
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">
                            🌟 Why Choose BazzarBandhu?
                        </h3>
                        <p className="text-lg text-gray-600">
                            Experience the future of B2B commerce
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Voice Ordering */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 mb-2">
                                Voice Ordering
                            </h4>
                            <p className="text-sm text-gray-600">
                                Place orders using your voice naturally
                            </p>
                        </div>

                        {/* Multi-Language Support */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 mb-2">
                                Voice Technology
                            </h4>
                            <p className="text-sm text-gray-600">
                                Advanced voice recognition and processing
                            </p>
                        </div>

                        {/* Smart Business Matching */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 mb-2">
                                Smart Business Matching
                            </h4>
                            <p className="text-sm text-gray-600">
                                AI-powered vendor-supplier matching system
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to Action Section */}
                <div className="w-full max-w-2xl mt-16">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-center text-white shadow-2xl">
                        <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Business?</h3>
                        <p className="text-lg mb-6 opacity-90">
                            Join thousands of vendors and suppliers already using BazzarBandhu
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/auth/vendor"
                                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Join as Vendor
                            </Link>
                            <Link
                                to="/auth/supplier"
                                className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Join as Supplier
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Additional Features Section */}
                <div className="w-full max-w-4xl mt-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* For Vendors */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-800">For Vendors</h4>
                            </div>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                    Manage your product inventory
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                    Receive orders from customers
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                    Connect with reliable suppliers
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                    Track sales and analytics
                                </li>
                            </ul>
                        </div>

                        {/* For Suppliers */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-800">For Suppliers</h4>
                            </div>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                    Expand your business network
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                    Manage wholesale orders
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                    Find new vendor partners
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                    Streamline supply chain
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="w-full max-w-2xl mt-12 mb-8">
                    <div className="text-center">
                        <p className="text-gray-500 text-sm">
                            Powered by advanced AI and voice technology to make B2B commerce simple and efficient
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoleSelection