import { Wallet, BigNumberish } from 'ethers';
export declare class ConfidentialComputeRequest {
    #private;
    readonly confidentialComputeRecord: ConfidentialComputeRecord;
    readonly confidentialInputs: string;
    constructor(confidentialComputeRecord: ConfidentialComputeRecord, confidentialInputs?: string);
    rlpEncode(): string;
    signWithAsyncCallback(callback: (hash: string) => Promise<SigSplit>): Promise<ConfidentialComputeRequest>;
    signWithCallback(callback: (hash: string) => SigSplit): ConfidentialComputeRequest;
    signWithWallet(wallet: Wallet): ConfidentialComputeRequest;
    signWithPK(pk: string): ConfidentialComputeRequest;
}
interface CCROverrides {
    nonce?: number;
    gasPrice?: BigNumberish;
    gas?: BigNumberish;
    to?: string;
    value?: BigNumberish;
    data?: string;
    chainId?: BigNumberish;
    confidentialInputsHash?: string;
    executionNode?: string;
    v?: BigNumberish;
    r?: BigNumberish;
    s?: BigNumberish;
}
export declare class ConfidentialComputeRecord {
    #private;
    readonly nonce: number;
    readonly to: string;
    readonly gas: BigNumberish;
    readonly gasPrice: BigNumberish;
    readonly value: BigNumberish;
    readonly data: string;
    readonly executionNode: string;
    readonly chainId: BigNumberish;
    confidentialInputsHash: null | string;
    v: null | BigNumberish;
    r: null | BigNumberish;
    s: null | BigNumberish;
    constructor(transaction: any, executionNode: string, overrides?: CCROverrides);
}
export type SigSplit = {
    r: string;
    s: string;
    v: number;
};
export {};
