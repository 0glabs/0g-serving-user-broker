import express from 'express'
import { ethers } from 'ethers'
import { createServer } from 'http'
import { ZG_RPC_ENDPOINT_TESTNET } from '../cli/const'
import { Cache, CacheValueTypeEnum } from '../sdk/common/storage/cache'
import { ProviderLoadBalancer, type LoadBalancerOptions, type CacheEntry } from '../sdk/load-balancer'

export interface MultiProviderInferenceServerOptions {
    providers: string[]
    strategy?: 'round-robin' | 'least-connections' | 'weighted-round-robin'
    key?: string
    rpc?: string
    ledgerCa?: string
    inferenceCa?: string
    gasPrice?: string | number
    port?: string | number
    host?: string
    healthCheckInterval?: number
    maxRetries?: number
    sessionTimeout?: number
}

export async function runMultiProviderInferenceServer(options: MultiProviderInferenceServerOptions) {
    const app = express()
    app.use(express.json())
    
    const cache = new Cache()
    let loadBalancer: ProviderLoadBalancer

    const loadBalancerOptions: LoadBalancerOptions = {
        providers: options.providers,
        strategy: options.strategy || 'round-robin',
        healthCheckInterval: options.healthCheckInterval || 30000,
        maxRetries: options.maxRetries || 3,
        sessionTimeout: options.sessionTimeout || 30 * 60 * 1000 // 30 minutes
    }

    async function initLoadBalancer() {
        const provider = new ethers.JsonRpcProvider(
            options.rpc || process.env.RPC_ENDPOINT || ZG_RPC_ENDPOINT_TESTNET
        )
        const privateKey = options.key || process.env.ZG_PRIVATE_KEY
        if (!privateKey) {
            throw new Error(
                'Missing wallet private key, please provide --key or set ZG_PRIVATE_KEY in environment variables'
            )
        }
        
        console.log('Initializing multi-provider load balancer...')
        loadBalancer = new ProviderLoadBalancer(
            new ethers.Wallet(privateKey, provider),
            loadBalancerOptions,
            options.ledgerCa,
            options.inferenceCa,
            undefined,
            options.gasPrice ? Number(options.gasPrice) : undefined
        )
        
        await loadBalancer.initialize()
        console.log('Load balancer initialized successfully')
    }

    async function chatProxy(body: any, stream: boolean = false, sessionId?: string) {
        const content = Array.isArray(body.messages) && body.messages.length > 0
            ? body.messages.map((m: any) => m.content).join('\n')
            : ''

        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        return await loadBalancer.retryWithDifferentProvider(async (provider) => {
            const headers = await provider.broker.inference.getRequestHeaders(
                provider.address,
                content
            )
            
            body.model = provider.model
            if (stream) {
                body.stream = true
            }

            const response = await fetch(`${provider.endpoint}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                throw new Error(`Provider ${provider.address} returned status ${response.status}`)
            }

            return { response, provider, requestId }
        }, new Set(), requestId)
    }

    app.post(
        '/v1/chat/completions',
        async (req: any, res: any): Promise<void> => {
            const body = req.body
            const stream = body.stream === true
            const sessionId = req.headers['x-session-id'] as string

            if (!Array.isArray(body.messages) || body.messages.length === 0) {
                res.status(400).json({
                    error: 'Missing or invalid messages in request body',
                })
                return
            }

            try {
                const { response, provider, requestId } = await chatProxy(body, stream, sessionId)
                
                if (stream) {
                    res.setHeader('Content-Type', 'text/event-stream')
                    res.setHeader('Cache-Control', 'no-cache')
                    res.setHeader('Connection', 'keep-alive')
                    res.setHeader('X-Provider-Address', provider.address)
                    
                    if (response.body) {
                        let rawBody = ''
                        const decoder = new TextDecoder()
                        const reader = response.body.getReader()
                        
                        while (true) {
                            const { done, value } = await reader.read()
                            if (done) break
                            res.write(value)
                            rawBody += decoder.decode(value, { stream: true })
                        }
                        
                        res.end()
                        
                        let completeContent = ''
                        let id: string | undefined
                        for (const line of rawBody.split('\n')) {
                            const trimmed = line.trim()
                            if (!trimmed) continue
                            const jsonStr = trimmed.startsWith('data:')
                                ? trimmed.slice(5).trim()
                                : trimmed
                            if (jsonStr === '[DONE]') continue
                            try {
                                const message = JSON.parse(jsonStr)
                                if (!id && message.id) id = message.id
                                const receivedContent = message.choices?.[0]?.delta?.content
                                if (receivedContent) {
                                    completeContent += receivedContent
                                }
                            } catch (e) {}
                        }
                        
                        if (id) {
                            const cacheEntry: CacheEntry = {
                                content: completeContent,
                                providerAddress: provider.address,
                                sessionId: requestId,
                                timestamp: Date.now()
                            }
                            cache.setItem(
                                id,
                                JSON.stringify(cacheEntry),
                                10 * 60 * 1000, // 10 minutes
                                CacheValueTypeEnum.Other
                            )
                        }
                    } else {
                        res.status(500).json({
                            error: 'No stream body from remote server',
                        })
                    }
                } else {
                    const data = await response.json()
                    const responseId = data.id
                    const content = data.choices?.[0]?.message?.content
                    
                    res.setHeader('X-Provider-Address', provider.address)
                    
                    if (responseId) {
                        const cacheEntry: CacheEntry = {
                            content,
                            providerAddress: provider.address,
                            sessionId: requestId,
                            timestamp: Date.now()
                        }
                        cache.setItem(
                            responseId,
                            JSON.stringify(cacheEntry),
                            5 * 60 * 1000, // 5 minutes
                            CacheValueTypeEnum.Other
                        )
                    }
                    
                    res.json(data)
                }
                
                loadBalancer.releaseProvider(requestId)
            } catch (err: any) {
                console.error('Chat completion error:', err)
                res.status(500).json({ error: err.message })
            }
        }
    )

    app.post('/v1/verify', async (req: any, res: any): Promise<void> => {
        const { id } = req.body
        if (!id) {
            res.status(400).json({ error: 'Missing id in request body' })
            return
        }

        try {
            const cachedData = cache.getItem(id)
            if (!cachedData) {
                res.status(404).json({ error: 'No cached content for this id' })
                return
            }

            const cacheEntry: CacheEntry = JSON.parse(cachedData)
            const provider = loadBalancer.getAllProviders().find(p => p.address === cacheEntry.providerAddress)
            
            if (!provider || !provider.broker) {
                res.status(500).json({ error: 'Provider not found or not initialized' })
                return
            }

            const isValid = await provider.broker.inference.processResponse(
                cacheEntry.providerAddress,
                cacheEntry.content,
                id
            )
            
            res.json({ isValid })
        } catch (err: any) {
            console.error('Verify error:', err)
            res.status(500).json({ error: err.message })
        }
    })

    // Health check endpoint
    app.get('/health', async (req: any, res: any): Promise<void> => {
        try {
            const stats = loadBalancer.getProviderStats()
            res.json({
                status: 'healthy',
                loadBalancer: stats
            })
        } catch (err: any) {
            res.status(500).json({
                status: 'unhealthy',
                error: err.message
            })
        }
    })

    // Admin endpoints
    app.get('/admin/providers', async (req: any, res: any): Promise<void> => {
        const stats = loadBalancer.getProviderStats()
        res.json(stats)
    })

    const port = options.port ? Number(options.port) : 3000
    const host = options.host || '0.0.0.0'

    const checkPort = async (port: number, host: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const testServer = createServer()
            testServer.listen(port, host, () => {
                testServer.close(() => resolve(true))
            })
            testServer.on('error', (err: any) => {
                resolve(err.code !== 'EADDRINUSE')
            })
        })
    }

    const isPortAvailable = await checkPort(port, host)
    if (!isPortAvailable) {
        console.error(`\nError: Port ${port} is already in use.`)
        console.error(`Please try one of the following:`)
        console.error(`  1. Use a different port: --port <PORT>`)
        console.error(`  2. Stop the process using port ${port}`)
        console.error(`  3. Find the process: lsof -i :${port} or ss -tlnp | grep :${port}\n`)
        process.exit(1)
    }

    await initLoadBalancer()

    const server = app.listen(port, host, () => {
        console.log(`\n🚀 Multi-provider inference server is running on ${host}:${port}`)
        console.log(`📊 Load balancing strategy: ${loadBalancerOptions.strategy}`)
        console.log(`🔧 Providers configured: ${options.providers.length}`)
        console.log(`💚 Healthy providers: ${loadBalancer.getHealthyProviders().length}`)
    })

    server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\nError: Port ${port} is already in use.`)
            console.error(`Please try one of the following:`)
            console.error(`  1. Use a different port: --port <PORT>`)
            console.error(`  2. Stop the process using port ${port}`)
            console.error(`  3. Find the process: lsof -i :${port} or netstat -tulpn | grep :${port}\n`)
            process.exit(1)
        } else {
            console.error('Server error:', err)
            process.exit(1)
        }
    })

    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...')
        loadBalancer.destroy()
        server.close(() => {
            console.log('Server shut down gracefully')
            process.exit(0)
        })
    })

    process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down server...')
        loadBalancer.destroy()
        server.close(() => {
            console.log('Server shut down gracefully')
            process.exit(0)
        })
    })
}