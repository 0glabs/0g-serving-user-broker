# 0G Serving Broker Documentation

## Overview

This document provides an overview of the 0G Serving Broker, including setup and usage instructions.

## Setup and Usage

To integrate the 0G Serving Broker into your project, follow these steps

### Step 1: Install the dependency

To get started, you need to install the `@0glabs/0g-serving-broker` package:

```bash
pnpm install @0glabs/0g-serving-broker
```

### Step 2: Initialize a Broker Instance

The broker instance is initialized with a `signer`. This signer is an instance that implements the ethers.js Signer interface and is used to sign transactions for a specific Ethereum account. Developers can create this instance using their private key via the ethers.js library or use a wallet framework tool like [wagmi](https://wagmi.sh/react/guides/ethers) to initialize the signer.

```typescript
import { createZGServingNetworkBroker } from '@0glabs/0g-serving-broker'

/**
 * createZGServingNetworkBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 * @returns broker instance.
 * @throws An error if the broker cannot be initialized.
 */
const broker = await createZGServingNetworkBroker(signer)
```

### Step 3: List Available Services

You can retrieve a list of services offered:

```typescript
/**
 * Retrieves a list of services from the contract.
 *
 * @returns {Promise<ServiceStructOutput[]>} A promise that resolves to an array of ServiceStructOutput objects.
 * @throws An error if the service list cannot be retrieved.
 *
 * type ServiceStructOutput = {
 *   provider: string;  // Address of the provider
 *   name: string;      // Name of the service
 *   serviceType: string;
 *   url: string;
 *   inputPrice: bigint;
 *   outputPrice: bigint;
 *   updatedAt: bigint;
 *   model: string;
 * };
 */
const services = await broker.listService()
```

### Step 4: Manage Accounts

Before using the provider's services, you need to create an account specifically for the chosen provider. The provider checks the account balance before responding to requests. If the balance is insufficient, the request will be denied.

#### 4.1 Create an Account

```typescript
/**
 * Adds a new account to the contract.
 *
 * This function performs the following steps:
 * 1. Creates and stores a key pair for the given provider address.
 * 2. Adds the account to the contract using the provider address, the generated public pair, and the specified balance.
 *
 * @param providerAddress - The address of the provider for whom the account is being created.
 * @param balance - The initial balance to be assigned to the new account.
 *
 * @throws  An error if the account creation fails.
 *
 * @remarks
 * When creating an account, a key pair is also created to sign the request.
 */
await broker.addAccount(providerAddress, balance)
```

#### 4.2 Deposit Funds into the Account

```typescript
/**
 * Deposits a specified amount of funds into the given account.
 *
 * @param {string} account - The account identifier where the funds will be deposited.
 * @param {string} amount - The amount of funds to be deposited.
 * @throws  An error if the deposit fails.
 */
await broker.depositFund(providerAddress, amount)
```

### Step 5: Use the Provider's Services

#### 5.1 Process Requests

Requests to 0G Serving must include specific headers with signature and fee information. Only valid requests will be processed by the provider. The `processRequest` function generates these headers.

```typescript
/**
 * processRequest generates billing-related headers for the request
 * when the user uses the provider service.
 *
 * In the 0G Serving system, a request with valid billing headers
 * is considered a settlement proof and will be used by the provider
 * for contract settlement.
 *
 * @param providerAddress - The address of the provider.
 * @param svcName - The name of the service.
 * @param content - The content being billed. For example, in a chatbot service, it is the text input by the user.
 * @returns headers. Records information such as the request fee and user signature.
 * @throws An error if errors occur during the processing of the request.
 */
const headers = broker.requestProcessor.processRequest(
    providerAddress,
    serviceName,
    content
)
```

#### 5.2 Process Responses

After receiving a response from a provider's service, use `processResponse` to extract necessary information from the response and records it in localStorage for generating billing headers for subsequent requests.

Additionally, if the service is verifiable, input the chat ID from the response and `processResponse` will determine the validity of the returned content by checking the
provider service's response and corresponding signature corresponding to the chat ID.

```typescript
/**
 * processResponse is used after the user successfully obtains a response from the provider service.
 *
 * processResponse extracts necessary information from the response and records it
 * in localStorage for generating billing headers for subsequent requests.
 *
 * Additionally, if the service is verifiable, input the chat ID from the response and
 * processResponse will determine the validity of the returned content by checking the
 * provider service's response and corresponding signature corresponding to the chat ID.
 *
 * @param providerAddress - The address of the provider.
 * @param svcName - The name of the service.
 * @param content - The main content returned by the service. For example, in the case of a chatbot service,
 * it would be the response text.
 * @param chatID - Only for verifiable service. You can fill in the chat ID obtained from response to
 * automatically download the response signature. The function will verify the reliability of the response
 * using the service's signing address.
 * @returns A boolean value. True indicates the returned content is valid, otherwise it is invalid.
 * @throws An error if errors occur during the processing of the response.
 */
const valid = broker.processResponse(
    providerAddress,
    serviceName,
    content,
    chatID
)
```

## Interface

Access the more details of interfaces via opening [index.html](./docs/index.html) in browser.

By following the above steps, you will set up the 0G Serving Broker in your project correctly. Refer to the [example](https://github.com/Ravenyjh/serving-demo) and [video](https://raven.neetorecord.com/watch/3a4f134d-2c52-4cb7-b4ce-e02a8cefc2f1) for detailed usage instructions and additional information.
