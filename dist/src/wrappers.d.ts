import { TransactionReceipt, JsonRpcProvider, InterfaceAbi, Interface, Contract, Wallet, BaseContract, ContractRunner } from 'ethers';
export declare class SuaveProvider extends JsonRpcProvider {
    #private;
    constructor(url: string);
    getConfidentialTransaction(hash: string): Promise<ConfidentialTransactionResponse>;
    getKettleAddress(): Promise<string>;
    setKettleAddress(address: string): void;
}
export declare class SuaveWallet extends Wallet {
    sprovider: SuaveProvider;
    constructor(privateKey: string, provider?: SuaveProvider);
    static random(provider?: SuaveProvider): SuaveWallet;
    static fromWallet(wallet: Wallet, provider?: SuaveProvider): SuaveWallet;
}
export declare class SuaveContract extends BaseContract {
    #private;
    [k: string]: any;
    runner: ContractRunner;
    inner: Contract;
    constructor(address: string, abi: Interface | InterfaceAbi, runner: ContractRunner);
    connect(wallet: SuaveWallet): SuaveContract;
    attach(address: string): SuaveContract;
}
export declare class ConfidentialTransactionResponse {
    #private;
    readonly blockNumber: number;
    readonly blockHash: string;
    readonly transactionIndex: number;
    readonly hash: string;
    readonly type: number;
    readonly to: string;
    readonly from: string;
    readonly nonce: number;
    readonly gas: number;
    readonly gasPrice: bigint;
    readonly input: string;
    readonly value: bigint;
    readonly chainId: bigint;
    readonly v: number;
    readonly r: string;
    readonly s: string;
    readonly requestRecord: RequestRecord;
    readonly confidentialComputeResult: string;
    constructor(rawJson: {
        [k: string]: any;
    }, provider: SuaveProvider);
    wait(confirmations?: number, timeout?: number): Promise<TransactionReceipt>;
}
export declare class RequestRecord {
    readonly chainId: bigint;
    readonly confidentialInputsHash: string;
    readonly gas: number;
    readonly gasPrice: bigint;
    readonly hash: string;
    readonly input: string;
    readonly kettleAddress: string;
    readonly maxFeePerGas: bigint | null;
    readonly maxPriorityFeePerGas: bigint | null;
    readonly nonce: number;
    readonly r: string;
    readonly s: string;
    readonly to: string;
    readonly type: number;
    readonly v: number;
    readonly value: bigint;
    constructor(rawJson: {
        [k: string]: string;
    });
}
