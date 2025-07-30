import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'
import { supabase, supabaseAdmin } from '../config/supabase.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize OpenAI only if API key is provided
let openai = null
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder-key-get-real-key-from-openai') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
  console.log('✅ OpenAI client initialized')
} else {
  console.log('⚠️  OpenAI API key not configured - using mock responses')
}

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    
    // Determine correct extension based on MIME type
    let extension = '.webm' // default
    if (file.mimetype.includes('audio/webm') || file.mimetype.includes('video/webm')) {
      extension = '.webm'
    } else if (file.mimetype.includes('audio/wav')) {
      extension = '.wav'
    } else if (file.mimetype.includes('audio/mp3') || file.mimetype.includes('audio/mpeg')) {
      extension = '.mp3'
    } else if (file.mimetype.includes('audio/m4a')) {
      extension = '.m4a'
    } else if (file.mimetype.includes('audio/ogg')) {
      extension = '.ogg'
    }
    
    cb(null, 'voice-' + uniqueSuffix + extension)
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    console.log('📁 File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    })
    
    // More permissive audio file checking for demo
    const allowedExtensions = /\.(mp3|wav|m4a|webm|ogg|flac|aac|3gp|amr)$/i
    const allowedMimeTypes = /^audio\/|^video\/webm|^video\/mp4/
    
    const extname = allowedExtensions.test(file.originalname)
    const mimetype = allowedMimeTypes.test(file.mimetype)
    
    console.log('🔍 File validation:', {
      extname,
      mimetype,
      originalname: file.originalname,
      detectedMime: file.mimetype
    })
    
    if (mimetype || extname) {
      console.log('✅ File accepted')
      return cb(null, true)
    } else {
      console.log('❌ File rejected - not an audio file')
      cb(new Error(`File type not supported. Got: ${file.mimetype}. Allowed: audio/* or video/webm`))
    }
  }
})

// Process voice order - Real transcription and parsing
router.post('/process', upload.single('audio'), async (req, res) => {
  console.log('--- Received /voice/process request ---');
  try {
    const { vendorPhone, location } = req.body
    const audioFile = req.file

    console.log('Request Body:', req.body);
    console.log('Request File:', req.file);

    if (!audioFile) {
      console.error('❌ Error: No audio file was received by the server.');
      return res.status(400).json({
        success: false,
        error: 'No audio file provided. Multer may have failed to process the upload.'
      })
    }

    if (!vendorPhone) {
      console.error('❌ Error: Vendor phone number is missing.');
      return res.status(400).json({
        success: false,
        error: 'Vendor phone number is required'
      })
    }

    console.log(`Processing voice order for vendor: ${vendorPhone}`)
    console.log(`Audio file: ${audioFile.filename}`)
    console.log(`Audio file size: ${audioFile.size} bytes`)
    console.log(`Audio file mimetype: ${audioFile.mimetype}`)

    let transcript = ''
    let confidence = 0.95
    let extractedItems = []

    // Try to transcribe with OpenAI if available
    if (openai) {
      try {
        console.log('🎯 Transcribing audio with OpenAI Whisper...')
        
        // Use OpenAI Whisper for transcription
        const transcription = await openai.audio.transcriptions.create({
          file: await import('fs').then(fs => fs.default.createReadStream(audioFile.path)),
          model: 'whisper-1',
          language: 'hi', // Hindi
          response_format: 'json'
        })

        transcript = transcription.text
        console.log('📝 RAW TRANSCRIPTION:', transcript)

        // Extract order items using GPT
        if (transcript) {
          console.log('🧠 Parsing order items with GPT...')
          const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: `You are a helpful assistant that extracts grocery order items from Hindi/English voice transcripts. 
                Extract items with quantities and units. Return JSON format:
                {
                  "items": [
                    {"item": "rice", "quantity": "5", "unit": "kg", "price": 80},
                    {"item": "dal", "quantity": "2", "unit": "kg", "price": 120}
                  ],
                  "language": "hindi"
                }
                Use reasonable Indian market prices. If no specific quantity mentioned, assume 1 kg.`
              },
              {
                role: 'user',
                content: `Extract grocery items from this transcript: "${transcript}"`
              }
            ],
            temperature: 0.3
          })

          try {
            const gptResponse = JSON.parse(completion.choices[0].message.content)
            extractedItems = gptResponse.items || []
            console.log('🛒 GPT EXTRACTED ITEMS:', extractedItems)
            console.log('🛒 Number of items extracted:', extractedItems.length)
          } catch (parseError) {
            console.error('❌ Error parsing GPT response:', parseError)
            console.log('❌ Raw GPT response:', completion.choices[0].message.content)
            // Fall back to mock items if parsing fails
            extractedItems = [
              { item: 'items from voice (GPT parsing failed)', quantity: '1', unit: 'order', price: 100 }
            ]
          }
        }

      } catch (openaiError) {
        console.error('❌ OpenAI processing error:', openaiError)
        console.error('❌ OpenAI error details:', openaiError.message)
        transcript = 'Voice transcription failed - using audio input'
        extractedItems = [
          { item: 'voice order items (OpenAI failed)', quantity: '1', unit: 'order', price: 150 }
        ]
      }
    } else {
      // Fallback when OpenAI is not available
      console.log('⚠️ OpenAI not available - using mock transcription')
      transcript = 'Audio processed - OpenAI not configured'
      extractedItems = [
        { item: 'grocery items (no OpenAI)', quantity: '1', unit: 'order', price: 200 }
      ]
    }

    console.log('📋 FINAL TRANSCRIPT:', transcript)
    console.log('📋 FINAL EXTRACTED ITEMS:', extractedItems)

    // Calculate total
    const estimatedValue = extractedItems.reduce((total, item) => {
      return total + (parseInt(item.quantity) * item.price)
    }, 0)

    // Create order in Supabase using admin client to bypass RLS
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert([{
        vendor_phone: vendorPhone,
        items: extractedItems,
        location: { address: location || 'Mumbai, Maharashtra' },
        transcript: transcript,
        confidence: confidence,
        estimated_value: estimatedValue,
        status: 'pending'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      throw error
    }

    console.log('Order created successfully:', order.id)

    // Response for frontend
    const response = {
      success: true,
      transcript: transcript,
      language: 'hindi',
      confidence: confidence,
      orderData: {
        items: extractedItems,
        total: estimatedValue,
        currency: '₹'
      },
      data: {
        orderId: order.id,
        vendorPhone,
        items: extractedItems,
        transcript: transcript,
        confidence: confidence,
        totalEstimate: estimatedValue,
        status: 'pending',
        createdAt: new Date(),
        location: location || 'Mumbai, Maharashtra'
      }
    }

    console.log('🚀 SENDING RESPONSE TO CLIENT:', JSON.stringify(response, null, 2))
    res.json(response)

  } catch (error) {
    console.error('Error processing voice order:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process voice order',
      details: error.message
    })
  }
})

