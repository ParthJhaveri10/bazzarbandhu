import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'
import Order from '../models/Order.js'
import Pool from '../models/Pool.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Force OpenAI initialization with our working API key
const openai = new OpenAI({
  apiKey: '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'
})

console.log('✅ OpenAI API configured with hardcoded key for sprint')

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `voice-order-${uniqueSuffix}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'), false)
    }
  }
})

// Helper function to find or create a pool
const findOrCreatePool = async (location, supplierId = null) => {
  try {
    // Try to find existing pool in the area
    let pool = await Pool.findOne({
      'location.city': new RegExp(location.city || 'Mumbai', 'i'),
      'location.area': new RegExp(location.area || location.address, 'i'),
      status: { $in: ['collecting', 'ready'] }
    })

    // If no pool exists, create a new one
    if (!pool) {
      pool = new Pool({
        location: {
          address: location.address || location,
          city: location.city || 'Mumbai',
          area: location.area || location.address
        },
        supplierId,
        status: 'collecting',
        threshold: {
          minOrders: 3,
          minValue: 500,
          maxWaitTime: 120
        }
      })
      await pool.save()
    }

    return pool
  } catch (error) {
    console.error('Error finding/creating pool:', error)
    throw error
  }
}

// Helper function to parse location
const parseLocation = (locationString) => {
  // Simple location parsing - can be enhanced
  const parts = locationString.split(',').map(s => s.trim())
  
  if (parts.length >= 2) {
    return {
      address: locationString,
      area: parts[0],
      city: parts[1] || 'Mumbai'
    }
  }
  
  return {
    address: locationString,
    city: 'Mumbai',
    area: locationString
  }
}

// Process voice order
router.post('/process', upload.single('audio'), async (req, res) => {
  try {
    const { vendorPhone, location } = req.body
    const audioFile = req.file

    console.log('🎤 Voice processing request received')
    console.log('📝 Request body:', { vendorPhone, location })
    console.log('📁 Audio file info:', audioFile ? {
      filename: audioFile.filename,
      path: audioFile.path,
      size: audioFile.size,
      mimetype: audioFile.mimetype
    } : 'No file')

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      })
    }

    if (!vendorPhone) {
      return res.status(400).json({
        success: false,
        error: 'Vendor phone number is required'
      })
    }

    // Check if file exists before processing
    if (!fs.existsSync(audioFile.path)) {
      console.error('❌ Audio file does not exist at path:', audioFile.path)
      return res.status(500).json({
        success: false,
        error: `Audio file not found at path: ${audioFile.path}`
      })
    }

    console.log(`✅ Processing voice order for vendor: ${vendorPhone}`)
    console.log(`📁 Audio file exists at: ${audioFile.path}`)

    // Step 1: Convert speech to text using Whisper
    console.log('🔄 Starting OpenAI Whisper transcription...')
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.path),
      model: 'whisper-1',
      language: 'hi', // Hindi as primary, but Whisper auto-detects other languages
      response_format: 'verbose_json', // Get more detailed response
      temperature: 0.0 // More deterministic output
    })

    const transcript = transcription.text
    const confidence = transcription.segments ? 
      transcription.segments.reduce((acc, seg) => acc + seg.avg_logprob, 0) / transcription.segments.length : 0.8
    
    console.log(`Transcript: ${transcript}`)
    console.log(`Language detected: ${transcription.language || 'hindi'}`)
    console.log(`Confidence: ${confidence}`)

    // Step 2: Enhanced order parsing with our proven GPT-4 logic
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert assistant for Indian street vendors. Parse Hindi/English voice orders into structured data.

CONTEXT: This is for Mumbai street vendors ordering groceries/supplies from local suppliers.

INSTRUCTIONS:
1. Extract items, quantities, and units from the Hindi/English mixed speech
2. Convert Hindi items to English equivalents
3. Use reasonable defaults for unclear quantities
4. Include price estimates based on Mumbai market rates

COMMON ITEMS & PRICING (₹ per kg):
- आलू/Aloo/Potato: ₹30/kg
- प्याज/Pyaz/Onion: ₹40/kg  
- चावल/Chawal/Rice: ₹80/kg
- दाल/Dal/Lentils: ₹120/kg
- तेल/Tel/Oil: ₹150/liter
- आटा/Atta/Wheat flour: ₹60/kg
- चीनी/Cheeni/Sugar: ₹50/kg

Return JSON only:
{
  "items": [
    {
      "name": "potato",
      "hindi": "आलू",
      "quantity": 2,
      "unit": "kg", 
      "price_per_unit": 30,
      "total_price": 60,
      "supplier_id": "supp_001"
    }
  ],
  "total_amount": 60,
  "unavailable_items": [],
  "area": "mumbai",
  "confidence": 0.95
}`
        },
        {
          role: 'user',
          content: `Parse this vendor order: "${transcript}"`
        }
      ],
      temperature: 0.2 // Lower temperature for more consistent results
    })

    let orderData
    try {
      orderData = JSON.parse(completion.choices[0].message.content)
    } catch (parseError) {
      console.error('Error parsing GPT response:', parseError)
      // Enhanced fallback with our logic
      orderData = {
        items: [
          { 
            name: 'mixed_items', 
            hindi: transcript,
            quantity: 1, 
            unit: 'order',
            price_per_unit: 100,
            total_price: 100,
            supplier_id: 'supp_001'
          }
        ],
        total_amount: 100,
        confidence: 0.5,
        area: 'mumbai'
      }
    }

    // Step 3: Calculate estimated value and standardize item format
    const priceMap = {
      'rice': 80, 'chawal': 80, 'dal': 120, 'oil': 150, 'tel': 150,
      'onion': 40, 'pyaz': 40, 'potato': 30, 'aloo': 30,
      'tomato': 50, 'garlic': 200, 'ginger': 180, 'wheat': 60
    }

    let estimatedValue = 0
    
    // Standardize the item format and calculate pricing
    if (orderData.items) {
      orderData.items = orderData.items.map(item => {
        // Handle both 'name' and 'item' fields from different GPT responses
        const itemName = item.name || item.item || 'unknown'
        const quantity = parseFloat(item.quantity) || 1
        const unit = item.unit || 'kg'
        const hindi = item.hindi || itemName
        
        // Calculate price using our price map
        const pricePerUnit = item.price_per_unit || priceMap[itemName.toLowerCase()] || 50
        const totalPrice = quantity * pricePerUnit
        estimatedValue += totalPrice
        
        // Return standardized format
        return {
          item: itemName,           // Standardized field name
          name: itemName,           // Keep both for compatibility
          quantity: quantity,
          unit: unit,
          hindi: hindi,
          price_per_unit: pricePerUnit,
          total_price: totalPrice,
          supplier_id: item.supplier_id || 'supp_001'
        }
      })
    }

    // Use calculated value or fallback to GPT's estimate
    const finalEstimatedValue = estimatedValue || orderData.total_amount || 100

    // Step 4: Parse location
    const parsedLocation = parseLocation(location)

    // SPRINT VERSION: Skip order creation and pool logic - just return transcription
    console.log('🚀 SPRINT: Skipping database operations, returning transcription directly')
    
    // Step 5: Send response directly with transcription
    console.log('✅ Voice processing completed successfully')
    res.json({
      success: true,
      data: {
        orderId: `temp-${Date.now()}`, // Temporary ID for demo
        transcript,
        items: orderData.items,
        location: parsedLocation,
        confidence: Math.max(0, orderData.confidence || 0.8),
        estimatedValue: finalEstimatedValue,
        poolId: null, // No pool for sprint demo
        languageDetected: transcription.language || orderData.language_detected || 'hindi'
      }
    })

  } catch (error) {
    console.error('❌ Voice processing error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process voice order',
      details: error.message,
      stack: error.stack
    })
  } finally {
    // Cleanup: Remove uploaded file after processing
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path)
        console.log('🗑️ Cleaned up uploaded file:', req.file.path)
      } catch (cleanupError) {
        console.error('⚠️ Failed to cleanup uploaded file:', cleanupError.message)
      }
    }
  }
})

