import { Wallet, BigNumberish, Signature } from 'ethers';
export declare class ConfidentialComputeRequest {
    #private;
    confidentialComputeRecord: ConfidentialComputeRecord;
    readonly confidentialInputs: string;
    constructor(confidentialComputeRecord: ConfidentialComputeRecord, confidentialInputs?: string);
    signWithAsyncCallback(callback: (hash: string) => Promise<Signature>, useEIP712?: boolean): Promise<ConfidentialComputeRequest>;
    signWithCallback(callback: (hash: string) => Signature, useEIP712?: boolean): ConfidentialComputeRequest;
    signWithWallet(wallet: Wallet, useEIP712?: boolean): ConfidentialComputeRequest;
    signWithPK(pk: string, useEIP712?: boolean): ConfidentialComputeRequest;
    rlpEncode(): string;
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
    hash(): string;
    eip712Hash(): string;
}
type SigSplit = {
    r: string;
    s: string;
    v: number;
};
export {};
