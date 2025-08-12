#!/usr/bin/env node

import { runMultiProviderInferenceServer } from './multi-provider-inference-server'

async function main() {
    const providers = [
        "0x1234567890123456789012345678901234567890", // 替换为实际的 provider 地址
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", // 替换为实际的 provider 地址
        "0x9876543210987654321098765432109876543210"  // 替换为实际的 provider 地址
    ]

    const options = {
        providers,
        strategy: 'round-robin' as const,
        port: 3001,
        host: '0.0.0.0',
        healthCheckInterval: 30000, // 30 seconds
        maxRetries: 3,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        // key: 'your-private-key', // 或使用环境变量 ZG_PRIVATE_KEY
        // rpc: 'your-rpc-endpoint', // 或使用环境变量 RPC_ENDPOINT
    }

    try {
        console.log('🚀 Starting multi-provider inference server...')
        console.log('📋 Configuration:')
        console.log(`   Providers: ${providers.length}`)
        console.log(`   Strategy: ${options.strategy}`)
        console.log(`   Port: ${options.port}`)
        console.log(`   Health check interval: ${options.healthCheckInterval}ms`)
        console.log('')

        await runMultiProviderInferenceServer(options)
    } catch (error) {
        console.error('❌ Failed to start server:', error)
        process.exit(1)
    }
}

if (require.main === module) {
    main().catch(console.error)
}