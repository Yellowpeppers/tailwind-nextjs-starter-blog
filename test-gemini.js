/* eslint-disable */
const { GoogleGenerativeAI } = require('@google/generative-ai')
const { ProxyAgent, setGlobalDispatcher } = require('undici')
require('dotenv').config({ path: '.env' })

async function testGemini() {
  const apiKey = process.env.GOOGLE_API_KEY

  console.log('--- Gemini API Test ---')

  if (!apiKey) {
    console.error('❌ Error: GOOGLE_API_KEY not found in .env')
    return
  }

  // Mask key for safety in logs
  const maskedKey =
    apiKey.length > 8
      ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
      : 'Invalid Key Length'
  console.log(`🔑 API Key found: ${maskedKey}`)

  if (apiKey === 'your_api_key_here') {
    console.error('❌ Error: You are still using the placeholder key "your_api_key_here".')
    console.error('👉 Please open .env and paste your actual Google API Key.')
    return
  }

  // Configure proxy if needed (matching the app's logic)
  const proxyUrl = process.env.HTTP_PROXY || 'http://127.0.0.1:7890'
  if (proxyUrl) {
    try {
      const dispatcher = new ProxyAgent(proxyUrl)
      setGlobalDispatcher(dispatcher)
      console.log(`🌐 Proxy configured: ${proxyUrl}`)
    } catch (error) {
      console.warn('⚠️ Failed to configure proxy:', error.message)
    }
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  try {
    console.log('📡 Sending test request to Gemini...')
    const result = await model.generateContent('Say "Hello, World!" if you can hear me.')
    const response = await result.response
    const text = response.text()

    console.log('✅ Success! Gemini replied:')
    console.log(`   "${text.trim()}"`)
    console.log('-----------------------')
    console.log('🎉 Your API Key is working correctly.')
  } catch (error) {
    console.error('❌ API Request Failed:')
    console.error(error.message)
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('👉 The key you provided is invalid. Please check for typos.')
    }
  }
}

testGemini()
