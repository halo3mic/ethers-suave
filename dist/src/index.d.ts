export { ConfidentialTransactionResponse, RequestRecord, SuaveContract, SuaveProvider, SuaveWallet, } from './wrappers';
export { ConfidentialComputeRequest, ConfidentialComputeRecord } from './confidential-types';
import { txToBundleBytes, bundleToBytes } from './utils';
export declare const utils: {
    txToBundleBytes: typeof txToBundleBytes;
    bundleToBytes: typeof bundleToBytes;
};
