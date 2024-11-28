import { DeferredTopicFilter, EventFragment, EventLog, ContractTransactionResponse, FunctionFragment, ContractTransaction, LogDescription, Typed, TransactionRequest, BaseContract, ContractRunner, Listener, AddressLike, BigNumberish, ContractMethod, Interface, BytesLike, Result, JsonRpcSigner, Wallet } from 'ethers';

interface TypedDeferredTopicFilter<_TCEvent extends TypedContractEvent> extends DeferredTopicFilter {
}
interface TypedContractEvent<InputTuple extends Array<any> = any, OutputTuple extends Array<any> = any, OutputObject = any> {
    (...args: Partial<InputTuple>): TypedDeferredTopicFilter<TypedContractEvent<InputTuple, OutputTuple, OutputObject>>;
    name: string;
    fragment: EventFragment;
    getFragment(...args: Partial<InputTuple>): EventFragment;
}
type __TypechainAOutputTuple<T> = T extends TypedContractEvent<infer _U, infer W> ? W : never;
type __TypechainOutputObject<T> = T extends TypedContractEvent<infer _U, infer _W, infer V> ? V : never;
interface TypedEventLog<TCEvent extends TypedContractEvent> extends Omit<EventLog, "args"> {
    args: __TypechainAOutputTuple<TCEvent> & __TypechainOutputObject<TCEvent>;
}
interface TypedLogDescription<TCEvent extends TypedContractEvent> extends Omit<LogDescription, "args"> {
    args: __TypechainAOutputTuple<TCEvent> & __TypechainOutputObject<TCEvent>;
}
type TypedListener<TCEvent extends TypedContractEvent> = (...listenerArg: [
    ...__TypechainAOutputTuple<TCEvent>,
    TypedEventLog<TCEvent>,
    ...undefined[]
]) => void;
type StateMutability = "nonpayable" | "payable" | "view";
type BaseOverrides = Omit<TransactionRequest, "to" | "data">;
type NonPayableOverrides = Omit<BaseOverrides, "value" | "blockTag" | "enableCcipRead">;
type PayableOverrides = Omit<BaseOverrides, "blockTag" | "enableCcipRead">;
type ViewOverrides = Omit<TransactionRequest, "to" | "data">;
type Overrides<S extends StateMutability> = S extends "nonpayable" ? NonPayableOverrides : S extends "payable" ? PayableOverrides : ViewOverrides;
type PostfixOverrides<A extends Array<any>, S extends StateMutability> = A | [...A, Overrides<S>];
type ContractMethodArgs<A extends Array<any>, S extends StateMutability> = PostfixOverrides<{
    [I in keyof A]-?: A[I] | Typed;
}, S>;
type DefaultReturnType<R> = R extends Array<any> ? R[0] : R;
interface TypedContractMethod<A extends Array<any> = Array<any>, R = any, S extends StateMutability = "payable"> {
    (...args: ContractMethodArgs<A, S>): S extends "view" ? Promise<DefaultReturnType<R>> : Promise<ContractTransactionResponse>;
    name: string;
    fragment: FunctionFragment;
    getFragment(...args: ContractMethodArgs<A, S>): FunctionFragment;
    populateTransaction(...args: ContractMethodArgs<A, S>): Promise<ContractTransaction>;
    staticCall(...args: ContractMethodArgs<A, "view">): Promise<DefaultReturnType<R>>;
    send(...args: ContractMethodArgs<A, S>): Promise<ContractTransactionResponse>;
    estimateGas(...args: ContractMethodArgs<A, S>): Promise<bigint>;
    staticCallResult(...args: ContractMethodArgs<A, "view">): Promise<R>;
}

