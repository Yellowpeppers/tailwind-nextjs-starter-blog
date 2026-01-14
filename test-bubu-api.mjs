// Test script for BuBu API
// Run with: node test-bubu-api.mjs

const API_URL = 'http://localhost:3000/api/bubu/chat'

async function testBuBuAPI() {
    console.log('🧪 Testing BuBu API...\n')

    // Test 1: Chat only
    console.log('Test 1: Chat only (emotional support)')
    try {
        const response1 = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: '我好累啊',
                personality: 'gentle',
                language: 'zh',
            }),
        })
        const data1 = await response1.json()
        console.log('✅ Response:', data1)
        console.log('')
    } catch (error) {
        console.error('❌ Test 1 failed:', error)
    }

    // Test 2: Add tasks
    console.log('Test 2: Add tasks')
    try {
        const response2 = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: '今天要写报告、开会、健身',
                personality: 'energetic',
                language: 'zh',
            }),
        })
        const data2 = await response2.json()
        console.log('✅ Response:', data2)
        console.log('')
    } catch (error) {
        console.error('❌ Test 2 failed:', error)
    }

    // Test 3: Add idea
    console.log('Test 3: Add idea')
    try {
        const response3 = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: '我想做一个关于时间管理的视频',
                personality: 'professional',
                language: 'zh',
            }),
        })
        const data3 = await response3.json()
        console.log('✅ Response:', data3)
        console.log('')
    } catch (error) {
        console.error('❌ Test 3 failed:', error)
    }

    // Test 4: With conversation history
    console.log('Test 4: With conversation history')
    try {
        const response4 = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: '把第一个改成写PPT',
                history: [
                    { role: 'user', content: '今天要写报告、开会' },
                    { role: 'assistant', content: '好的！帮你整理了2个任务~' },
                ],
                personality: 'gentle',
                language: 'zh',
            }),
        })
        const data4 = await response4.json()
        console.log('✅ Response:', data4)
        console.log('')
    } catch (error) {
        console.error('❌ Test 4 failed:', error)
    }

    console.log('✅ All tests completed!')
}

testBuBuAPI()
