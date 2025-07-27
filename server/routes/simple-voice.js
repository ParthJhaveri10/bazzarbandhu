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
    const orderCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert at parsing Indian grocery orders in Hindi and English. Parse the voice order into structured JSON format.

CRITICAL: Always respond with valid JSON only. No extra text.

Extract each item mentioned with:
- Exact quantity numbers (दो=2, चार=4, छह=6, दस=10, etc.)
- Units (किलो=kg, ग्राम=gram, पैकेट=packet, etc.)
- Item names in both Hindi and English
- Reasonable Indian market prices

Common Hindi numbers: एक=1, दो=2, तीन=3, चार=4, पांच=5, छह=6, सात=7, आठ=8, नौ=9, दस=10

Common vegetables & prices (₹/kg):
आलू/potato: 25-35, प्याज/onion: 30-50, टमाटर/tomato: 40-60, मिर्ची/chili: 80-120, गाजर/carrot: 40-60, पत्तागोभी/cabbage: 20-30, भिंडी/okra: 60-80, बैंगन/eggplant: 40-50, हरी मिर्ची/green chili: 100-150

Response format (JSON only):
{
  "items": [
    {"quantity": 2, "unit": "kg", "item": "potato", "hindi": "आलू", "price_per_unit": 30},
    {"quantity": 4, "unit": "kg", "item": "onion", "hindi": "प्याज", "price_per_unit": 40}
  ],
  "total": 220,
  "currency": "₹"
}`
        },
        {
          role: 'user',
          content: `Parse this Hindi order: "${transcript}"

Example: "मुझे दो किलो आलू, चार किलो प्याज चाहिए" should return:
{
  "items": [
    {"quantity": 2, "unit": "kg", "item": "potato", "hindi": "आलू", "price_per_unit": 30},
    {"quantity": 4, "unit": "kg", "item": "onion", "hindi": "प्याज", "price_per_unit": 40}
  ],
  "total": 220,
  "currency": "₹"
}`
        }
      ],
      temperature: 0.1
    })

    let orderData
    try {
      const gptResponse = orderCompletion.choices[0].message.content.trim()
      console.log('🤖 GPT Raw Response:', gptResponse)

      // Clean the response to extract JSON if wrapped in markdown or extra text
      let jsonString = gptResponse
      if (gptResponse.includes('```json')) {
        jsonString = gptResponse.split('```json')[1].split('```')[0].trim()
      } else if (gptResponse.includes('```')) {
        jsonString = gptResponse.split('```')[1].split('```')[0].trim()
      }

      orderData = JSON.parse(jsonString)
      console.log('✅ Parsed order successfully:', orderData)

      // Validate the parsed data
      if (!orderData.items || !Array.isArray(orderData.items)) {
        throw new Error('Invalid items array in response')
      }

    } catch (parseError) {
      console.log('❌ Failed to parse GPT response:', parseError.message)
      console.log('🔄 Raw GPT response was:', orderCompletion.choices[0].message.content)

      // Enhanced fallback - try to extract some info from the transcript
      const fallbackItems = []
      const transcript_lower = transcript.toLowerCase()

      // Look for common Hindi vegetables
      const vegetables = [
        { hindi: 'आलू', english: 'potato', price: 30 },
        { hindi: 'प्याज', english: 'onion', price: 40 },
        { hindi: 'टमाटर', english: 'tomato', price: 50 },
        { hindi: 'मिर्ची', english: 'chili', price: 100 },
        { hindi: 'गाजर', english: 'carrot', price: 45 }
      ]

      vegetables.forEach(veg => {
        if (transcript_lower.includes(veg.hindi)) {
          fallbackItems.push({
            quantity: 1,
            unit: 'kg',
            item: veg.english,
            hindi: veg.hindi,
            price_per_unit: veg.price
          })
        }
      })

      if (fallbackItems.length === 0) {
        fallbackItems.push({
          quantity: 1,
          unit: 'item',
          item: 'groceries',
          hindi: 'किराना',
          price_per_unit: 100
        })
      }

      orderData = {
        items: fallbackItems,
        total: fallbackItems.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0),
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

    // Step 3: Send enhanced response with parsed order
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
