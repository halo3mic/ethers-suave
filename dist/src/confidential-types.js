"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ConfidentialComputeRequest_instances, _ConfidentialComputeRequest_hash, _ConfidentialComputeRecord_instances, _ConfidentialComputeRecord_checkFields, _ConfidentialComputeRecord_checkField;
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
        const ccr = this.confidentialComputeRecord;
        if (!ccr.confidentialInputsHash || !ccr.r || !ccr.s || ccr.v === null) {
            throw new Error('Missing fields');
        }
        const elements = [
            [
                ccr.nonce,
                ccr.gasPrice,
                ccr.gas,
                ccr.to,
                ccr.value,
                ccr.data,
                ccr.kettleAddress,
                ccr.confidentialInputsHash,
                ccr.isEIP712,
                ccr.chainId,
                ccr.v,
                ccr.r,
                ccr.s,
            ].map(utils_1.parseHexArg),
            this.confidentialInputs,
        ];
        const rlpEncoded = ethers_1.ethers.encodeRlp(elements).slice(2);
        const encodedWithPrefix = const_1.CONFIDENTIAL_COMPUTE_REQUEST_TYPE + rlpEncoded;
        return encodedWithPrefix;
    }
    async signWithAsyncCallback(callback) {
        return callback(__classPrivateFieldGet(this, _ConfidentialComputeRequest_instances, "m", _ConfidentialComputeRequest_hash).call(this)).then((sig) => {
            const { v, s, r } = parseSignature(sig);
            this.confidentialComputeRecord.r = r;
            this.confidentialComputeRecord.s = s;
            this.confidentialComputeRecord.v = v;
            return this;
        });
    }
    signWithCallback(callback) {
        const { v, s, r } = parseSignature(callback(__classPrivateFieldGet(this, _ConfidentialComputeRequest_instances, "m", _ConfidentialComputeRequest_hash).call(this)));
        this.confidentialComputeRecord.r = r;
        this.confidentialComputeRecord.s = s;
        this.confidentialComputeRecord.v = v;
        return this;
    }
    signWithWallet(wallet) {
        return this.signWithCallback((h) => {
            const sig = wallet.signingKey.sign(h);
            return { v: sig.v, r: sig.r, s: sig.s };
        });
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
    constructor(transaction, kettleAddress, overrides) {
        var _a;
        _ConfidentialComputeRecord_instances.add(this);
        this.nonce = transaction.nonce || (overrides === null || overrides === void 0 ? void 0 : overrides.nonce) || 0;
        this.to = ((_a = transaction.to) === null || _a === void 0 ? void 0 : _a.toString()) || (overrides === null || overrides === void 0 ? void 0 : overrides.to) || ethers_1.ethers.ZeroAddress;
        this.gas = transaction.gasLimit || transaction.gas || (overrides === null || overrides === void 0 ? void 0 : overrides.gas);
        this.gasPrice = transaction.gasPrice || (overrides === null || overrides === void 0 ? void 0 : overrides.gasPrice) || '0x';
        this.value = transaction.value || (overrides === null || overrides === void 0 ? void 0 : overrides.value) || '0x';
        this.data = transaction.data || transaction.input || (overrides === null || overrides === void 0 ? void 0 : overrides.data);
        this.kettleAddress = kettleAddress || (overrides === null || overrides === void 0 ? void 0 : overrides.kettleAddress);
        this.chainId = transaction.chainId || (overrides === null || overrides === void 0 ? void 0 : overrides.chainId) || 1;
        this.isEIP712 = false;
        __classPrivateFieldGet(this, _ConfidentialComputeRecord_instances, "m", _ConfidentialComputeRecord_checkFields).call(this, [
            'kettleAddress',
            'gasPrice',
            'chainId',
            'nonce',
            'data',
            'gas',
        ]);
        this.confidentialInputsHash = null;
        this.v = null;
        this.r = null;
        this.s = null;
    }
}
exports.ConfidentialComputeRecord = ConfidentialComputeRecord;
_ConfidentialComputeRecord_instances = new WeakSet(), _ConfidentialComputeRecord_checkFields = function _ConfidentialComputeRecord_checkFields(keys) {
    for (const key of keys) {
        __classPrivateFieldGet(this, _ConfidentialComputeRecord_instances, "m", _ConfidentialComputeRecord_checkField).call(this, key);
    }
}, _ConfidentialComputeRecord_checkField = function _ConfidentialComputeRecord_checkField(key) {
    if (this[key] === null || this[key] === undefined) {
        throw new Error(`Missing ${key}`);
    }
};
function parseSignature(sig) {
    sig.r = (0, utils_1.removeLeadingZeros)(sig.r);
    sig.s = (0, utils_1.removeLeadingZeros)(sig.s);
    sig.v = Number(sig.v) == 27 ? 0 : 1;
    return sig;
}
//# sourceMappingURL=confidential-types.js.map