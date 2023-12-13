import { TransactionReceipt, JsonRpcProvider, InterfaceAbi, Interface, Contract, Wallet } from 'ethers';
export { ConfidentialComputeRequest, ConfidentialComputeRecord } from './confidential-types';
declare class RequestRecord {
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
declare class ConfidentialTransactionResponse {
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
export declare class SuaveProvider extends JsonRpcProvider {
    executionNode: string | null;
    constructor(url: string, executionNode?: string);
    getConfidentialTransaction(hash: string): Promise<ConfidentialTransactionResponse>;
}
export declare class SuaveWallet extends Wallet {
    sprovider: SuaveProvider;
    constructor(privateKey: string, provider?: SuaveProvider);
}
interface IDynamic {
    [key: string]: any;
}
export declare class SuaveContract implements IDynamic {
    [k: string]: any;
    wallet: SuaveWallet;
    inner: Contract;
    constructor(address: string, abi: Interface | InterfaceAbi, wallet: SuaveWallet);
    formatSubmissionError(error: any): void;
}
