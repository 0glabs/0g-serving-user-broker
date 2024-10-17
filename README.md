# 0G Serving Broker Documentation

## Overview

This document provides an overview of the 0G Serving Broker, including setup and usage instructions.

## Setup and Usage

To integrate the 0G Serving Broker into your project, follow these steps

1. Add the dependency to your `package.json` file by including the following line in the `dependencies` section

    ```json
    "@0glabs/0g-serving-broker": "https://github.com/0glabs/0g-serving-user-broker.git"
    ```

2. Ensure that the required WebAssembly module is correctly referenced within your project by putting it in a path of accessible static resources. The module can be found at:

    ```bash
    node_modules/@0glabs/0g-serving-broker/wasm/dcap-qvl-web_bg.wasm
    ```

3. Usage

    ```typescript
    import {
        createZGServingUserBroker,
        AccountStructOutput,
        ZGServingUserBroker,
        ZGServingUserBrokerConfig,
    } from '@0glabs/0g-serving-broker'

    /**
     * Step 1. Add the path of accessible static WebAssembly
     * module mentioned above to configuration
     */
    const zGServingBrokerConfig: ZGServingUserBrokerConfig = {
        dcapWasmPath: '/dcap-qvl-web_bg.wasm',
    }

    /**
     * Step 2. Initialize the broker
     *
     * @param signer - An instance implementing the ethers.js Signer interface
     *                 used to sign transactions for a specific Ethereum account.
     * @param contractAddress - The 0G Sering contract address.
     * @param config - The 0G Sering broker configuration.
     * @returns broker.
     */
    const broker = await createZGServingUserBroker(
        signer,
        seringContractAddress,
        zGServingBrokerConfig
    )

    /**
     * UseCase 1. Get and verify the signing address corresponding to a
     * service identified by a provider address and a service name.
     */
    broker.verifier.getAndVerifySigningAddress(providerAddress, serviceName)

    /**
     * UseCase 2. Create an 0G Serving Account for certain provider (Not ready yet)
     */
    broker.createAccount(providerAddress)

    /**
     * UseCase 3. Generate billing-related headers for requests
     * when a user utilizes the provider service.
     *
     * In the 0G Serving system, a request with valid billing headers
     * is considered a settlement document, which the provider uses for
     * settlement on the contract.
     *
     * @param providerAddress - The address of the provider.
     * @param svcName - The name of the service.
     * @param content - The content to be billed. For example, in a chatbot
     *                  type of service, it refers to the user's input text.
     * @returns headers. They contain information such as the cost of the request
     *                   and user signature.
     */
    const headers = broker.requestProcessor.processRequest(
        providerAddress,
        serviceName,
        content
    )

    /**
     * UseCase 4. Used after a user successfully receives a response from the provider service.
     * It verifies the legitimacy of the response content by checking the provider service's response
     * and the corresponding signature.
     *
     * Additionally, processResponse extracts some necessary information from the response and stores
     * it in localStorage for the generation of billing headers in subsequent requests.
     *
     * @param providerAddress - The address of the provider.
     * @param svcName - The name of the service.
     * @param content - The main content of the service response. For example, in a chatbot
     *                  type of service, this is the response text from the service.
     * @returns A boolean value. True if the response content is legitimate, false otherwise.
     */
    const valid = broker.responseProcessor.processResponse(
        providerAddress,
        serviceName,
        chatCompletion.choices[0].message.content,
        chatCompletion.id
    )

    /**
     * UseCase 5. Checks whether the RA corresponding to the signer's signing address is legitimate.
     *
     * It also stores the signing address of the RA in localStorage and returns it.
     *
     * @param providerAddress - The address of the provider.
     * @param svcName - The name of the service.
     * @returns The first return value is a boolean. True if the signer RA is legitimate, false otherwise.
     *
     * The second return value is the signing address of the signer.
     */
    const result = broker.verifier.getAndVerifySigningAddress(
        providerAddress,
        serviceName
    )
    ```

## Interface

Access the more details of interfaces via opening [index.html](./docs/index.html) in browser.

By following the above steps, you will set up the 0G Serving Broker in your project correctly. Refer to the [example](https://github.com/Ravenyjh/serving-demo) and [video](https://raven.neetorecord.com/watch/3a4f134d-2c52-4cb7-b4ce-e02a8cefc2f1) for detailed usage instructions and additional information.
