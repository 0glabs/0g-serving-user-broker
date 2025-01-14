import { DeferredTopicFilter, EventFragment, EventLog, ContractTransactionResponse, FunctionFragment, ContractTransaction, LogDescription, Typed, TransactionRequest, BaseContract, ContractRunner, Listener, AddressLike, BigNumberish, ContractMethod, Interface, BytesLike, Result, JsonRpcSigner, Wallet } from 'ethers';

interface TypedDeferredTopicFilter$1<_TCEvent extends TypedContractEvent$1> extends DeferredTopicFilter {
}
interface TypedContractEvent$1<InputTuple extends Array<any> = any, OutputTuple extends Array<any> = any, OutputObject = any> {
    (...args: Partial<InputTuple>): TypedDeferredTopicFilter$1<TypedContractEvent$1<InputTuple, OutputTuple, OutputObject>>;
    name: string;
    fragment: EventFragment;
    getFragment(...args: Partial<InputTuple>): EventFragment;
}
type __TypechainAOutputTuple$1<T> = T extends TypedContractEvent$1<infer _U, infer W> ? W : never;
type __TypechainOutputObject$1<T> = T extends TypedContractEvent$1<infer _U, infer _W, infer V> ? V : never;
interface TypedEventLog$1<TCEvent extends TypedContractEvent$1> extends Omit<EventLog, "args"> {
    args: __TypechainAOutputTuple$1<TCEvent> & __TypechainOutputObject$1<TCEvent>;
}
interface TypedLogDescription$1<TCEvent extends TypedContractEvent$1> extends Omit<LogDescription, "args"> {
    args: __TypechainAOutputTuple$1<TCEvent> & __TypechainOutputObject$1<TCEvent>;
}
type TypedListener$1<TCEvent extends TypedContractEvent$1> = (...listenerArg: [
    ...__TypechainAOutputTuple$1<TCEvent>,
    TypedEventLog$1<TCEvent>,
    ...undefined[]
]) => void;
type StateMutability$1 = "nonpayable" | "payable" | "view";
type BaseOverrides$1 = Omit<TransactionRequest, "to" | "data">;
type NonPayableOverrides$1 = Omit<BaseOverrides$1, "value" | "blockTag" | "enableCcipRead">;
type PayableOverrides$1 = Omit<BaseOverrides$1, "blockTag" | "enableCcipRead">;
type ViewOverrides$1 = Omit<TransactionRequest, "to" | "data">;
type Overrides$1<S extends StateMutability$1> = S extends "nonpayable" ? NonPayableOverrides$1 : S extends "payable" ? PayableOverrides$1 : ViewOverrides$1;
type PostfixOverrides$1<A extends Array<any>, S extends StateMutability$1> = A | [...A, Overrides$1<S>];
type ContractMethodArgs$1<A extends Array<any>, S extends StateMutability$1> = PostfixOverrides$1<{
    [I in keyof A]-?: A[I] | Typed;
}, S>;
type DefaultReturnType$1<R> = R extends Array<any> ? R[0] : R;
interface TypedContractMethod$1<A extends Array<any> = Array<any>, R = any, S extends StateMutability$1 = "payable"> {
    (...args: ContractMethodArgs$1<A, S>): S extends "view" ? Promise<DefaultReturnType$1<R>> : Promise<ContractTransactionResponse>;
    name: string;
    fragment: FunctionFragment;
    getFragment(...args: ContractMethodArgs$1<A, S>): FunctionFragment;
    populateTransaction(...args: ContractMethodArgs$1<A, S>): Promise<ContractTransaction>;
    staticCall(...args: ContractMethodArgs$1<A, "view">): Promise<DefaultReturnType$1<R>>;
    send(...args: ContractMethodArgs$1<A, S>): Promise<ContractTransactionResponse>;
    estimateGas(...args: ContractMethodArgs$1<A, S>): Promise<bigint>;
    staticCallResult(...args: ContractMethodArgs$1<A, "view">): Promise<R>;
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
type ServiceStructOutput$1 = [
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
interface InferenceServingInterface extends Interface {
    getFunction(nameOrSignature: "accountExists" | "addAccount" | "addOrUpdateService" | "batchVerifierAddress" | "deleteAccount" | "depositFund" | "getAccount" | "getAllAccounts" | "getAllServices" | "getService" | "initialize" | "initialized" | "ledgerAddress" | "lockTime" | "owner" | "processRefund" | "removeService" | "renounceOwnership" | "requestRefundAll" | "settleFees" | "transferOwnership" | "updateBatchVerifierAddress" | "updateLockTime"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "BalanceUpdated" | "OwnershipTransferred" | "RefundRequested" | "ServiceRemoved" | "ServiceUpdated"): EventFragment;
    encodeFunctionData(functionFragment: "accountExists", values: [AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "addAccount", values: [AddressLike, AddressLike, [BigNumberish, BigNumberish], string]): string;
    encodeFunctionData(functionFragment: "addOrUpdateService", values: [string, string, string, string, string, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "batchVerifierAddress", values?: undefined): string;
    encodeFunctionData(functionFragment: "deleteAccount", values: [AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "depositFund", values: [AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "getAccount", values: [AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "getAllAccounts", values?: undefined): string;
    encodeFunctionData(functionFragment: "getAllServices", values?: undefined): string;
    encodeFunctionData(functionFragment: "getService", values: [AddressLike, string]): string;
    encodeFunctionData(functionFragment: "initialize", values: [BigNumberish, AddressLike, AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "initialized", values?: undefined): string;
    encodeFunctionData(functionFragment: "ledgerAddress", values?: undefined): string;
    encodeFunctionData(functionFragment: "lockTime", values?: undefined): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "processRefund", values: [AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "removeService", values: [string]): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "requestRefundAll", values: [AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "settleFees", values: [VerifierInputStruct]): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "updateBatchVerifierAddress", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "updateLockTime", values: [BigNumberish]): string;
    decodeFunctionResult(functionFragment: "accountExists", data: BytesLike): Result;
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
    decodeFunctionResult(functionFragment: "ledgerAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lockTime", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "processRefund", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeService", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requestRefundAll", data: BytesLike): Result;
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
    type Event = TypedContractEvent$1<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter$1<Event>;
    type Log = TypedEventLog$1<Event>;
    type LogDescription = TypedLogDescription$1<Event>;
}
declare namespace OwnershipTransferredEvent$1 {
    type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
    type OutputTuple = [previousOwner: string, newOwner: string];
    interface OutputObject {
        previousOwner: string;
        newOwner: string;
    }
    type Event = TypedContractEvent$1<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter$1<Event>;
    type Log = TypedEventLog$1<Event>;
    type LogDescription = TypedLogDescription$1<Event>;
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
    type Event = TypedContractEvent$1<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter$1<Event>;
    type Log = TypedEventLog$1<Event>;
    type LogDescription = TypedLogDescription$1<Event>;
}
declare namespace ServiceRemovedEvent {
    type InputTuple = [service: AddressLike, name: string];
    type OutputTuple = [service: string, name: string];
    interface OutputObject {
        service: string;
        name: string;
    }
    type Event = TypedContractEvent$1<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter$1<Event>;
    type Log = TypedEventLog$1<Event>;
    type LogDescription = TypedLogDescription$1<Event>;
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
    type Event = TypedContractEvent$1<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter$1<Event>;
    type Log = TypedEventLog$1<Event>;
    type LogDescription = TypedLogDescription$1<Event>;
}
interface InferenceServing extends BaseContract {
    connect(runner?: ContractRunner | null): InferenceServing;
    waitForDeployment(): Promise<this>;
    interface: InferenceServingInterface;
    queryFilter<TCEvent extends TypedContractEvent$1>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog$1<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent$1>(filter: TypedDeferredTopicFilter$1<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog$1<TCEvent>>>;
    on<TCEvent extends TypedContractEvent$1>(event: TCEvent, listener: TypedListener$1<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent$1>(filter: TypedDeferredTopicFilter$1<TCEvent>, listener: TypedListener$1<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent$1>(event: TCEvent, listener: TypedListener$1<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent$1>(filter: TypedDeferredTopicFilter$1<TCEvent>, listener: TypedListener$1<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent$1>(event: TCEvent): Promise<Array<TypedListener$1<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent$1>(event?: TCEvent): Promise<this>;
    accountExists: TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike
    ], [
        boolean
    ], "view">;
    addAccount: TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike,
        signer: [BigNumberish, BigNumberish],
        additionalInfo: string
    ], [
        void
    ], "payable">;
    addOrUpdateService: TypedContractMethod$1<[
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
    batchVerifierAddress: TypedContractMethod$1<[], [string], "view">;
    deleteAccount: TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike
    ], [
        void
    ], "nonpayable">;
    depositFund: TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike
    ], [
        void
    ], "payable">;
    getAccount: TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike
    ], [
        AccountStructOutput
    ], "view">;
    getAllAccounts: TypedContractMethod$1<[], [AccountStructOutput[]], "view">;
    getAllServices: TypedContractMethod$1<[], [ServiceStructOutput$1[]], "view">;
    getService: TypedContractMethod$1<[
        provider: AddressLike,
        name: string
    ], [
        ServiceStructOutput$1
    ], "view">;
    initialize: TypedContractMethod$1<[
        _locktime: BigNumberish,
        _batchVerifierAddress: AddressLike,
        _ledgerAddress: AddressLike,
        owner: AddressLike
    ], [
        void
    ], "nonpayable">;
    initialized: TypedContractMethod$1<[], [boolean], "view">;
    ledgerAddress: TypedContractMethod$1<[], [string], "view">;
    lockTime: TypedContractMethod$1<[], [bigint], "view">;
    owner: TypedContractMethod$1<[], [string], "view">;
    processRefund: TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike
    ], [
        [
            bigint,
            bigint,
            bigint
        ] & {
            totalAmount: bigint;
            balance: bigint;
            pendingRefund: bigint;
        }
    ], "nonpayable">;
    removeService: TypedContractMethod$1<[name: string], [void], "nonpayable">;
    renounceOwnership: TypedContractMethod$1<[], [void], "nonpayable">;
    requestRefundAll: TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike
    ], [
        void
    ], "nonpayable">;
    settleFees: TypedContractMethod$1<[
        verifierInput: VerifierInputStruct
    ], [
        void
    ], "nonpayable">;
    transferOwnership: TypedContractMethod$1<[
        newOwner: AddressLike
    ], [
        void
    ], "nonpayable">;
    updateBatchVerifierAddress: TypedContractMethod$1<[
        _batchVerifierAddress: AddressLike
    ], [
        void
    ], "nonpayable">;
    updateLockTime: TypedContractMethod$1<[
        _locktime: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "accountExists"): TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "addAccount"): TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike,
        signer: [BigNumberish, BigNumberish],
        additionalInfo: string
    ], [
        void
    ], "payable">;
    getFunction(nameOrSignature: "addOrUpdateService"): TypedContractMethod$1<[
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
    getFunction(nameOrSignature: "batchVerifierAddress"): TypedContractMethod$1<[], [string], "view">;
    getFunction(nameOrSignature: "deleteAccount"): TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "depositFund"): TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike
    ], [
        void
    ], "payable">;
    getFunction(nameOrSignature: "getAccount"): TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike
    ], [
        AccountStructOutput
    ], "view">;
    getFunction(nameOrSignature: "getAllAccounts"): TypedContractMethod$1<[], [AccountStructOutput[]], "view">;
    getFunction(nameOrSignature: "getAllServices"): TypedContractMethod$1<[], [ServiceStructOutput$1[]], "view">;
    getFunction(nameOrSignature: "getService"): TypedContractMethod$1<[
        provider: AddressLike,
        name: string
    ], [
        ServiceStructOutput$1
    ], "view">;
    getFunction(nameOrSignature: "initialize"): TypedContractMethod$1<[
        _locktime: BigNumberish,
        _batchVerifierAddress: AddressLike,
        _ledgerAddress: AddressLike,
        owner: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "initialized"): TypedContractMethod$1<[], [boolean], "view">;
    getFunction(nameOrSignature: "ledgerAddress"): TypedContractMethod$1<[], [string], "view">;
    getFunction(nameOrSignature: "lockTime"): TypedContractMethod$1<[], [bigint], "view">;
    getFunction(nameOrSignature: "owner"): TypedContractMethod$1<[], [string], "view">;
    getFunction(nameOrSignature: "processRefund"): TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike
    ], [
        [
            bigint,
            bigint,
            bigint
        ] & {
            totalAmount: bigint;
            balance: bigint;
            pendingRefund: bigint;
        }
    ], "nonpayable">;
    getFunction(nameOrSignature: "removeService"): TypedContractMethod$1<[name: string], [void], "nonpayable">;
    getFunction(nameOrSignature: "renounceOwnership"): TypedContractMethod$1<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "requestRefundAll"): TypedContractMethod$1<[
        user: AddressLike,
        provider: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "settleFees"): TypedContractMethod$1<[
        verifierInput: VerifierInputStruct
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "transferOwnership"): TypedContractMethod$1<[newOwner: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "updateBatchVerifierAddress"): TypedContractMethod$1<[
        _batchVerifierAddress: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "updateLockTime"): TypedContractMethod$1<[_locktime: BigNumberish], [void], "nonpayable">;
    getEvent(key: "BalanceUpdated"): TypedContractEvent$1<BalanceUpdatedEvent.InputTuple, BalanceUpdatedEvent.OutputTuple, BalanceUpdatedEvent.OutputObject>;
    getEvent(key: "OwnershipTransferred"): TypedContractEvent$1<OwnershipTransferredEvent$1.InputTuple, OwnershipTransferredEvent$1.OutputTuple, OwnershipTransferredEvent$1.OutputObject>;
    getEvent(key: "RefundRequested"): TypedContractEvent$1<RefundRequestedEvent.InputTuple, RefundRequestedEvent.OutputTuple, RefundRequestedEvent.OutputObject>;
    getEvent(key: "ServiceRemoved"): TypedContractEvent$1<ServiceRemovedEvent.InputTuple, ServiceRemovedEvent.OutputTuple, ServiceRemovedEvent.OutputObject>;
    getEvent(key: "ServiceUpdated"): TypedContractEvent$1<ServiceUpdatedEvent.InputTuple, ServiceUpdatedEvent.OutputTuple, ServiceUpdatedEvent.OutputObject>;
    filters: {
        "BalanceUpdated(address,address,uint256,uint256)": TypedContractEvent$1<BalanceUpdatedEvent.InputTuple, BalanceUpdatedEvent.OutputTuple, BalanceUpdatedEvent.OutputObject>;
        BalanceUpdated: TypedContractEvent$1<BalanceUpdatedEvent.InputTuple, BalanceUpdatedEvent.OutputTuple, BalanceUpdatedEvent.OutputObject>;
        "OwnershipTransferred(address,address)": TypedContractEvent$1<OwnershipTransferredEvent$1.InputTuple, OwnershipTransferredEvent$1.OutputTuple, OwnershipTransferredEvent$1.OutputObject>;
        OwnershipTransferred: TypedContractEvent$1<OwnershipTransferredEvent$1.InputTuple, OwnershipTransferredEvent$1.OutputTuple, OwnershipTransferredEvent$1.OutputObject>;
        "RefundRequested(address,address,uint256,uint256)": TypedContractEvent$1<RefundRequestedEvent.InputTuple, RefundRequestedEvent.OutputTuple, RefundRequestedEvent.OutputObject>;
        RefundRequested: TypedContractEvent$1<RefundRequestedEvent.InputTuple, RefundRequestedEvent.OutputTuple, RefundRequestedEvent.OutputObject>;
        "ServiceRemoved(address,string)": TypedContractEvent$1<ServiceRemovedEvent.InputTuple, ServiceRemovedEvent.OutputTuple, ServiceRemovedEvent.OutputObject>;
        ServiceRemoved: TypedContractEvent$1<ServiceRemovedEvent.InputTuple, ServiceRemovedEvent.OutputTuple, ServiceRemovedEvent.OutputObject>;
        "ServiceUpdated(address,string,string,string,uint256,uint256,uint256,string,string)": TypedContractEvent$1<ServiceUpdatedEvent.InputTuple, ServiceUpdatedEvent.OutputTuple, ServiceUpdatedEvent.OutputObject>;
        ServiceUpdated: TypedContractEvent$1<ServiceUpdatedEvent.InputTuple, ServiceUpdatedEvent.OutputTuple, ServiceUpdatedEvent.OutputObject>;
    };
}

