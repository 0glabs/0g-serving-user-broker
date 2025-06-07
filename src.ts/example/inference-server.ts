import express from 'express'
import { ethers } from 'ethers'
import { createZGComputeNetworkBroker } from '../sdk'
import { ZG_RPC_ENDPOINT_TESTNET } from '../cli/const'
import { Cache, CacheValueTypeEnum } from '../sdk/common/storage/cache'

export interface InferenceServerOptions {
    provider: string
    key?: string
    rpc?: string
    ledgerCa?: string
    inferenceCa?: string
    gasPrice?: string | number
    port?: string | number
    host?: string
}

export async function runInferenceServer(options: InferenceServerOptions) {
    const app = express()
    app.use(express.json())
    const cache = new Cache()

    let broker: any
    let providerAddress: string
    let endpoint: string
    let model: string

    async function initBroker() {
        const provider = new ethers.JsonRpcProvider(
            options.rpc || process.env.RPC_ENDPOINT || ZG_RPC_ENDPOINT_TESTNET
        )
        const privateKey = options.key || process.env.ZG_PRIVATE_KEY
        if (!privateKey) {
            throw new Error(
                'Missing wallet private key, please provide --key or set ZG_PRIVATE_KEY in environment variables'
            )
        }
        console.log('Initializing broker...')
        broker = await createZGComputeNetworkBroker(
            new ethers.Wallet(privateKey, provider),
            options.ledgerCa,
            options.inferenceCa,
            undefined,
            options.gasPrice ? Number(options.gasPrice) : undefined
        )
        providerAddress = options.provider
        await broker.inference.acknowledgeProviderSigner(providerAddress)
        const meta = await broker.inference.getServiceMetadata(providerAddress)
        endpoint = meta.endpoint
        model = meta.model
    }

    async function chatProxy(body: any, stream: boolean = false) {
        const headers = await broker.inference.getRequestHeaders(
            providerAddress,
            Array.isArray(body.messages) && body.messages.length > 0
                ? body.messages.map((m: any) => m.content).join('\n')
                : ''
        )
        body.model = model
        if (stream) {
            body.stream = true
        }
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(body),
        })
        return response
    }

    app.post(
        '/v1/chat/completions',
        async (req: any, res: any): Promise<void> => {
            const body = req.body
            const stream = body.stream === true
            if (!Array.isArray(body.messages) || body.messages.length === 0) {
                res.status(400).json({
                    error: 'Missing or invalid messages in request body',
                })
                return
            }
            try {
                const result = await chatProxy(body, stream)
                if (stream) {
                    res.setHeader('Content-Type', 'text/event-stream')
                    res.setHeader('Cache-Control', 'no-cache')
                    res.setHeader('Connection', 'keep-alive')
                    if (result.body) {
                        let rawBody = ''
                        const decoder = new TextDecoder()
                        const reader = result.body.getReader()
                        while (true) {
                            const { done, value } = await reader.read()
                            if (done) break
                            res.write(value)
                            rawBody += decoder.decode(value, {
                                stream: true,
                            })
                        }
                        res.end()
                        // Parse rawBody and cache it after the stream ends
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
                                const receivedContent =
                                    message.choices?.[0]?.delta?.content
                                if (receivedContent) {
                                    completeContent += receivedContent
                                }
                            } catch (e) {}
                        }
                        // Cache the complete content
                        if (id) {
                            cache.setItem(
                                id,
                                completeContent,
                                1 * 10 * 1000,
                                CacheValueTypeEnum.Other
                            )
                        }
                    } else {
                        res.status(500).json({
                            error: 'No stream body from remote server',
                        })
                    }
                } else {
                    const data = await result.json()
                    const key = data.id
                    const value = data.choices?.[0]?.message?.content
                    cache.setItem(
                        key,
                        value,
                        5 * 60 * 1000,
                        CacheValueTypeEnum.Other
                    )
                    res.json(data)
                }
            } catch (err: any) {
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
        const completeContent = cache.getItem(id)
        if (!completeContent) {
            res.status(404).json({ error: 'No cached content for this id' })
            return
        }
        try {
            const isValid = await broker.inference.processResponse(
                providerAddress,
                completeContent,
                id
            )
            res.json({ isValid })
        } catch (err: any) {
            res.status(500).json({ error: err.message })
        }
    })

    await initBroker()

    const port = options.port ? Number(options.port) : 3000
    const host = options.host || '0.0.0.0'

    app.listen(port, host, async () => {
        try {
            const fetch = (await import('node-fetch')).default
            const res = await fetch(
                `http://${host}:${port}/v1/chat/completions`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: [{ role: 'system', content: 'health check' }],
                    }),
                }
            )
            if (res.ok) {
                console.log(
                    `Health check passed\nInference service is running on ${host}:${port}`
                )
            } else {
                const errText = await res.text()
                console.error('Health check failed:', res.status, errText)
            }
        } catch (e) {
            console.error('Health check error:', e)
        }
    })
}