type RefundStructOutput = [
    index: bigint,
    amount: bigint,
    createdAt: bigint,
    processed: boolean
] & {
    index: bigint;
    amount: bigint;
    createdAt: bigint;
    processed: boolean;
};
type AccountStructOutput = [
    user: string,
    provider: string,
    nonce: bigint,
    balance: bigint,
    pendingRefund: bigint,
    signer: [bigint, bigint],
    refunds: RefundStructOutput[],
    additionalInfo: string
] & {
    user: string;
    provider: string;
    nonce: bigint;
    balance: bigint;
    pendingRefund: bigint;
    signer: [bigint, bigint];
    refunds: RefundStructOutput[];
    additionalInfo: string;
};
type ServiceStructOutput = [
    provider: string,
    name: string,
    serviceType: string,
    url: string,
    inputPrice: bigint,
    outputPrice: bigint,
    updatedAt: bigint,
    model: string,
    verifiability: string
] & {
    provider: string;
    name: string;
    serviceType: string;
    url: string;
    inputPrice: bigint;
    outputPrice: bigint;
    updatedAt: bigint;
    model: string;
    verifiability: string;
};
type VerifierInputStruct = {
    inProof: BigNumberish[];
    proofInputs: BigNumberish[];
    numChunks: BigNumberish;
    segmentSize: BigNumberish[];
};
interface ServingInterface extends Interface {
    getFunction(nameOrSignature: "addAccount" | "addOrUpdateService" | "batchVerifierAddress" | "deleteAccount" | "depositFund" | "getAccount" | "getAllAccounts" | "getAllServices" | "getService" | "initialize" | "initialized" | "lockTime" | "owner" | "processRefund" | "removeService" | "renounceOwnership" | "requestRefund" | "settleFees" | "transferOwnership" | "updateBatchVerifierAddress" | "updateLockTime"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "BalanceUpdated" | "OwnershipTransferred" | "RefundRequested" | "ServiceRemoved" | "ServiceUpdated"): EventFragment;
    encodeFunctionData(functionFragment: "addAccount", values: [AddressLike, [BigNumberish, BigNumberish], string]): string;
    encodeFunctionData(functionFragment: "addOrUpdateService", values: [string, string, string, string, string, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "batchVerifierAddress", values?: undefined): string;
    encodeFunctionData(functionFragment: "deleteAccount", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "depositFund", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "getAccount", values: [AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "getAllAccounts", values?: undefined): string;
    encodeFunctionData(functionFragment: "getAllServices", values?: undefined): string;
    encodeFunctionData(functionFragment: "getService", values: [AddressLike, string]): string;
    encodeFunctionData(functionFragment: "initialize", values: [BigNumberish, AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "initialized", values?: undefined): string;
    encodeFunctionData(functionFragment: "lockTime", values?: undefined): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "processRefund", values: [AddressLike, BigNumberish[]]): string;
    encodeFunctionData(functionFragment: "removeService", values: [string]): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "requestRefund", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "settleFees", values: [VerifierInputStruct]): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "updateBatchVerifierAddress", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "updateLockTime", values: [BigNumberish]): string;
    decodeFunctionResult(functionFragment: "addAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addOrUpdateService", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "batchVerifierAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deleteAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "depositFund", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAllAccounts", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAllServices", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getService", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "initialized", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lockTime", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "processRefund", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeService", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requestRefund", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "settleFees", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateBatchVerifierAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateLockTime", data: BytesLike): Result;
}
declare namespace BalanceUpdatedEvent {
    type InputTuple = [
        user: AddressLike,
        provider: AddressLike,
        amount: BigNumberish,
        pendingRefund: BigNumberish
    ];
    type OutputTuple = [
        user: string,
        provider: string,
        amount: bigint,
        pendingRefund: bigint
    ];
    interface OutputObject {
        user: string;
        provider: string;
        amount: bigint;
        pendingRefund: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
declare namespace OwnershipTransferredEvent {
    type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
    type OutputTuple = [previousOwner: string, newOwner: string];
    interface OutputObject {
        previousOwner: string;
        newOwner: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
declare namespace RefundRequestedEvent {
    type InputTuple = [
        user: AddressLike,
        provider: AddressLike,
        index: BigNumberish,
        timestamp: BigNumberish
    ];
    type OutputTuple = [
        user: string,
        provider: string,
        index: bigint,
        timestamp: bigint
    ];
    interface OutputObject {
        user: string;
        provider: string;
        index: bigint;
        timestamp: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
declare namespace ServiceRemovedEvent {
    type InputTuple = [service: AddressLike, name: string];
    type OutputTuple = [service: string, name: string];
    interface OutputObject {
        service: string;
        name: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
declare namespace ServiceUpdatedEvent {
    type InputTuple = [
        service: AddressLike,
        name: string,
        serviceType: string,
        url: string,
        inputPrice: BigNumberish,
        outputPrice: BigNumberish,
        updatedAt: BigNumberish,
        model: string,
        verifiability: string
    ];
    type OutputTuple = [
        service: string,
        name: string,
        serviceType: string,
        url: string,
        inputPrice: bigint,
        outputPrice: bigint,
        updatedAt: bigint,
        model: string,
        verifiability: string
    ];
    interface OutputObject {
        service: string;
        name: string;
        serviceType: string;
        url: string;
        inputPrice: bigint;
        outputPrice: bigint;
        updatedAt: bigint;
        model: string;
        verifiability: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
interface Serving extends BaseContract {
    connect(runner?: ContractRunner | null): Serving;
    waitForDeployment(): Promise<this>;
    interface: ServingInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    addAccount: TypedContractMethod<[
        provider: AddressLike,
        signer: [BigNumberish, BigNumberish],
        additionalInfo: string
    ], [
        void
    ], "payable">;
    addOrUpdateService: TypedContractMethod<[
        name: string,
        serviceType: string,
        url: string,
        model: string,
        verifiability: string,
        inputPrice: BigNumberish,
        outputPrice: BigNumberish
    ], [
        void
    ], "nonpayable">;
    batchVerifierAddress: TypedContractMethod<[], [string], "view">;
    deleteAccount: TypedContractMethod<[
        provider: AddressLike
    ], [
        void
    ], "nonpayable">;
    depositFund: TypedContractMethod<[provider: AddressLike], [void], "payable">;
    getAccount: TypedContractMethod<[
        user: AddressLike,
        provider: AddressLike
    ], [
        AccountStructOutput
    ], "view">;
    getAllAccounts: TypedContractMethod<[], [AccountStructOutput[]], "view">;
    getAllServices: TypedContractMethod<[], [ServiceStructOutput[]], "view">;
    getService: TypedContractMethod<[
        provider: AddressLike,
        name: string
    ], [
        ServiceStructOutput
    ], "view">;
    initialize: TypedContractMethod<[
        _locktime: BigNumberish,
        _batchVerifierAddress: AddressLike,
        owner: AddressLike
    ], [
        void
    ], "nonpayable">;
    initialized: TypedContractMethod<[], [boolean], "view">;
    lockTime: TypedContractMethod<[], [bigint], "view">;
    owner: TypedContractMethod<[], [string], "view">;
    processRefund: TypedContractMethod<[
        provider: AddressLike,
        indices: BigNumberish[]
    ], [
        void
    ], "nonpayable">;
    removeService: TypedContractMethod<[name: string], [void], "nonpayable">;
    renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;
    requestRefund: TypedContractMethod<[
        provider: AddressLike,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    settleFees: TypedContractMethod<[
        verifierInput: VerifierInputStruct
    ], [
        void
    ], "nonpayable">;
    transferOwnership: TypedContractMethod<[
        newOwner: AddressLike
    ], [
        void
    ], "nonpayable">;
    updateBatchVerifierAddress: TypedContractMethod<[
        _batchVerifierAddress: AddressLike
    ], [
        void
    ], "nonpayable">;
    updateLockTime: TypedContractMethod<[
        _locktime: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "addAccount"): TypedContractMethod<[
        provider: AddressLike,
        signer: [BigNumberish, BigNumberish],
        additionalInfo: string
    ], [
        void
    ], "payable">;
    getFunction(nameOrSignature: "addOrUpdateService"): TypedContractMethod<[
        name: string,
        serviceType: string,
        url: string,
        model: string,
        verifiability: string,
        inputPrice: BigNumberish,
        outputPrice: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "batchVerifierAddress"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "deleteAccount"): TypedContractMethod<[provider: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "depositFund"): TypedContractMethod<[provider: AddressLike], [void], "payable">;
    getFunction(nameOrSignature: "getAccount"): TypedContractMethod<[
        user: AddressLike,
        provider: AddressLike
    ], [
        AccountStructOutput
    ], "view">;
    getFunction(nameOrSignature: "getAllAccounts"): TypedContractMethod<[], [AccountStructOutput[]], "view">;
    getFunction(nameOrSignature: "getAllServices"): TypedContractMethod<[], [ServiceStructOutput[]], "view">;
    getFunction(nameOrSignature: "getService"): TypedContractMethod<[
        provider: AddressLike,
        name: string
    ], [
        ServiceStructOutput
    ], "view">;
    getFunction(nameOrSignature: "initialize"): TypedContractMethod<[
        _locktime: BigNumberish,
        _batchVerifierAddress: AddressLike,
        owner: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "initialized"): TypedContractMethod<[], [boolean], "view">;
    getFunction(nameOrSignature: "lockTime"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "owner"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "processRefund"): TypedContractMethod<[
        provider: AddressLike,
        indices: BigNumberish[]
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "removeService"): TypedContractMethod<[name: string], [void], "nonpayable">;
    getFunction(nameOrSignature: "renounceOwnership"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "requestRefund"): TypedContractMethod<[
        provider: AddressLike,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "settleFees"): TypedContractMethod<[
        verifierInput: VerifierInputStruct
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "transferOwnership"): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "updateBatchVerifierAddress"): TypedContractMethod<[
        _batchVerifierAddress: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "updateLockTime"): TypedContractMethod<[_locktime: BigNumberish], [void], "nonpayable">;
    getEvent(key: "BalanceUpdated"): TypedContractEvent<BalanceUpdatedEvent.InputTuple, BalanceUpdatedEvent.OutputTuple, BalanceUpdatedEvent.OutputObject>;
    getEvent(key: "OwnershipTransferred"): TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
    getEvent(key: "RefundRequested"): TypedContractEvent<RefundRequestedEvent.InputTuple, RefundRequestedEvent.OutputTuple, RefundRequestedEvent.OutputObject>;
    getEvent(key: "ServiceRemoved"): TypedContractEvent<ServiceRemovedEvent.InputTuple, ServiceRemovedEvent.OutputTuple, ServiceRemovedEvent.OutputObject>;
    getEvent(key: "ServiceUpdated"): TypedContractEvent<ServiceUpdatedEvent.InputTuple, ServiceUpdatedEvent.OutputTuple, ServiceUpdatedEvent.OutputObject>;
    filters: {
        "BalanceUpdated(address,address,uint256,uint256)": TypedContractEvent<BalanceUpdatedEvent.InputTuple, BalanceUpdatedEvent.OutputTuple, BalanceUpdatedEvent.OutputObject>;
        BalanceUpdated: TypedContractEvent<BalanceUpdatedEvent.InputTuple, BalanceUpdatedEvent.OutputTuple, BalanceUpdatedEvent.OutputObject>;
        "OwnershipTransferred(address,address)": TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
        OwnershipTransferred: TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
        "RefundRequested(address,address,uint256,uint256)": TypedContractEvent<RefundRequestedEvent.InputTuple, RefundRequestedEvent.OutputTuple, RefundRequestedEvent.OutputObject>;
        RefundRequested: TypedContractEvent<RefundRequestedEvent.InputTuple, RefundRequestedEvent.OutputTuple, RefundRequestedEvent.OutputObject>;
        "ServiceRemoved(address,string)": TypedContractEvent<ServiceRemovedEvent.InputTuple, ServiceRemovedEvent.OutputTuple, ServiceRemovedEvent.OutputObject>;
        ServiceRemoved: TypedContractEvent<ServiceRemovedEvent.InputTuple, ServiceRemovedEvent.OutputTuple, ServiceRemovedEvent.OutputObject>;
        "ServiceUpdated(address,string,string,string,uint256,uint256,uint256,string,string)": TypedContractEvent<ServiceUpdatedEvent.InputTuple, ServiceUpdatedEvent.OutputTuple, ServiceUpdatedEvent.OutputObject>;
        ServiceUpdated: TypedContractEvent<ServiceUpdatedEvent.InputTuple, ServiceUpdatedEvent.OutputTuple, ServiceUpdatedEvent.OutputObject>;
    };
}

declare class ServingContract {
    serving: Serving;
    signer: JsonRpcSigner | Wallet;
    private _userAddress;
    constructor(signer: JsonRpcSigner | Wallet, contractAddress: string, userAddress: string);
    lockTime(): Promise<bigint>;
    listService(): Promise<ServiceStructOutput[]>;
    listAccount(): Promise<AccountStructOutput[]>;
    getAccount(provider: AddressLike): Promise<AccountStructOutput>;
    deleteAccount(provider: AddressLike): Promise<void>;
    addOrUpdateService(name: string, serviceType: string, url: string, model: string, verifiability: string, inputPrice: BigNumberish, outputPrice: BigNumberish): Promise<void>;
    addAccount(providerAddress: AddressLike, signer: [BigNumberish, BigNumberish], balance: bigint, settleSignerEncryptedPrivateKey: string): Promise<void>;
    depositFund(providerAddress: AddressLike, balance: string): Promise<void>;
    getService(providerAddress: string, svcName: string): Promise<ServiceStructOutput>;
    getUserAddress(): string;
}

declare class Metadata {
    private nodeStorage;
    private initialized;
    constructor();
    initialize(): Promise<void>;
    private setItem;
    private getItem;
    storeSettleSignerPrivateKey(key: string, value: bigint[]): Promise<void>;
    storeSigningKey(key: string, value: string): Promise<void>;
    getSettleSignerPrivateKey(key: string): Promise<bigint[] | null>;
    getSigningKey(key: string): Promise<string | null>;
}

declare enum CacheValueTypeEnum {
    Service = "service"
}
type CacheValueType = CacheValueTypeEnum.Service;
declare class Cache {
    private nodeStorage;
    private initialized;
    constructor();
    setItem(key: string, value: any, ttl: number, type: CacheValueType): Promise<void>;
    getItem(key: string): Promise<any | null>;
    private initialize;
    static encodeValue(value: any): string;
    static decodeValue(encodedValue: string, type: CacheValueType): any;
    static createServiceStructOutput(fields: [
        string,
        string,
        string,
        string,
        bigint,
        bigint,
        bigint,
        string,
        string
    ]): ServiceStructOutput;
}

declare abstract class Extractor {
    abstract getSvcInfo(): Promise<ServiceStructOutput>;
    abstract getInputCount(content: string): Promise<number>;
    abstract getOutputCount(content: string): Promise<number>;
}

/**
 * ServingRequestHeaders contains headers related to request billing.
 * These need to be added to the request.
 */
interface ServingRequestHeaders {
    'X-Phala-Signature-Type': 'StandaloneApi';
    /**
     * User's address
     */
    Address: string;
    /**
     * Total fee for the request.
     * Equals 'Input-Fee' + 'Previous-Output-Fee'
     */
    Fee: string;
    /**
     * Fee required for the input of this request.
     * For example, for a chatbot service,
     * 'Input-Fee' = number of tokens input by the user * price per token
     */
    'Input-Fee': string;
    Nonce: string;
    /**
     * Fee returned from the previous request.
     * In the 0G Serving system, the request is the only payment proof,
     * so the fee returned from the previous request will be included in the current request.
     * For example, for a chatbot service,
     * 'Previous-Output-Fee' = number of tokens returned by the service in the previous round * price per token
     */
    'Previous-Output-Fee': string;
    /**
     * Service name
     */
    'Service-Name': string;
    /**
     * User's signature for the other headers.
     * By adding this information, the user gives the current request the characteristics of a settlement proof.
     */
    Signature: string;
}
/**
 * RequestProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
declare class RequestProcessor extends ZGServingUserBrokerBase {
    getServiceMetadata(providerAddress: string, svcName: string): Promise<{
        endpoint: string;
        model: string;
    }>;
    getRequestHeaders(providerAddress: string, svcName: string, content: string): Promise<ServingRequestHeaders>;
}

declare abstract class ZGServingUserBrokerBase {
    protected contract: ServingContract;
    protected metadata: Metadata;
    protected cache: Cache;
    constructor(contract: ServingContract, metadata: Metadata, cache: Cache);
    protected getProviderData(providerAddress: string): Promise<{
        settleSignerPrivateKey: bigint[] | null;
    }>;
    protected getService(providerAddress: string, svcName: string, useCache?: boolean): Promise<ServiceStructOutput>;
    protected getExtractor(providerAddress: string, svcName: string, useCache?: boolean): Promise<Extractor>;
    protected createExtractor(svc: ServiceStructOutput): Extractor;
    protected a0giToNeuron(value: number): bigint;
    protected neuronToA0gi(value: bigint): number;
    getHeader(providerAddress: string, svcName: string, content: string, outputFee: bigint): Promise<ServingRequestHeaders>;
    private calculateInputFees;
}

/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
declare class AccountProcessor extends ZGServingUserBrokerBase {
    getAccount(provider: AddressLike): Promise<AccountStructOutput>;
    listAccount(): Promise<AccountStructOutput[]>;
    addAccount(providerAddress: string, balance: number): Promise<void>;
    deleteAccount(provider: AddressLike): Promise<void>;
    depositFund(providerAddress: string, balance: number): Promise<void>;
    private createSettleSignerKey;
}

/**
 * ResponseProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
declare class ResponseProcessor extends ZGServingUserBrokerBase {
    private verifier;
    constructor(contract: ServingContract, metadata: Metadata, cache: Cache);
    settleFeeWithA0gi(providerAddress: string, serviceName: string, fee: number): Promise<void>;
    /**
     * settleFee sends an empty request to the service provider to settle the fee.
     */
    settleFee(providerAddress: string, serviceName: string, fee: bigint): Promise<void>;
    processResponse(providerAddress: string, svcName: string, content: string, chatID?: string): Promise<boolean | null>;
    private calculateOutputFees;
}

interface ResponseSignature {
    text: string;
    signature: string;
}
interface SignerRA {
    signing_address: string;
    nvidia_payload: string;
    intel_quote: string;
}
interface SingerRAVerificationResult {
    /**
     * Whether the signer RA is valid
     * null means the RA has not been verified
     */
    valid: boolean | null;
    /**
     * The signing address of the signer
     */
    signingAddress: string;
}
/**
 * The Verifier class contains methods for verifying service reliability.
 */
declare class Verifier extends ZGServingUserBrokerBase {
    verifyService(providerAddress: string, svcName: string): Promise<boolean | null>;
    /**
     * getSigningAddress verifies whether the signing address
     * of the signer corresponds to a valid RA.
     *
     * It also stores the signing address of the RA in
     * localStorage and returns it.
     *
     * @param providerAddress - provider address.
     * @param svcName - service name.
     * @param verifyRA - whether to verify the RA， default is false.
     * @returns The first return value indicates whether the RA is valid,
     * and the second return value indicates the signing address of the RA.
     */
    getSigningAddress(providerAddress: string, svcName: string, verifyRA?: boolean): Promise<SingerRAVerificationResult>;
    getSignerRaDownloadLink(providerAddress: string, svcName: string): Promise<string>;
    getChatSignatureDownloadLink(providerAddress: string, svcName: string, chatID: string): Promise<string>;
    static verifyRA(nvidia_payload: any): Promise<boolean>;
    static fetSignerRA(providerBrokerURL: string, svcName: string): Promise<SignerRA>;
    static fetSignatureByChatID(providerBrokerURL: string, svcName: string, chatID: string): Promise<ResponseSignature>;
    static verifySignature(message: string, signature: string, expectedAddress: string): boolean;
}

declare class ModelProcessor extends ZGServingUserBrokerBase {
    listService(): Promise<ServiceStructOutput[]>;
}

declare class ZGServingNetworkBroker {
    requestProcessor: RequestProcessor;
    responseProcessor: ResponseProcessor;
    verifier: Verifier;
    accountProcessor: AccountProcessor;
    modelProcessor: ModelProcessor;
    private signer;
    private contractAddress;
    constructor(signer: JsonRpcSigner | Wallet, contractAddress: string);
    initialize(): Promise<void>;
    /**
     * Retrieves a list of services from the contract.
     *
     * @returns {Promise<ServiceStructOutput[]>} A promise that resolves to an array of ServiceStructOutput objects.
     * @throws An error if the service list cannot be retrieved.
     */
    listService: () => Promise<ServiceStructOutput[]>;
    /**
     * Adds a new account to the contract.
     *
     * @param {string} providerAddress - The address of the provider for whom the account is being created.
     * @param {number} balance - The initial balance to be assigned to the new account. Units are in A0GI.
     *
     * @throws  An error if the account creation fails.
     *
     * @remarks
     * When creating an account, a key pair is also created to sign the request.
     */
    addAccount: (providerAddress: string, balance: number) => Promise<void>;
    /**
     * Retrieves the account information for a given provider address.
     *
     * @param {string} providerAddress - The address of the provider identifying the account.
     *
     * @returns A promise that resolves to the account information.
     *
     * @throws Will throw an error if the account retrieval process fails.
     */
    getAccount: (providerAddress: string) => Promise<AccountStructOutput>;
    /**
     * Deposits a specified amount of funds into the given account.
     *
     * @param {string} account - The account identifier where the funds will be deposited.
     * @param {string} amount - The amount of funds to be deposited. Units are in A0GI.
     * @throws  An error if the deposit fails.
     */
    depositFund: (account: string, amount: number) => Promise<void>;
    /**
     * Generates request metadata for the provider service.
     * Includes:
     * 1. Request endpoint for the provider service
     * 2. Model information for the provider service
     *
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
     *
     * @returns { endpoint, model } - Object containing endpoint and model.
     *
     * @throws An error if errors occur during the processing of the request.
     */
    getServiceMetadata: (providerAddress: string, svcName: string) => Promise<{
        endpoint: string;
        model: string;
    }>;
    /**
     * getRequestHeaders generates billing-related headers for the request
     * when the user uses the provider service.
     *
     * In the 0G Serving system, a request with valid billing headers
     * is considered a settlement proof and will be used by the provider
     * for contract settlement.
     *
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
     * @param {string} content - The content being billed. For example, in a chatbot service, it is the text input by the user.
     *
     * @returns headers. Records information such as the request fee and user signature.
     *
     * @example
     *
     * const { endpoint, model } = await broker.getServiceMetadata(
     *   providerAddress,
     *   serviceName,
     * );
     *
     * const headers = await broker.getServiceMetadata(
     *   providerAddress,
     *   serviceName,
     *   content,
     * );
     *
     * const openai = new OpenAI({
     *   baseURL: endpoint,
     *   apiKey: "",
     * });
     *
     * const completion = await openai.chat.completions.create(
     *   {
     *     messages: [{ role: "system", content }],
     *     model,
     *   },
     *   headers: {
     *     ...headers,
     *   },
     * );
     *
     * @throws An error if errors occur during the processing of the request.
     */
    getRequestHeaders: (providerAddress: string, svcName: string, content: string) => Promise<ServingRequestHeaders>;
    /**
     * processResponse is used after the user successfully obtains a response from the provider service.
     *
     * It will settle the fee for the response content. Additionally, if the service is verifiable,
     * input the chat ID from the response and processResponse will determine the validity of the
     * returned content by checking the provider service's response and corresponding signature associated
     * with the chat ID.
     *
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
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
    processResponse: (providerAddress: string, svcName: string, content: string, chatID?: string) => Promise<boolean | null>;
    /**
     * verifyService is used to verify the reliability of the service.
     *
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
     *
     * @returns A <boolean | null> value. True indicates the service is reliable, otherwise it is unreliable.
     *
     * @throws An error if errors occur during the verification process.
     */
    verifyService: (providerAddress: string, svcName: string) => Promise<boolean | null>;
    /**
     * getSignerRaDownloadLink returns the download link for the Signer RA.
     *
     * It can be provided to users who wish to manually verify the Signer RA.
     *
     * @param {string} providerAddress - provider address.
     * @param {string} svcName - service name.
     *
     * @returns Download link.
     */
    getSignerRaDownloadLink: (providerAddress: string, svcName: string) => Promise<string>;
    /**
     * getChatSignatureDownloadLink returns the download link for the signature of a single chat.
     *
     * It can be provided to users who wish to manually verify the content of a single chat.
     *
     * @param {string} providerAddress - provider address.
     * @param {string} svcName - service name.
     * @param {string} chatID - ID of the chat.
     *
     * @description To verify the chat signature, use the following code:
     *
     * ```typescript
     * const messageHash = ethers.hashMessage(messageToBeVerified)
     * const recoveredAddress = ethers.recoverAddress(messageHash, signature)
     * const isValid = recoveredAddress.toLowerCase() === signingAddress.toLowerCase()
     * ```
     *
     * @returns Download link.
     */
    getChatSignatureDownloadLink: (providerAddress: string, svcName: string, chatID: string) => Promise<string>;
    /**
     * settleFee is used to settle the fee for the provider service.
     *
     * Normally, the fee for each request will be automatically settled in processResponse.
     * However, if processResponse fails due to network issues or other reasons,
     * you can manually call settleFee to settle the fee.
     *
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
     * @param {number} fee - The fee to be settled. The unit of the fee is A0GI.
     *
     * @returns A promise that resolves when the fee settlement is successful.
     *
     * @throws An error if any issues occur during the fee settlement process.
     */
    settleFee: (providerAddress: string, svcName: string, fee: number) => Promise<void>;
}
/**
 * createZGServingNetworkBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
declare function createZGServingNetworkBroker(signer: JsonRpcSigner | Wallet, contractAddress?: string): Promise<ZGServingNetworkBroker>;

export { AccountProcessor, type AccountStructOutput, ModelProcessor, RequestProcessor, ResponseProcessor, type ServiceStructOutput, type ServingRequestHeaders, type SingerRAVerificationResult, Verifier, ZGServingNetworkBroker, createZGServingNetworkBroker };
