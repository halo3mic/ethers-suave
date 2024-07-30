import { Wallet, BigNumberish, Signature } from 'ethers';
export declare class ConfidentialComputeRequest {
    #private;
    confidentialComputeRecord: ConfidentialComputeRecord;
    readonly confidentialInputs: string;
    constructor(confidentialComputeRecord: ConfidentialComputeRecord, confidentialInputs?: string);
    rlpEncode(): string;
    signWithAsyncCallback(callback: (hash: string) => Promise<Signature>): Promise<ConfidentialComputeRequest>;
    signWithCallback(callback: (hash: string) => Signature): ConfidentialComputeRequest;
    signWithWallet(wallet: Wallet): ConfidentialComputeRequest;
    signWithPK(pk: string): ConfidentialComputeRequest;
}
export interface CRecordLike {
    to?: string;
    value?: BigNumberish;
    data?: string;
    isEIP712?: boolean;
    gas?: BigNumberish;
    nonce?: number;
    gasPrice?: BigNumberish;
    kettleAddress?: string;
    chainId?: BigNumberish;
}
export declare class ConfidentialComputeRecord {
    #private;
    readonly to: string;
    readonly value: BigNumberish;
    readonly data: string;
    readonly isEIP712: boolean;
    readonly gas: BigNumberish;
    readonly nonce: number;
    readonly gasPrice: BigNumberish;
    readonly kettleAddress: string;
    readonly chainId: BigNumberish;
    confidentialInputsHash: null | string;
    signature: null | SigSplit;
    constructor(crecord: CRecordLike);
    checkFields(keys: Array<string>): void;
}
type SigSplit = {
    r: string;
    s: string;
    v: number;
};
export {};
