import { BigNumberish } from 'ethers';
export interface IBundle {
    txs: Array<string>;
    revertingHashes: Array<string>;
}
export declare function keccak256(x: string): string;
export declare function parseHexArg(arg: null | BigNumberish): string;
export declare function intToHex(intVal: number | bigint): string;
export declare function hexFill32(hex: string): string;
export declare function hexFillEven(hex: string): string;
export declare function removeLeadingZeros(hex: string): string;
export declare function txToBundleBytes(signedTx: string): string;
export declare function txToBundle(signedTx: string): IBundle;
export declare function bundleToBytes(bundle: IBundle): string;
