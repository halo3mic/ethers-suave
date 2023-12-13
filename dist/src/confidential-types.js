var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ConfidentialComputeRequest_instances, _ConfidentialComputeRequest_hash, _ConfidentialComputeRecord_instances, _ConfidentialComputeRecord_checkFields, _ConfidentialComputeRecord_checkField;
import { ethers, Wallet } from 'ethers';
import { parseHexArg, keccak256, removeLeadingZeros } from './utils';
import { CONFIDENTIAL_COMPUTE_REQUEST_TYPE, CONFIDENTIAL_COMPUTE_RECORD_TYPE, } from './const';
export class ConfidentialComputeRequest {
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
                ccr.executionNode,
                ccr.confidentialInputsHash,
                ccr.chainId,
                ccr.v,
                ccr.r,
                ccr.s,
            ].map(parseHexArg),
            this.confidentialInputs,
        ];
        const rlpEncoded = ethers.encodeRlp(elements).slice(2);
        const encodedWithPrefix = CONFIDENTIAL_COMPUTE_REQUEST_TYPE + rlpEncoded;
        return encodedWithPrefix;
    }
    signWithAsyncCallback(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return callback(__classPrivateFieldGet(this, _ConfidentialComputeRequest_instances, "m", _ConfidentialComputeRequest_hash).call(this)).then((sig) => {
                const { v, s, r } = parseSignature(sig);
                this.confidentialComputeRecord.r = r;
                this.confidentialComputeRecord.s = s;
                this.confidentialComputeRecord.v = v;
                return this;
            });
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
        return this.signWithWallet(new Wallet(pk));
    }
}
_ConfidentialComputeRequest_instances = new WeakSet(), _ConfidentialComputeRequest_hash = function _ConfidentialComputeRequest_hash() {
    const confidentialInputsHash = keccak256(this.confidentialInputs);
    this.confidentialComputeRecord.confidentialInputsHash = confidentialInputsHash;
    const ccr = this.confidentialComputeRecord;
    const elements = [
        ccr.executionNode,
        confidentialInputsHash,
        ccr.nonce,
        ccr.gasPrice,
        ccr.gas,
        ccr.to,
        ccr.value,
        ccr.data,
    ].map(parseHexArg);
    const rlpEncoded = ethers.encodeRlp(elements).slice(2);
    const encodedWithPrefix = CONFIDENTIAL_COMPUTE_RECORD_TYPE + rlpEncoded;
    const hash = keccak256(encodedWithPrefix);
    return hash;
};
export class ConfidentialComputeRecord {
    constructor(transaction, executionNode, overrides) {
        var _a;
        _ConfidentialComputeRecord_instances.add(this);
        this.nonce = transaction.nonce || (overrides === null || overrides === void 0 ? void 0 : overrides.nonce);
        this.to = ((_a = transaction.to) === null || _a === void 0 ? void 0 : _a.toString()) || (overrides === null || overrides === void 0 ? void 0 : overrides.to) || ethers.ZeroAddress;
        this.gas = transaction.gasLimit || transaction.gas || (overrides === null || overrides === void 0 ? void 0 : overrides.gas);
        this.gasPrice = transaction.gasPrice || (overrides === null || overrides === void 0 ? void 0 : overrides.gasPrice);
        this.value = transaction.value || (overrides === null || overrides === void 0 ? void 0 : overrides.value) || '0x';
        this.data = transaction.data || transaction.input || (overrides === null || overrides === void 0 ? void 0 : overrides.data);
        this.executionNode = executionNode || (overrides === null || overrides === void 0 ? void 0 : overrides.executionNode);
        this.chainId = transaction.chainId || (overrides === null || overrides === void 0 ? void 0 : overrides.chainId);
        __classPrivateFieldGet(this, _ConfidentialComputeRecord_instances, "m", _ConfidentialComputeRecord_checkFields).call(this, [
            'executionNode',
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
_ConfidentialComputeRecord_instances = new WeakSet(), _ConfidentialComputeRecord_checkFields = function _ConfidentialComputeRecord_checkFields(keys) {
    for (const key of keys) {
        __classPrivateFieldGet(this, _ConfidentialComputeRecord_instances, "m", _ConfidentialComputeRecord_checkField).call(this, key);
    }
}, _ConfidentialComputeRecord_checkField = function _ConfidentialComputeRecord_checkField(key) {
    if (!this[key]) {
        throw new Error(`Missing ${key}`);
    }
};
function parseSignature(sig) {
    sig.r = removeLeadingZeros(sig.r);
    sig.s = removeLeadingZeros(sig.s);
    sig.v = Number(sig.v) == 27 ? 0 : 1;
    return sig;
}
//# sourceMappingURL=confidential-types.js.map