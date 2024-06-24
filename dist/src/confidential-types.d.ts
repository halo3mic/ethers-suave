import { Wallet, BigNumberish, Signature } from 'ethers';
export declare class ConfidentialComputeRequest {
    #private;
    readonly confidentialComputeRecord: ConfidentialComputeRecord;
    readonly confidentialInputs: string;
    constructor(confidentialComputeRecord: ConfidentialComputeRecord, confidentialInputs?: string);
    rlpEncode(): string;
    signWithAsyncCallback(callback: (hash: string) => Promise<Signature>): Promise<ConfidentialComputeRequest>;
    signWithCallback(callback: (hash: string) => Signature): ConfidentialComputeRequest;
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
    kettleAddress?: string;
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
    readonly kettleAddress: string;
    readonly chainId: BigNumberish;
    confidentialInputsHash: null | string;
    v: null | BigNumberish;
    r: null | BigNumberish;
    s: null | BigNumberish;
    constructor(transaction: any, kettleAddress: string, overrides?: CCROverrides);
}
export type SigSplit = {
    r: string;
    s: string;
    v: number;
};
export {};
