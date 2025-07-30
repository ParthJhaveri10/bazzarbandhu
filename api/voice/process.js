const { setCorsHeaders } = require('../_lib/supabase')

export default async function handler(req, res) {
  // Handle CORS
  setCorsHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // For now, return a mock response since we don't have OpenAI integration yet
    // In the future, this would process the audio with OpenAI Whisper and extract order details
    
    const mockOrderResponse = {
      success: true,
      message: 'Order processed successfully',
      data: {
        transcription: 'I need 2 kg onions, 1 kg tomatoes, and 500g potatoes',
        extractedOrder: {
          items: [
            { name: 'Onions', quantity: '2 kg', price: 60 },
            { name: 'Tomatoes', quantity: '1 kg', price: 40 },
            { name: 'Potatoes', quantity: '500g', price: 25 }
          ],
          total: 125,
          customerInfo: {
            phone: '9876543210',
            address: 'Sample Address'
          }
        },
        orderId: `ORDER_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return res.status(200).json(mockOrderResponse)

  } catch (error) {
    console.error('Voice processing error:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Error processing voice order' 
    })
  }
}
