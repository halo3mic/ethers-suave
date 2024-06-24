import { ConfidentialComputeRequest } from './confidential-types';
import { JsonRpcApiProvider, TransactionReceipt, JsonRpcProvider, AbstractSigner, BrowserProvider, Eip1193Provider, JsonRpcSigner, InterfaceAbi, BaseContract, Interface, Contract, Wallet } from 'ethers';
export declare abstract class SuaveProvider extends JsonRpcApiProvider {
    abstract getConfidentialTransaction(hash: string): Promise<ConfidentialTransactionResponse>;
    abstract getKettleAddress(): Promise<string>;
    abstract setKettleAddress(address: string): void;
}
export declare class SuaveJsonRpcProvider extends JsonRpcProvider implements SuaveProvider {
    #private;
    constructor(url: string);
    setKettleAddress(address: string): void;
    getConfidentialTransaction(hash: string): Promise<ConfidentialTransactionResponse>;
    getKettleAddress(): Promise<string>;
}
export declare class SuaveBrowserProvider extends BrowserProvider implements SuaveProvider {
    #private;
    constructor(ethereum: Eip1193Provider);
    setKettleAddress(address: string): void;
    getConfidentialTransaction(hash: string): Promise<ConfidentialTransactionResponse>;
    getKettleAddress(): Promise<string>;
}
export declare abstract class SuaveSigner extends AbstractSigner {
    abstract sprovider: SuaveProvider;
    abstract signCCR(ccr: ConfidentialComputeRequest): Promise<ConfidentialComputeRequest>;
}
export declare class SuaveWallet extends Wallet implements SuaveSigner {
    sprovider: SuaveProvider;
    constructor(privateKey: string, provider?: SuaveProvider);
    static random(provider?: SuaveProvider): SuaveWallet;
    static fromWallet(wallet: Wallet, provider?: SuaveProvider): SuaveWallet;
    signCCR(ccr: ConfidentialComputeRequest): Promise<ConfidentialComputeRequest>;
}
export declare class SuaveRpcSigner extends JsonRpcSigner implements SuaveSigner {
    sprovider: SuaveBrowserProvider;
    constructor(provider: SuaveBrowserProvider, address: string);
    signCCR(ccr: ConfidentialComputeRequest): Promise<ConfidentialComputeRequest>;
}
type SuaveContractRunner = SuaveWallet | SuaveRpcSigner | SuaveBrowserProvider | SuaveJsonRpcProvider;
export declare class SuaveContract extends BaseContract {
    #private;
    [k: string]: any;
    inner: Contract;
    constructor(address: string, abi: Interface | InterfaceAbi, runner: SuaveContractRunner);
    connect(wallet: SuaveWallet): SuaveContract;
    attach(address: string): SuaveContract;
    formatSubmissionError(error: any): string;
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
export {};
