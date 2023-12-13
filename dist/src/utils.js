import { ethers } from 'ethers';
export function keccak256(x) {
    return hexFill32(ethers.keccak256(x));
}
export function parseHexArg(arg) {
    if (!arg) {
        return '0x';
    }
    if (typeof arg === 'object' && 'toHexString' in arg) {
        arg = arg.toHexString();
    }
    switch (typeof arg) {
        case 'number':
        case 'bigint':
            return intToHex(arg);
        case 'string':
            if (ethers.isHexString(arg)) {
                return arg == '0x00' ? '0x' : hexFillEven(arg);
            }
            else {
                throw new Error(`Invalid hex string: ${arg}`);
            }
        default:
            return '0x';
    }
}
export function intToHex(intVal) {
    let hex = intVal.toString(16);
    hex = hex.split('.')[0];
    if (hex === '0') {
        return '0x';
    }
    if (hex.length % 2) {
        hex = '0' + hex;
    }
    return '0x' + hex;
}
export function hexFill32(hex) {
    return '0x' + hex.slice(2).padStart(64, '0');
}
export function hexFillEven(hex) {
    return hex.length % 2 ? '0x0' + hex.slice(2) : hex;
}
export function removeLeadingZeros(hex) {
    return '0x' + hex.slice(2).replace(/^00+/, '');
}
export function txToBundleBytes(signedTx) {
    return bundleToBytes(txToBundle(signedTx));
}
export function txToBundle(signedTx) {
    return {
        txs: [signedTx],
        revertingHashes: [],
    };
}
export function bundleToBytes(bundle) {
    const bundleBytes = Buffer.from(JSON.stringify(bundle), 'utf8');
    const confidentialDataBytes = ethers.AbiCoder.defaultAbiCoder().encode(['bytes'], [bundleBytes]);
    return confidentialDataBytes;
}
//# sourceMappingURL=utils.js.map