import express from 'express'
import multer from 'multer'
import OpenAI from 'openai'
import fs from 'fs'

const router = express.Router()

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Simple Voice Processing',
    timestamp: new Date().toISOString()
  })
})

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

// Simple voice processing endpoint
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  console.log('🎤 Simple voice processing request received')

  // Configure OpenAI (moved inside route to ensure env vars are loaded)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      })
    }

    console.log('📁 Audio file:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    })

    // Step 1: Transcribe with OpenAI Whisper
    console.log('🔄 Starting OpenAI Whisper transcription...')

    // Create a new filename with .wav extension to help OpenAI recognize it
    const wavFilePath = req.file.path + '.wav'
    fs.copyFileSync(req.file.path, wavFilePath)

    console.log('📝 Created .wav copy at:', wavFilePath)

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(wavFilePath),
      model: 'whisper-1',
      response_format: 'verbose_json', // Get more detailed response
      temperature: 0.0 // More deterministic output
    })

    const transcript = transcription.text
    const language = transcription.language || 'hindi'
    const confidence = transcription.segments ?
      transcription.segments.reduce((acc, seg) => acc + seg.avg_logprob, 0) / transcription.segments.length : 0.8

    console.log(`✅ Transcript: ${transcript}`)
    console.log(`✅ Language detected: ${language}`)
    console.log(`✅ Confidence: ${confidence}`)

    // Step 2: Parse the order using GPT-4
    console.log('🧠 Parsing order with GPT-4...')
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert at parsing Indian grocery orders. Parse the Hindi/English voice order into structured JSON format.

Extract:
- Items with quantities, units, and Hindi/English names
- Estimate reasonable market prices for vegetables/groceries

Response format:
{
  "items": [
    {"quantity": 2, "unit": "kg", "item": "potato", "hindi": "आलू", "price_per_unit": 30}
  ],
  "total": 60,
  "currency": "₹"
}

Common items and prices (₹/kg):
आलू/potato: 30, प्याज/onion: 40, टमाटर/tomato: 50, चावल/rice: 80, दाल/lentils: 120, हल्दी/turmeric: 200`
        },
        {
          role: 'user',
          content: `Parse this order: "${transcript}"`
        }
      ],
      temperature: 0.2
    })

    let orderData
    try {
      orderData = JSON.parse(completion.choices[0].message.content)
      console.log('✅ Parsed order:', orderData)
    } catch (parseError) {
      console.log('❌ Failed to parse GPT response, using fallback')
      orderData = {
        items: [
          {
            quantity: 1,
            unit: 'item',
            item: 'miscellaneous',
            hindi: 'विविध',
            price_per_unit: 50
          }
        ],
        total: 50,
        currency: '₹'
      }
    }

    // Clean up files
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
      console.log('🗑️ Cleaned up original file:', req.file.path)
    }
    if (fs.existsSync(wavFilePath)) {
      fs.unlinkSync(wavFilePath)
      console.log('🗑️ Cleaned up wav file:', wavFilePath)
    }

    // Send enhanced response with parsed order
    console.log('✅ Sending response')
    res.json({
      success: true,
      transcript,
      language,
      confidence,
      orderData
    })

  } catch (error) {
    console.error('❌ Simple voice processing error:', error)

    // Clean up files on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    const wavFilePath = req.file ? req.file.path + '.wav' : null
    if (wavFilePath && fs.existsSync(wavFilePath)) {
      fs.unlinkSync(wavFilePath)
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process voice order',
      details: error.message
    })
  }
})

export default router
