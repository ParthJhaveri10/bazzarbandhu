import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Supplier from '../models/Supplier.js'

dotenv.config()

// Our proven supplier data from VoiceCart - adapted for their schema
const suppliers = [
  {
    supplierId: "SUPP001",
    name: "Mumbai Fresh Suppliers",
    businessName: "Mumbai Fresh Suppliers Pvt Ltd",
    phone: "+919876543210",
    email: "mumbai.fresh@suppliers.com",
    password: "password123", // Will be hashed by model
    address: "Market Road, Bandra West, Mumbai",
    location: {
      city: "Mumbai",
      area: "bandra",
      coordinates: { lat: 19.0596, lng: 72.8295 }
    },
    items: [
      { name: "potato", hindi: "आलू", price: 30, unit: "kg", available: true },
      { name: "onion", hindi: "प्याज", price: 40, unit: "kg", available: true },
      { name: "tomato", hindi: "टमाटर", price: 50, unit: "kg", available: true },
      { name: "rice", hindi: "चावल", price: 80, unit: "kg", available: true },
      { name: "dal", hindi: "दाल", price: 120, unit: "kg", available: true },
      { name: "oil", hindi: "तेल", price: 150, unit: "liter", available: true },
      { name: "wheat_flour", hindi: "आटा", price: 60, unit: "kg", available: true },
      { name: "sugar", hindi: "चीनी", price: 50, unit: "kg", available: true }
    ],
    isVerified: true,
    status: "active"
  },
  {
    supplierId: "SUPP002", 
    name: "Local Bazaar Co",
    businessName: "Local Bazaar Co-operative",
    phone: "+919876543211", 
    email: "local.bazaar@suppliers.com",
    password: "password123", // Will be hashed by model
    address: "Main Market, Kurla East, Mumbai",
    location: {
      city: "Mumbai", 
      area: "kurla",
      coordinates: { lat: 19.0785, lng: 72.8785 }
    },
    items: [
      { name: "potato", hindi: "आलू", price: 28, unit: "kg", available: true },
      { name: "onion", hindi: "प्याज", price: 38, unit: "kg", available: true },
      { name: "rice", hindi: "चावल", price: 75, unit: "kg", available: true },
      { name: "dal", hindi: "दाल", price: 115, unit: "kg", available: true },
      { name: "garlic", hindi: "लहसुन", price: 200, unit: "kg", available: true },
      { name: "ginger", hindi: "अदरक", price: 180, unit: "kg", available: true }
    ],
    isVerified: true,
    status: "active"
  }
]

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voicecart')
    console.log('Connected to MongoDB')

    // Clear existing suppliers
    await Supplier.deleteMany({})
    console.log('Cleared existing suppliers')

    // Insert new suppliers
    await Supplier.insertMany(suppliers)
    console.log('✅ Suppliers seeded successfully')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()