declare class InferenceServingContract {
    serving: InferenceServing;
    signer: JsonRpcSigner | Wallet;
    private _userAddress;
    constructor(signer: JsonRpcSigner | Wallet, contractAddress: string, userAddress: string);
    lockTime(): Promise<bigint>;
    listService(): Promise<ServiceStructOutput$1[]>;
    listAccount(): Promise<AccountStructOutput[]>;
    getAccount(provider: AddressLike): Promise<AccountStructOutput>;
    deleteAccount(provider: AddressLike): Promise<void>;
    addOrUpdateService(name: string, serviceType: string, url: string, model: string, verifiability: string, inputPrice: BigNumberish, outputPrice: BigNumberish): Promise<void>;
    addAccount(providerAddress: AddressLike, signer: [BigNumberish, BigNumberish], balance: bigint, settleSignerEncryptedPrivateKey: string): Promise<void>;
    depositFund(providerAddress: AddressLike, balance: string): Promise<void>;
    getService(providerAddress: string, svcName: string): Promise<ServiceStructOutput$1>;
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

declare abstract class Extractor {
    abstract getSvcInfo(): Promise<ServiceStructOutput$1>;
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
    ]): ServiceStructOutput$1;
}

declare abstract class ZGServingUserBrokerBase {
    protected contract: InferenceServingContract;
    protected metadata: Metadata;
    protected cache: Cache;
    constructor(contract: InferenceServingContract, metadata: Metadata, cache: Cache);
    protected getProviderData(providerAddress: string): Promise<{
        settleSignerPrivateKey: bigint[] | null;
    }>;
    protected getService(providerAddress: string, svcName: string, useCache?: boolean): Promise<ServiceStructOutput$1>;
    protected getExtractor(providerAddress: string, svcName: string, useCache?: boolean): Promise<Extractor>;
    protected createExtractor(svc: ServiceStructOutput$1): Extractor;
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
    constructor(contract: InferenceServingContract, metadata: Metadata, cache: Cache);
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
    listService(): Promise<ServiceStructOutput$1[]>;
}

