#!/usr/bin/env node

/**
 * 测试多 provider 负载均衡功能
 * 
 * 这个脚本演示如何测试负载均衡器，包括：
 * 1. 发送多个并发请求
 * 2. 验证请求分发到不同的 provider
 * 3. 测试 verify 功能确保使用相同的 provider
 */

async function testLoadBalancer() {
    const serverUrl = 'http://localhost:3001'
    
    console.log('🧪 Testing multi-provider load balancer...')
    
    // 测试消息
    const testMessages = [
        'Hello, how are you?',
        'What is the weather like today?',
        'Tell me a joke',
        'Explain quantum physics briefly',
        'What are the benefits of exercise?'
    ]
    
    const results: Array<{
        requestId: number
        provider: string
        responseId: string
        content: string
    }> = []
    
    try {
        // 1. 发送多个并发请求
        console.log('📤 Sending concurrent requests...')
        const promises = testMessages.map(async (message, index) => {
            const response = await fetch(`${serverUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'user', content: message }
                    ],
                    max_tokens: 100
                })
            })
            
            if (!response.ok) {
                throw new Error(`Request ${index} failed: ${response.status}`)
            }
            
            const data = await response.json()
            const provider = response.headers.get('X-Provider-Address') || 'unknown'
            
            results.push({
                requestId: index,
                provider,
                responseId: data.id,
                content: data.choices[0].message.content
            })
            
            console.log(`✅ Request ${index} completed (Provider: ${provider.slice(0, 10)}...)`)
        })
        
        await Promise.all(promises)
        
        // 2. 分析负载分发情况
        console.log('\n📊 Load balancing results:')
        const providerCounts = results.reduce((acc, result) => {
            acc[result.provider] = (acc[result.provider] || 0) + 1
            return acc
        }, {} as Record<string, number>)
        
        Object.entries(providerCounts).forEach(([provider, count]) => {
            console.log(`   ${provider.slice(0, 10)}...: ${count} requests`)
        })
        
        // 3. 测试 verify 功能
        console.log('\n🔍 Testing verify functionality...')
        const verifyPromises = results.map(async (result) => {
            const verifyResponse = await fetch(`${serverUrl}/v1/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: result.responseId
                })
            })
            
            if (!verifyResponse.ok) {
                throw new Error(`Verify failed for response ${result.responseId}: ${verifyResponse.status}`)
            }
            
            const verifyData = await verifyResponse.json()
            console.log(`✅ Verify ${result.requestId}: ${verifyData.isValid ? 'VALID' : 'INVALID'}`)
            
            return {
                requestId: result.requestId,
                responseId: result.responseId,
                isValid: verifyData.isValid,
                provider: result.provider
            }
        })
        
        const verifyResults = await Promise.all(verifyPromises)
        
        // 4. 汇总测试结果
        console.log('\n📈 Test Summary:')
        console.log(`   Total requests: ${results.length}`)
        console.log(`   Unique providers used: ${Object.keys(providerCounts).length}`)
        console.log(`   Successful verifications: ${verifyResults.filter(r => r.isValid).length}`)
        console.log(`   Failed verifications: ${verifyResults.filter(r => !r.isValid).length}`)
        
        // 5. 测试健康检查端点
        console.log('\n🏥 Testing health check...')
        const healthResponse = await fetch(`${serverUrl}/health`)
        if (healthResponse.ok) {
            const healthData = await healthResponse.json()
            console.log('✅ Health check passed')
            console.log(`   Status: ${healthData.status}`)
            console.log(`   Healthy providers: ${healthData.loadBalancer.healthyProviders}/${healthData.loadBalancer.totalProviders}`)
        } else {
            console.log('❌ Health check failed')
        }
        
        console.log('\n🎉 Load balancer test completed successfully!')
        
    } catch (error) {
        console.error('❌ Test failed:', error)
        process.exit(1)
    }
}

// 运行测试
if (require.main === module) {
    testLoadBalancer().catch(console.error)
}

export { testLoadBalancer }