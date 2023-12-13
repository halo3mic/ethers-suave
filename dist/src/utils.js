"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundleToBytes = exports.txToBundle = exports.txToBundleBytes = exports.removeLeadingZeros = exports.hexFillEven = exports.hexFill32 = exports.intToHex = exports.parseHexArg = exports.keccak256 = void 0;
const ethers_1 = require("ethers");
function keccak256(x) {
    return hexFill32(ethers_1.ethers.keccak256(x));
}
exports.keccak256 = keccak256;
function parseHexArg(arg) {
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
            if (ethers_1.ethers.isHexString(arg)) {
                return arg == '0x00' ? '0x' : hexFillEven(arg);
            }
            else {
                throw new Error(`Invalid hex string: ${arg}`);
            }
        default:
            return '0x';
    }
}
exports.parseHexArg = parseHexArg;
function intToHex(intVal) {
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
exports.intToHex = intToHex;
function hexFill32(hex) {
    return '0x' + hex.slice(2).padStart(64, '0');
}
exports.hexFill32 = hexFill32;
function hexFillEven(hex) {
    return hex.length % 2 ? '0x0' + hex.slice(2) : hex;
}
exports.hexFillEven = hexFillEven;
function removeLeadingZeros(hex) {
    return '0x' + hex.slice(2).replace(/^00+/, '');
}
exports.removeLeadingZeros = removeLeadingZeros;
function txToBundleBytes(signedTx) {
    return bundleToBytes(txToBundle(signedTx));
}
exports.txToBundleBytes = txToBundleBytes;
function txToBundle(signedTx) {
    return {
        txs: [signedTx],
        revertingHashes: [],
    };
}
exports.txToBundle = txToBundle;
function bundleToBytes(bundle) {
    const bundleBytes = Buffer.from(JSON.stringify(bundle), 'utf8');
    const confidentialDataBytes = ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['bytes'], [bundleBytes]);
    return confidentialDataBytes;
}
exports.bundleToBytes = bundleToBytes;
//# sourceMappingURL=utils.js.map