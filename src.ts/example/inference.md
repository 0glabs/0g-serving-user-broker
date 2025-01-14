# Inference SDK Example

1. **Start the provider broker:**

    - Clone the repository:

        ```bash
        git clone https://github.com/0glabs/0g-serving-broker.git
        ```

    - Navigate to the directory and start the services using Docker Compose:

        ```bash
        docker compose -f ./0g-serving-broker/api/inference/integration/all-in-one/docker-compose.yml up -d
        ```

2. **Register a service:**

    - Use the following curl command to register a new service:

        ```bash
        curl -X POST http://127.0.0.1:3080/v1/service -d '{
           "url": "https://inference-api.phala.network/v1",
           "InputPrice": "10000",
           "outputPrice": "20000",
           "type": "chatbot",
           "name": "test",
           "model": "meta-llama/meta-llama-3.1-8b-instruct",
           "verifiability": "TeeML"
        }'
        ```

3. **Use the following code to test the inference SDK:**

    ```typescript
    import { ethers } from 'ethers'
    import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker'
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

            // Step 3: List available services
            console.log('Listing available services...')
            const services = await broker.inference.listService()
            services.forEach((service: any) => {
                console.log(
                    `Service: ${service.name}, Provider: ${service.provider}, Type: ${service.serviceType}, Model: ${service.model}, URL: ${service.url}, verifiability: ${service.verifiability}`
                )
            })

            // Step 3.1: Select a service
            const service = services.find(
                (service: any) => service.name === 'test'
            )
            if (!service) {
                console.error('Service not found.')
                return
            }
            const providerAddress = console.log('Account created successfully.')

            // Step 4.2: Deposit funds into the account
            const depositAmount = 0.01
            console.log('Depositing funds...')
            await broker.inference.depositFund(providerAddress, depositAmount)
            console.log('Funds deposited successfully.')

            // Step 4.3: Get the account
            const accounts =
                await broker.inference.accountProcessor.listAccount()
            accounts.forEach((account: any) => {
                console.log(
                    `user: ${account.user}, provider: ${account.balance}`
                )
            })

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
            const { endpoint, model } =
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
                    messages: [{ role: 'system', content }],
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
        } catch (error) {
            console.error('Error during execution:', error)
        }
    }

    main()
    ```
