"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ConfidentialComputeRequest_instances, _ConfidentialComputeRequest_hash, _ConfidentialComputeRecord_instances, _ConfidentialComputeRecord_checkField;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfidentialComputeRecord = exports.ConfidentialComputeRequest = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
const const_1 = require("./const");
class ConfidentialComputeRequest {
    constructor(confidentialComputeRecord, confidentialInputs = '0x') {
        _ConfidentialComputeRequest_instances.add(this);
        this.confidentialComputeRecord = confidentialComputeRecord;
        this.confidentialInputs = confidentialInputs;
    }
    rlpEncode() {
        const crecord = this.confidentialComputeRecord;
        crecord.checkFields(['confidentialInputsHash', 'signature']);
        const elements = [
            [
                crecord.nonce,
                crecord.gasPrice,
                crecord.gas,
                crecord.to,
                crecord.value,
                crecord.data,
                crecord.kettleAddress,
                crecord.confidentialInputsHash,
                crecord.isEIP712,
                crecord.chainId,
                crecord.signature.v,
                crecord.signature.r,
                crecord.signature.s,
            ].map(utils_1.parseHexArg),
            this.confidentialInputs,
        ];
        const rlpEncoded = ethers_1.ethers.encodeRlp(elements).slice(2);
        const encodedWithPrefix = const_1.CONFIDENTIAL_COMPUTE_REQUEST_TYPE + rlpEncoded;
        return encodedWithPrefix;
    }
    async signWithAsyncCallback(callback) {
        return callback(__classPrivateFieldGet(this, _ConfidentialComputeRequest_instances, "m", _ConfidentialComputeRequest_hash).call(this)).then((sig) => {
            this.confidentialComputeRecord.signature = parseSignature(sig);
            return this;
        });
    }
    signWithCallback(callback) {
        this.confidentialComputeRecord.signature = parseSignature(callback(__classPrivateFieldGet(this, _ConfidentialComputeRequest_instances, "m", _ConfidentialComputeRequest_hash).call(this)));
        return this;
    }
    signWithWallet(wallet) {
        return this.signWithCallback((h) => wallet.signingKey.sign(h));
    }
    signWithPK(pk) {
        return this.signWithWallet(new ethers_1.Wallet(pk));
    }
}
exports.ConfidentialComputeRequest = ConfidentialComputeRequest;
_ConfidentialComputeRequest_instances = new WeakSet(), _ConfidentialComputeRequest_hash = function _ConfidentialComputeRequest_hash() {
    const confidentialInputsHash = (0, utils_1.keccak256)(this.confidentialInputs);
    this.confidentialComputeRecord.confidentialInputsHash = confidentialInputsHash;
    const ccr = this.confidentialComputeRecord;
    const elements = [
        ccr.kettleAddress,
        confidentialInputsHash,
        ccr.nonce,
        ccr.gasPrice,
        ccr.gas,
        ccr.to,
        ccr.value,
        ccr.data,
    ].map(utils_1.parseHexArg);
    const rlpEncoded = ethers_1.ethers.encodeRlp(elements).slice(2);
    const encodedWithPrefix = const_1.CONFIDENTIAL_COMPUTE_RECORD_TYPE + rlpEncoded;
    const hash = (0, utils_1.keccak256)(encodedWithPrefix);
    return hash;
};
class ConfidentialComputeRecord {
    constructor(crecord) {
        _ConfidentialComputeRecord_instances.add(this);
        this.chainId = crecord.chainId;
        this.data = crecord.data;
        this.gas = crecord.gas;
        this.gasPrice = crecord.gasPrice;
        this.isEIP712 = crecord.isEIP712 || false;
        this.kettleAddress = crecord.kettleAddress;
        this.nonce = crecord.nonce;
        this.to = crecord.to;
        this.checkFields([
            'kettleAddress',
            'gasPrice',
            'chainId',
            'nonce',
            'data',
            'gas',
            'to',
        ]);
    }
    checkFields(keys) {
        for (const key of keys) {
            __classPrivateFieldGet(this, _ConfidentialComputeRecord_instances, "m", _ConfidentialComputeRecord_checkField).call(this, key);
        }
    }
}
exports.ConfidentialComputeRecord = ConfidentialComputeRecord;
_ConfidentialComputeRecord_instances = new WeakSet(), _ConfidentialComputeRecord_checkField = function _ConfidentialComputeRecord_checkField(key) {
    if (this[key] === null || this[key] === undefined) {
        throw new Error(`Missing ${key}`);
    }
};
function parseSignature(sig) {
    let sigParsed = {};
    sigParsed.r = (0, utils_1.removeLeadingZeros)(sig.r);
    sigParsed.s = (0, utils_1.removeLeadingZeros)(sig.s);
    sigParsed.v = sig.v - 27;
    return sigParsed;
}
//# sourceMappingURL=confidential-types.js.map