declare class InferenceBroker {
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
    listService: () => Promise<ServiceStructOutput$1[]>;
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
 * createInferenceBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
declare function createInferenceBroker(signer: JsonRpcSigner | Wallet, contractAddress?: string): Promise<InferenceBroker>;

type QuotaStructOutput = [
    cpuCount: bigint,
    nodeMemory: bigint,
    gpuCount: bigint,
    nodeStorage: bigint,
    gpuType: string
] & {
    cpuCount: bigint;
    nodeMemory: bigint;
    gpuCount: bigint;
    nodeStorage: bigint;
    gpuType: string;
};
type ServiceStructOutput = [
    provider: string,
    name: string,
    url: string,
    quota: QuotaStructOutput,
    pricePerToken: bigint,
    providerSigner: string,
    occupied: boolean
] & {
    provider: string;
    name: string;
    url: string;
    quota: QuotaStructOutput;
    pricePerToken: bigint;
    providerSigner: string;
    occupied: boolean;
};

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

type LedgerStructOutput = [
    user: string,
    availableBalance: bigint,
    totalBalance: bigint,
    inferenceSigner: [bigint, bigint],
    additionalInfo: string,
    inferenceProviders: string[],
    fineTuningProviders: string[]
] & {
    user: string;
    availableBalance: bigint;
    totalBalance: bigint;
    inferenceSigner: [bigint, bigint];
    additionalInfo: string;
    inferenceProviders: string[];
    fineTuningProviders: string[];
};
interface LedgerManagerInterface extends Interface {
    getFunction(nameOrSignature: "addLedger" | "deleteLedger" | "depositFund" | "fineTuningAddress" | "getAllLedgers" | "getLedger" | "inferenceAddress" | "initialize" | "initialized" | "owner" | "refund" | "renounceOwnership" | "retrieveFund" | "spendFund" | "transferFund" | "transferOwnership"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
    encodeFunctionData(functionFragment: "addLedger", values: [[BigNumberish, BigNumberish], string]): string;
    encodeFunctionData(functionFragment: "deleteLedger", values?: undefined): string;
    encodeFunctionData(functionFragment: "depositFund", values?: undefined): string;
    encodeFunctionData(functionFragment: "fineTuningAddress", values?: undefined): string;
    encodeFunctionData(functionFragment: "getAllLedgers", values?: undefined): string;
    encodeFunctionData(functionFragment: "getLedger", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "inferenceAddress", values?: undefined): string;
    encodeFunctionData(functionFragment: "initialize", values: [AddressLike, AddressLike, AddressLike]): string;
    encodeFunctionData(functionFragment: "initialized", values?: undefined): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "refund", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "retrieveFund", values: [AddressLike[], string]): string;
    encodeFunctionData(functionFragment: "spendFund", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "transferFund", values: [AddressLike, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [AddressLike]): string;
    decodeFunctionResult(functionFragment: "addLedger", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deleteLedger", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "depositFund", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "fineTuningAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAllLedgers", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getLedger", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "inferenceAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "initialized", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "refund", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "retrieveFund", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "spendFund", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferFund", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
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
interface LedgerManager extends BaseContract {
    connect(runner?: ContractRunner | null): LedgerManager;
    waitForDeployment(): Promise<this>;
    interface: LedgerManagerInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    addLedger: TypedContractMethod<[
        inferenceSigner: [BigNumberish, BigNumberish],
        additionalInfo: string
    ], [
        [bigint, bigint]
    ], "payable">;
    deleteLedger: TypedContractMethod<[], [void], "nonpayable">;
    depositFund: TypedContractMethod<[], [void], "payable">;
    fineTuningAddress: TypedContractMethod<[], [string], "view">;
    getAllLedgers: TypedContractMethod<[], [LedgerStructOutput[]], "view">;
    getLedger: TypedContractMethod<[
        user: AddressLike
    ], [
        LedgerStructOutput
    ], "view">;
    inferenceAddress: TypedContractMethod<[], [string], "view">;
    initialize: TypedContractMethod<[
        _inferenceAddress: AddressLike,
        _fineTuningAddress: AddressLike,
        owner: AddressLike
    ], [
        void
    ], "nonpayable">;
    initialized: TypedContractMethod<[], [boolean], "view">;
    owner: TypedContractMethod<[], [string], "view">;
    refund: TypedContractMethod<[amount: BigNumberish], [void], "nonpayable">;
    renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;
    retrieveFund: TypedContractMethod<[
        providers: AddressLike[],
        serviceType: string
    ], [
        void
    ], "nonpayable">;
    spendFund: TypedContractMethod<[
        user: AddressLike,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    transferFund: TypedContractMethod<[
        provider: AddressLike,
        serviceTypeStr: string,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    transferOwnership: TypedContractMethod<[
        newOwner: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "addLedger"): TypedContractMethod<[
        inferenceSigner: [BigNumberish, BigNumberish],
        additionalInfo: string
    ], [
        [bigint, bigint]
    ], "payable">;
    getFunction(nameOrSignature: "deleteLedger"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "depositFund"): TypedContractMethod<[], [void], "payable">;
    getFunction(nameOrSignature: "fineTuningAddress"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getAllLedgers"): TypedContractMethod<[], [LedgerStructOutput[]], "view">;
    getFunction(nameOrSignature: "getLedger"): TypedContractMethod<[user: AddressLike], [LedgerStructOutput], "view">;
    getFunction(nameOrSignature: "inferenceAddress"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "initialize"): TypedContractMethod<[
        _inferenceAddress: AddressLike,
        _fineTuningAddress: AddressLike,
        owner: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "initialized"): TypedContractMethod<[], [boolean], "view">;
    getFunction(nameOrSignature: "owner"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "refund"): TypedContractMethod<[amount: BigNumberish], [void], "nonpayable">;
    getFunction(nameOrSignature: "renounceOwnership"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "retrieveFund"): TypedContractMethod<[
        providers: AddressLike[],
        serviceType: string
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "spendFund"): TypedContractMethod<[
        user: AddressLike,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "transferFund"): TypedContractMethod<[
        provider: AddressLike,
        serviceTypeStr: string,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "transferOwnership"): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
    getEvent(key: "OwnershipTransferred"): TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
    filters: {
        "OwnershipTransferred(address,address)": TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
        OwnershipTransferred: TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
    };
}

declare class LedgerManagerContract {
    ledger: LedgerManager;
    signer: JsonRpcSigner | Wallet;
    private _userAddress;
    constructor(signer: JsonRpcSigner | Wallet, contractAddress: string, userAddress: string);
    addLedger(signer: [BigNumberish, BigNumberish], balance: bigint, settleSignerEncryptedPrivateKey: string): Promise<void>;
    listLedger(): Promise<LedgerStructOutput[]>;
    getLedger(): Promise<LedgerStructOutput>;
    depositFund(balance: string): Promise<void>;
    refund(amount: BigNumberish): Promise<void>;
    transferFund(provider: AddressLike, serviceTypeStr: 'inference' | 'fine-tuning', amount: BigNumberish): Promise<void>;
    retrieveFund(providers: AddressLike[], serviceTypeStr: 'inference' | 'fine-tuning'): Promise<void>;
    deleteLedger(): Promise<void>;
    getUserAddress(): string;
}

/**
 * LedgerProcessor contains methods for creating, depositing funds, and retrieving 0G Compute Network Ledgers.
 */
declare class LedgerProcessor {
    protected ledgerContract: LedgerManagerContract;
    protected metadata: Metadata;
    constructor(ledgerContract: LedgerManagerContract, metadata: Metadata);
    getLedger(): Promise<LedgerStructOutput>;
    listLedger(): Promise<LedgerStructOutput[]>;
    addLedger(balance: number): Promise<void>;
    deleteLedger(): Promise<void>;
    depositFund(balance: number): Promise<void>;
    refund(balance: number): Promise<void>;
    transferFund(to: AddressLike, serviceTypeStr: 'inference' | 'fine-tuning', balance: number): Promise<void>;
    retrieveFund(providers: AddressLike[], serviceTypeStr: 'inference' | 'fine-tuning'): Promise<void>;
    private createSettleSignerKey;
    protected a0giToNeuron(value: number): bigint;
    protected neuronToA0gi(value: bigint): number;
}

declare class LedgerBroker {
    ledger: LedgerProcessor;
    private signer;
    private ledgerCA;
    constructor(signer: JsonRpcSigner | Wallet, ledgerCA: string);
    initialize(): Promise<void>;
    /**
     * Adds a new ledger to the contract.
     *
     * @param {number} balance - The initial balance to be assigned to the new ledger. Units are in A0GI.
     *
     * @throws  An error if the ledger creation fails.
     *
     * @remarks
     * When creating an ledger, a key pair is also created to sign the request.
     */
    addLedger: (balance: number) => Promise<void>;
    /**
     * Retrieves the ledger information for current wallet address.
     *
     * @returns A promise that resolves to the ledger information.
     *
     * @throws Will throw an error if the ledger retrieval process fails.
     */
    getLedger: () => Promise<LedgerStructOutput>;
    /**
     * Deposits a specified amount of funds into Ledger corresponding to the current wallet address.
     *
     * @param {string} amount - The amount of funds to be deposited. Units are in A0GI.
     * @throws  An error if the deposit fails.
     */
    depositFund: (amount: number) => Promise<void>;
    /**
     * Refunds a specified amount using the ledger.
     *
     * @param amount - The amount to be refunded.
     * @returns A promise that resolves when the refund is processed.
     * @throws Will throw an error if the refund process fails.
     *
     * @note The amount should be a positive number.
     */
    refund: (amount: number) => Promise<void>;
    /**
     * Transfers a specified amount of funds to a provider for a given service type.
     *
     * @param provider - The address of the provider to whom the funds are being transferred.
     * @param serviceTypeStr - The type of service for which the funds are being transferred.
     *                         It can be either 'inference' or 'fine-tuning'.
     * @param amount - The amount of funds to be transferred. Units are in A0GI.
     * @returns A promise that resolves with the result of the fund transfer operation.
     * @throws Will throw an error if the fund transfer operation fails.
     */
    transferFund: (provider: AddressLike, serviceTypeStr: "inference" | "fine-tuning", amount: number) => Promise<void>;
    /**
     * Retrieves funds from the ledger for the specified providers and service type.
     *
     * @param providers - An array of addresses representing the providers.
     * @param serviceTypeStr - The type of service for which the funds are being retrieved.
     *                         It can be either 'inference' or 'fine-tuning'.
     * @returns A promise that resolves with the result of the fund retrieval operation.
     * @throws Will throw an error if the fund retrieval operation fails.
     */
    retrieveFund: (providers: AddressLike[], serviceTypeStr: "inference" | "fine-tuning") => Promise<void>;
    /**
     * Deletes the ledger corresponding to the current wallet address.
     *
     * @throws  An error if the deletion fails.
     */
    deleteLedger: () => Promise<void>;
}
/**
 * createLedgerBroker is used to initialize LedgerBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - Ledger contract address, use default address if not provided.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
declare function createLedgerBroker(signer: JsonRpcSigner | Wallet, contractAddress?: string): Promise<LedgerBroker>;

declare class FineTuningBroker {
    private signer;
    private fineTuningCA;
    private ledger;
    private modelProcessor;
    private serviceProcessor;
    constructor(signer: JsonRpcSigner | Wallet, fineTuningCA: string, ledger: LedgerBroker);
    initialize(): Promise<void>;
    listService: () => Promise<ServiceStructOutput[]>;
    acknowledgeProviderSigner: () => Promise<void>;
    uploadDataset: () => Promise<string>;
    createTask: () => Promise<void>;
    getTaskProgress: () => Promise<string>;
    acknowledgeModel: () => Promise<void>;
    decryptModel: () => Promise<void>;
}
/**
 * createFineTuningBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
declare function createFineTuningBroker(signer: JsonRpcSigner | Wallet, contractAddress: string | undefined, ledger: LedgerBroker): Promise<FineTuningBroker>;

declare class ZGComputeNetworkBroker {
    ledger: LedgerBroker;
    inference: InferenceBroker;
    fineTuning: FineTuningBroker;
    constructor(ledger: LedgerBroker, inferenceBroker: InferenceBroker, fineTuningBroker: FineTuningBroker);
}
/**
 * createZGComputeNetworkBroker is used to initialize ZGComputeNetworkBroker
 *
 * @param signer - Signer from ethers.js.
 * @param ledgerCA - 0G Compute Network Ledger Contact address, use default address if not provided.
 * @param inferenceCA - 0G Compute Network Inference Serving contract address, use default address if not provided.
 * @param fineTuningCA - 0G Compute Network Fine Tuning Serving contract address, use default address if not provided.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
declare function createZGComputeNetworkBroker(signer: JsonRpcSigner | Wallet, ledgerCA?: string, inferenceCA?: string, fineTuningCA?: string): Promise<ZGComputeNetworkBroker>;

export { FineTuningBroker, type ServiceStructOutput as FineTuningServiceStructOutput, AccountProcessor as InferenceAccountProcessor, type AccountStructOutput as InferenceAccountStructOutput, InferenceBroker, ModelProcessor as InferenceModelProcessor, RequestProcessor as InferenceRequestProcessor, ResponseProcessor as InferenceResponseProcessor, type ServiceStructOutput$1 as InferenceServiceStructOutput, type ServingRequestHeaders as InferenceServingRequestHeaders, type SingerRAVerificationResult as InferenceSingerRAVerificationResult, Verifier as InferenceVerifier, LedgerBroker, ZGComputeNetworkBroker, createFineTuningBroker, createInferenceBroker, createLedgerBroker, createZGComputeNetworkBroker };