// Process text order (alternative to voice)
router.post('/process-text', async (req, res) => {
  try {
    const { text, vendorPhone, location } = req.body

    if (!text || !vendorPhone) {
      return res.status(400).json({
        success: false,
        error: 'Text and vendor phone are required'
      })
    }

    // Check if OpenAI is available
    if (!openai) {
      // Mock response for development
      const mockItems = [
        { item: 'rice', quantity: '5', unit: 'kg' },
        { item: 'dal', quantity: '2', unit: 'kg' }
      ]
      
      return res.json({
        success: true,
        data: {
          items: mockItems,
          confidence: 0.9,
          transcript: text
        }
      })
    }

    // Use GPT to parse text order
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Extract food/grocery items from vendor orders. Return JSON with items array.
          Each item should have: item, quantity, unit.
          
          Example: {"items": [{"item": "rice", "quantity": "5", "unit": "kg"}], "confidence": 0.9}`
        },
        {
          role: 'user',
          content: `Extract items from: "${text}"`
        }
      ],
      temperature: 0.3
    })

    let orderData
    try {
      orderData = JSON.parse(completion.choices[0].message.content)
    } catch (parseError) {
      // Simple fallback parsing
      const items = text.split(',').map(item => {
        const trimmed = item.trim()
        const match = trimmed.match(/(\d+)\s*(.+)/)
        if (match) {
          return { quantity: match[1], item: match[2], unit: 'kg' }
        }
        return { quantity: '1', item: trimmed, unit: 'kg' }
      })
      orderData = { items, confidence: 0.6 }
    }

    // Calculate estimated value
    const priceMap = {
      'rice': 80, 'dal': 120, 'oil': 150, 'wheat': 60, 'sugar': 45
    }

    let estimatedValue = 0
    orderData.items.forEach(item => {
      const quantity = parseFloat(item.quantity) || 1
      const price = priceMap[item.item.toLowerCase()] || 50
      estimatedValue += quantity * price
    })

    const parsedLocation = parseLocation(location)

    res.json({
      success: true,
      data: {
        items: orderData.items,
        location: parsedLocation,
        estimatedValue,
        confidence: orderData.confidence
      }
    })

  } catch (error) {
    console.error('Text processing error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process text order',
      details: error.message
    })
  }
})

// Health check for voice service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Voice Processing',
    openai: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  })
})

export default router
