# 0G Serving Broker Documentation

# Compute Network Customer Interface

## Inference

1. add ledger
2. deposit fund (optional)
3. refund fund (optional)
4. list services
5. generate header
    1. transfer fund to sub account
6. call openai SDK
7. verify response

## FineTuning
1. add ledger
2. deposit fund (optional)
3. refund fund (optional)
4. list services
5. acknowledge provider signer
    1. [`call provider url/v1/quote`] call provider quote api to download quote (contains provider signer)
    2. [`TBD`] verify the quote using third party service (TODO: Jiahao discuss with Phala)
    3. [`call contract`] acknowledge the provider signer in contract
6. [`use 0g storage sdk`] upload dataset, get dataset root hash
7. create task
    1. get preTrained model root hash based on the model
    2. [`call contract`] calculate fee
    3. [`call contract`] transfer fund from ledger to fine-tuning provider
    4. [`call provider url/v1/task`]call provider task creation api to create task
8. [`call provider url/v1/task-progress`] call provider task progress api to get task progress
9. acknowledge encrypted model with root hash
    1. [`call contract`] get deliverable with root hash
    2. [`use 0g storage sdk`] download model, calculate root hash, compare with provided root hash
    3. [`call contract`] acknowledge the model in contract
10. decrypt model
    1. [`call contract`] get deliverable with encryptedSecret
    2. decrypt the encryptedSecret
    3. decrypt model with secret [TODO: Discuss LiuYuan]

### Structure

1. Leger structure

    ```solidity
    struct Ledger {
        address user;
        uint availableBalance;
        uint totalBalance;
        uint[2] inferenceSigner;
        string additionalInfo;
        address[] inferenceProviders;
        address[] fineTuningProviders;
    }
    ```

2. Service structure

    ```solidity
    struct Service {
        address provider;
        string name;
        string url;
        Quota quota;
        uint pricePerToken;
        address providerSigner;
        bool occupied;
    }
    ```

3. FineTuning account structure

    ```solidity
    struct Account {
        address user;
        address provider;
        uint nonce;
        uint balance;
        uint pendingRefund;
        Refund[] refunds;
        string additionalInfo;
        address providerSigner;
        Deliverable[] deliverables;
    }

    struct Deliverable {
        bytes mod[account.ts](src.ts/broker/account.ts)elRootHash;
        bytes encryptedSecret;
        bool acknowledged;
    }
    ```

### Provider interface

1. Endpoint: https://github.com/0glabs/0g-serving-broker/blob/main/api/fine-tuning/internal/handler/handler.go#L23
2. Task Model: https://github.com/0glabs/0g-serving-broker/blob/main/api/fine-tuning/schema/task.go#L12
3. Task creation example:

    ```bash
    curl -X POST http://Domain/v1/task -d '{
    "customerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "datasetHash": "0xe080961aa45248f8855dbd540fb40c4927b980c6dc773740da79f19c0b2570c2",
    "isTurbo": true,
    "preTrainedModelHash": "0xe080961aa45248f8855dbd540fb40c4927b980c6dc773740da79f19c0b2570c2",
    "trainingParams": "{
        "CustomerAddress": "0xabc",
        "PreTrainedModelHash": "0x7f2244b25cd2219dfd9d14c052982ecce409356e0f08e839b79796e270d110a7",
        "DatasetHash": "0xaae9b4e031e06f84b20f10ec629f36c57719ea512992a6b7e2baea93f447a5fa",
        "IsTurbo": true,
        "TrainingParams": "{\"num_train_epochs\": 3, \"per_device_train_batch_size\": 16, \"per_device_eval_batch_size\": 16, \"warmup_steps\": 500, \"weight_decay\": 0.01, \"logging_dir\": \"./logs\", \"logging_steps\": 100, \"evaluation_strategy\": \"no\", \"save_strategy\": \"steps\", \"save_steps\": 500, \"eval_steps\": 500, \"load_best_model_at_end\": false, \"metric_for_best_model\": \"accuracy\", \"greater_is_better\": true, \"report_to\": [\"none\"]}"
    }"
    }'
    ```