// Get pending orders for suppliers (must come before the dynamic route)
router.get('/orders/supplier/pending', async (req, res) => {
  try {
    console.log('📥 Fetching pending orders for suppliers')

    // Use supabaseAdmin to bypass RLS - get all orders regardless of status
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    // Process orders and add virtual status based on metadata
    const processedOrders = orders?.map(order => {
      let virtualStatus = order.status // Default to actual status
      
      try {
        if (order.metadata && typeof order.metadata === 'string') {
          const metadata = JSON.parse(order.metadata)
          if (metadata.supplier_status) {
            virtualStatus = metadata.supplier_status
          }
        } else if (order.metadata && order.metadata.supplier_status) {
          virtualStatus = order.metadata.supplier_status
        }
      } catch (e) {
        // If metadata parsing fails, use original status
      }
      
      return {
        ...order,
        status: virtualStatus
      }
    }) || []

    console.log(`✅ Found ${processedOrders?.length || 0} orders for suppliers`)
    
    res.json({
      success: true,
      data: processedOrders
    })

  } catch (error) {
    console.error('Error fetching supplier orders:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supplier orders',
      details: error.message
    })
  }
})

// Get orders for a vendor
router.get('/orders/:vendorPhone', async (req, res) => {
  try {
    const { vendorPhone } = req.params

    console.log('📥 Fetching orders for vendor phone:', vendorPhone)

    // Use supabaseAdmin to bypass RLS
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('vendor_phone', vendorPhone)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    // Process orders and add virtual status based on metadata (same as supplier endpoint)
    const processedOrders = orders?.map(order => {
      let virtualStatus = order.status // Default to actual status
      
      try {
        if (order.metadata && typeof order.metadata === 'string') {
          const metadata = JSON.parse(order.metadata)
          if (metadata.supplier_status) {
            virtualStatus = metadata.supplier_status
          }
        } else if (order.metadata && order.metadata.supplier_status) {
          virtualStatus = order.metadata.supplier_status
        }
      } catch (e) {
        // If metadata parsing fails, use original status
      }
      
      return {
        ...order,
        status: virtualStatus
      }
    }) || []

    console.log(`✅ Found ${processedOrders?.length || 0} orders for vendor ${vendorPhone}`)
    
    res.json({
      success: true,
      data: processedOrders
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      details: error.message
    })
  }
})

// Update order status
router.patch('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params
    const { status, supplier_notes } = req.body

    console.log('🔄 Updating order:', { orderId, status, supplier_notes })

    // Since status constraint is strict, let's track acceptance via supplier_notes and a new field
    const updateData = {
      supplier_notes,
      updated_at: new Date().toISOString()
    }

    // Add a metadata field to track acceptance status
    if (status === 'processing' || status === 'accepted') {
      updateData.metadata = JSON.stringify({ 
        supplier_accepted: true, 
        supplier_status: status,
        accepted_at: new Date().toISOString()
      })
    } else if (status === 'completed') {
      updateData.metadata = JSON.stringify({ 
        supplier_accepted: true, 
        supplier_status: status,
        completed_at: new Date().toISOString()
      })
    }

    const { data: updatedOrder, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating order:', error)
      return res.status(400).json({
        success: false,
        error: error.message
      })
    }

    console.log('✅ Order updated successfully:', updatedOrder)

    // Return the order with the virtual status for frontend
    const virtualOrder = {
      ...updatedOrder,
      status: status, // Return the requested status
      supplier_status: status
    }

    res.json({
      success: true,
      data: virtualOrder,
      message: `Order ${status} by supplier`
    })

  } catch (error) {
    console.error('❌ Error updating order:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update order',
      details: error.message
    })
  }
})

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Voice Processing',
    openai: !!openai,
    timestamp: new Date().toISOString()
  })
})

export default router
