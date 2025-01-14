import {ethers} from 'ethers'
import {createZGComputeNetworkBroker} from './src.ts'
import OpenAI from 'openai'

async function main() {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')

    // Step 1: Create a wallet with a private key
    const privateKey =
        '59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
    const wallet = new ethers.Wallet(privateKey, provider)

    // Step 2: Initialize the broker
    try {
        const broker = await createZGComputeNetworkBroker(
            wallet,
            '',
            '0x0165878A594ca255338adfa4d48449f69242Eb8F',
            ''
        )

        // List available services
        console.log('Listing available services...')
        const services = await broker.inference.listService()
        services.forEach((service: any) => {
            console.log(
                `Service: ${service.name}, Provider: ${service.provider}, Type: ${service.serviceType}, Model: ${service.model}, URL: ${service.url}, verifiability: ${service.verifiability}`
            )
        })

        // Select a service
        const service = await broker.inference.getService("test")

        const providerAddress = service.provider;

        // create ledger
        await broker.ledger.addLedger(0.1)
        console.log('Creating ledger successfully.')

        // deposit fund
        const depositAmount = 0.01
        await broker.ledger.depositFund(depositAmount)
        console.log('Depositing funds...')

        // get ledger
        const ledger = await broker.ledger.getLedger()
        console.log('Get ledger with fund ', ledger.totalBalance)

        // Step 5: Use the Provider's Services
        console.log('Processing a request...')
        const serviceName = service.name
        const content = 'hello world'

        await broker.inference.settleFee(
            providerAddress,
            serviceName,
            0.0000000008
        )

        // Step 5.1: Get the request metadata
        const {endpoint, model} =
            await broker.inference.getServiceMetadata(
                providerAddress,
                serviceName
            )

        // Step 5.2: Get the request headers
        const headers = await broker.inference.getRequestHeaders(
            providerAddress,
            serviceName,
            content
        )

        // Step 6: Send a request to the service

        const openai = new OpenAI({
            baseURL: endpoint,
            apiKey: '',
        })
        const completion = await openai.chat.completions.create(
            {
                messages: [{role: 'system', content}],
                model: model,
                // @ts-expect-error guided_json is not yet public
                guided_json: jsonSchema,
            },
            {
                headers: {
                    ...headers,
                },
            }
        )

        const receivedContent = completion.choices[0].message.content
        const chatID = completion.id
        if (!receivedContent) {
            throw new Error('No content received.')
        }
        console.log('Response:', receivedContent)

        // Step 7: Process the response
        console.log('Processing a response...')
        const isValid = await broker.inference.processResponse(
            providerAddress,
            serviceName,
            receivedContent,
            chatID
        )
        console.log(`Response validity: ${isValid ? 'Valid' : 'Invalid'}`)

        // close service
        await broker.inference.closeService(providerAddress)
        console.log("Closing the service...")
    } catch (error) {
        console.error('Error during execution:', error)
    }
}

main()
