import OpenAI from 'openai'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

console.log('🔧 Testing OpenAI Integration...')

// Test OpenAI connection
const testOpenAI = async () => {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-placeholder-key-get-real-key-from-openai') {
      throw new Error('OpenAI API key not configured')
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    console.log('✅ OpenAI API key found')
    console.log(`🔑 Key starts with: ${process.env.OPENAI_API_KEY.substring(0, 10)}...`)

    // Test a simple API call
    console.log('🧪 Testing OpenAI API connection...')
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Respond with "OpenAI connection successful" if you can read this.'
        }
      ],
      max_tokens: 50
    })

    console.log('✅ OpenAI API Response:', completion.choices[0].message.content)
    console.log('🎉 OpenAI integration is working perfectly!')
    
    return true
  } catch (error) {
    console.error('❌ OpenAI integration failed:', error.message)
    return false
  }
}

testOpenAI().then(success => {
  if (success) {
    console.log('\n🚀 Ready to process voice orders with Whisper!')
    console.log('👉 Start the server with: npm start')
  } else {
    console.log('\n⚠️  Please check your OpenAI API key configuration')
  }
  process.exit(success ? 0 : 1)
})