## Overview

This document provides an overview of the 0G Serving Broker, including setup and usage instructions for both inference and finetuning services. The broker allows user to create one ledger that is for all services. 

## Installation

To get started, you need to install the `@0glabs/0g-serving-broker` package:

```bash
pnpm add @0glabs/0g-serving-broker @types/crypto-js@4.2.2 crypto-js@4.2.0
```

## Initialize a Broker Instance

The broker instance is initialized with a `signer`. This signer is an instance that implements the `JsonRpcSigner` or `Wallet` interface from the ethers package and is used to sign transactions for a specific Ethereum account. You can create this instance using your private key via the ethers library or use a wallet framework tool like [wagmi](https://wagmi.sh/react/guides/ethers) to initialize the signer.

```typescript
import { createZGServingNetworkBroker } from '@0glabs/0g-serving-broker'

/**
 * 'createZGServingNetworkBroker' is used to initialize ZGServingUserBroker
 *
 * @param {JsonRpcSigner | Wallet} signer - A signer that implements the 'JsonRpcSigner' or 'Wallet' interface from the ethers package.
 * @param {string} contractAddress - 0G Serving contract address, use default address if not provided.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
const broker = await createZGServingNetworkBroker(signer)


```

## Setup the account
The first step to use 0G services is to create a ledger, which will be used for all services.

### Create a ledger

```typescript
/**
Create a ledger with certain amount of balance
**/
await broker.addLedger(balance)
```

### Deposit funds into the ledger

```typescript
/**
 * 'depositFund' deposits a specified amount of funds into ledger
 */
await broker.depositFund(amount)
```

### Refund from the ledger

``` typescript
/**
Refund from ledger
**/
broker.refund(amount)
```

## Inference 

### List available services

For inferernce, we can list all available services regardless of the hardware quota. 

```typescript
/**
 * 'listService' retrieves a list of services from the contract.
 *
 * @returns {Promise<ServiceStructOutput[]>} A promise that resolves to an array of ServiceStructOutput objects.
 * @throws An error if the service list cannot be retrieved.
 *
 * type ServiceStructOutput = {
 *   provider: string;  // Address of the provider
 *   name: string;
 *   serviceType: string;
 *   url: string;
 *   inputPrice: bigint;
 *   outputPrice: bigint;
 *   updatedAt: bigint;
 *   model: string;
 * };
 */
const services = await broker.listInferenceService()
```

### Use inference services

#### Get service metadata

```typescript
/**
 * 'getServiceMetadata' returns metadata for the provider service.
 * Includes:
 * 1. Service endpoint of the provider service
 * 2. Model information for the provider service
 *
 * @param {string} providerAddress - The address of the provider.
 * @param {string} serviceName - The name of the service.
 *
 * @returns { endpoint, model } - Object containing endpoint and model.
 *
 * @throws An error if errors occur during the processing of the request.
 */
const { endpoint, model } = await broker.getInferenceServiceMetadata(
    providerAddress,
    serviceName
)
```

#### Get request headers

```typescript
/**
 * 'getRequestHeaders' generates billing-related headers for the request
 * when the user uses the provider service.
 *
 * In the 0G Serving system, a request with valid billing headers
 * is considered a settlement proof and will be used by the provider
 * for settlement in contract.
 *
 * @param {string} providerAddress - The address of the provider.
 * @param {string} serviceName - The name of the service.
 * @param {string} content - The content being billed. For example, in a chatbot service, it is the text input by the user.
 *
 * @returns headers. Records information such as the request fee and user signature.
 *
 * @throws An error if errors occur during the processing of the request.
 */
const headers = await broker.getInferenceRequestHeaders(
    providerAddress,
    serviceName,
    content
)
```

#### Send the request

After obtaining the `endpoint`, `model`, and `headers`, you can use client SDKs
compatible with the OpenAI interface to make requests.

**Note**: After receiving the response, you must use `processResponse` as demonstrated in step 5.4 to settle the response fee. Failure to do so will result in subsequent requests being denied due to unpaid fees. If this happens, you can manually settle the fee using `settleFee` as shown in step 5.5. The amount owed will be specified in the error message.

**Note**: Generated `headers` are valid for a single use only and cannot be reused.

```typescript
/**
 * Any SDK request methods that follow the OpenAI interface specifications can also be used.
 *
 * Here is an example using the OpenAI TS SDK.
 */
const openai = new OpenAI({
    baseURL: endpoint,
    apiKey: '',
})
const completion = await openai.chat.completions.create(
    {
        messages: [{ role: 'system', content }],
        model: model,
    },
    {
        headers: {
            ...headers,
        },
    }
)

/**
 * Alternatively, you can also use `fetch` to make the request.
 */
await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        ...headers,
    },
    body: JSON.stringify({
        messages: [{ role: 'system', content }],
        model: model,
    }),
})
```

#### Process Responses

```typescript
/**
 * 'processResponse' is used after the user successfully obtains a response from the provider service.
 *
 * It will settle the fee for the response content. Additionally, if the service is verifiable,
 * input the chat ID from the response and 'processResponse' will determine the validity of the
 * returned content by checking the provider service's response and corresponding signature associated
 * with the chat ID.
 *
 * @param {string} providerAddress - The address of the provider.
 * @param {string} serviceName - The name of the service.
 * @param {string} content - The main content returned by the service. For example, in the case of a chatbot service,
 * it would be the response text.
 * @param {string} chatID - Only for verifiable services. You can provide the chat ID obtained from the response to
 * automatically download the response signature. The function will verify the reliability of the response
 * using the service's signing address.
 *
 * @returns A boolean value. True indicates the returned content is valid, otherwise it is invalid.
 *
 * @throws An error if any issues occur during the processing of the response.
 */
const valid = await broker.processInferenceResponse(
    providerAddress,
    serviceName,
    content,
    chatID
)
```

#### 5.5 Settle Fees Manually

```typescript
/**
 * 'settleFee' is used to settle the fee for the provider service.
 *
 * Normally, the fee for each request will be automatically settled in 'processResponse'.
 * However, if 'processResponse' fails due to network issues or other reasons,
 * you can manually call settleFee to settle the fee.
 *
 * @param {string} providerAddress - The address of the provider.
 * @param {string} serviceName - The name of the service.
 * @param {number} fee - The fee to be settled. The unit is A0GI.
 *
 * @returns A promise that resolves when the fee settlement is successful.
 *
 * @throws An error if any issues occur during the fee settlement process.
 */
await broker.settleFee(providerAddress, serviceName, fee)
```

## Finetune

### List available services of a given model

For finetuning, we retrive all services according to model name. The full model list can be found in [url].

``` typescript

/**
ServiceStructOutput = {
  provider: string;
  name: string;
  url: string;
  quota: QuotaStructOutput;
  pricePerToken: bigint;
  occupied: boolean;
}
**
**/
const services = await broker.listFinetuneService("llama3-70b")
```

### Upload dataset

``` typescript
/**
Uload data to 0G platform, the respons is

{
  "id": "file-abc123",
  "object": "file",
  "bytes": 120000,
  "created_at": 1677610602,
  "filename": "mydata.jsonl",
  "purpose": "fine-tune",
}
**/

const openai = new OpenAI({
    baseURL: endpoint,
    apiKey: '',
})

// mydata.jsonl is prepared by user, and can be validated with scripts we provide for typical finetune jobs
const file = await openai.files.create({
  file: fs.createReadStream("mydata.jsonl"),
  purpose: "fine-tune",
});

```

### Get service metadata

```typescript
/**
 * 'getFinetuneServiceMetadata' returns metadata for the provider service.
 * Includes:
 * 1. Service endpoint of the provider service
 * 2. Model information for the provider service
 *
 * @param {string} providerAddress - The address of the provider.
 * @param {string} serviceName - The name of the service.
 *
 * @returns { endpoint, model } - Object containing endpoint and model.
 *
 * @throws An error if errors occur during the processing of the request.
 */
const { endpoint, model } = await broker.getFinetuneServiceMetadata(
    providerAddress,
    serviceName
)
```

### Get request headers

Create headers for this finetuning job. The fee is estimated and transferred from ledger to finetune account in this phase.

```typescript
/**
 * 'getFinetuneRequestHeaders' generates billing-related headers for the request
 * when the user uses the provider service.
 *
 * In the 0G Serving system, a request with valid billing headers
 * is considered a settlement proof and will be used by the provider
 * for settlement in contract.
 *
 * @param {string} providerAddress - The address of the provider.
 * @param {string} serviceName - The name of the service.
 * @param {string} finetuneDataset - The id of the uploaded dataset
 * @param {int} epoch - The epoch of finetuning

 * @returns headers. Records information such as the request fee and user signature.
 *
 * @throws An error if errors occur during the processing of the request.
 */
```

#### Send the request

After obtaining the `endpoint`, `model`, and `headers`, you can use client SDKs
compatible with the OpenAI interface to make requests.

**Note**: After receiving the response, you must use `processResponse` as demonstrated in step 5.4 to settle the response fee. Failure to do so will result in subsequent requests being denied due to unpaid fees. If this happens, you can manually settle the fee using `settleFee` as shown in step 5.5. The amount owed will be specified in the error message.

**Note**: Generated `headers` are valid for a single use only and cannot be reused.

```typescript
/**
 * Any SDK request methods that follow the OpenAI interface specifications can also be used.
 *
 * Here is an example using the OpenAI TS SDK.
 */

const request = await broker.sendFinetuneRequest(
    providerAddress,
    serviceName,
    finetuneDataset,
    epoch, 
    ...
)

```

#### Process Responses

```typescript
/**
 * 'processResponse' is used after the user successfully obtains a response from the provider service.
 *
 * It will settle the fee for the response content. Additionally, if the service is verifiable,
 * input the chat ID from the response and 'processResponse' will determine the validity of the
 * returned content by checking the provider service's response and corresponding signature associated
 * with the chat ID.
 *
 * @param {string} providerAddress - The address of the provider.
 * @param {string} serviceName - The name of the service.
 * @param {string} content - The main content returned by the service. For example, in the case of a chatbot service,
 * it would be the response text.
 * @param {string} jobID - Only for verifiable services. You can provide the chat ID obtained from the response to
 * automatically download the response signature. The function will verify the reliability of the response
 * using the service's signing address.
 *
 * @returns A boolean value. True indicates the returned content is valid, otherwise it is invalid.
 *
 * @throws An error if any issues occur during the processing of the response.
 */
const valid = await broker.retriveFunetuneModel(
    providerAddress,
    serviceName,
    content,
    jobID
)

await broker.downloadFinetuneModel(jobID, "/path/to/model")
await broker.ackFinetuneModel()
```

#### Settle Fees Manually

```typescript
/**
 * 'settleFee' is used to settle the fee for the provider service.
 *
 * Normally, the fee for each request will be automatically settled in 'processResponse'.
 * However, if 'processResponse' fails due to network issues or other reasons,
 * you can manually call settleFee to settle the fee.
 *
 * @param {string} providerAddress - The address of the provider.
 * @param {string} serviceName - The name of the service.
 * @param {number} fee - The fee to be settled. The unit is A0GI.
 *
 * @returns A promise that resolves when the fee settlement is successful.
 *
 * @throws An error if any issues occur during the fee settlement process.
 */
await broker.settleFee(providerAddress, serviceName, fee)
```


### Questions
1. Multiple job? 
2. Finetune price can be determined at metadata phase? What is the case of not sure about the price?
3. ZG Data storage?
4. openai-style API?
