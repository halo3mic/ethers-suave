"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SuaveJsonRpcProvider_instances, _SuaveJsonRpcProvider_kettleAddress, _SuaveJsonRpcProvider_getKettleAddress, _SuaveContract_instances, _SuaveContract_throwFormattedSubmissionError, _SuaveContract_provider, _SuaveContract_signer, _SuaveContract_runnerIsSigner, _ConfidentialTransactionResponse_provider;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRecord = exports.ConfidentialTransactionResponse = exports.SuaveContract = exports.SuaveWallet = exports.SuaveSigner = exports.SuaveJsonRpcProvider = exports.SuaveProvider = void 0;
const utils_1 = require("./utils");
const confidential_types_1 = require("./confidential-types");
const ethers_1 = require("ethers");
class SuaveProvider extends ethers_1.JsonRpcApiProvider {
}
exports.SuaveProvider = SuaveProvider;
class SuaveJsonRpcProvider extends ethers_1.JsonRpcProvider {
    constructor(url) {
        super(url);
        _SuaveJsonRpcProvider_instances.add(this);
        _SuaveJsonRpcProvider_kettleAddress.set(this, void 0);
    }
    setKettleAddress(address) {
        __classPrivateFieldSet(this, _SuaveJsonRpcProvider_kettleAddress, address, "f");
    }
    async getConfidentialTransaction(hash) {
        const raw = await super.send('eth_getTransactionByHash', [hash]);
        return new ConfidentialTransactionResponse(raw, this);
    }
    async getKettleAddress() {
        if (!__classPrivateFieldGet(this, _SuaveJsonRpcProvider_kettleAddress, "f")) {
            const kettleAddress = await __classPrivateFieldGet(this, _SuaveJsonRpcProvider_instances, "m", _SuaveJsonRpcProvider_getKettleAddress).call(this);
            this.setKettleAddress(kettleAddress);
        }
        return __classPrivateFieldGet(this, _SuaveJsonRpcProvider_kettleAddress, "f");
    }
}
exports.SuaveJsonRpcProvider = SuaveJsonRpcProvider;
_SuaveJsonRpcProvider_kettleAddress = new WeakMap(), _SuaveJsonRpcProvider_instances = new WeakSet(), _SuaveJsonRpcProvider_getKettleAddress = async function _SuaveJsonRpcProvider_getKettleAddress() {
    return this.send('eth_kettleAddress', []).then(r => r[0]);
};
class SuaveSigner extends ethers_1.AbstractSigner {
}
exports.SuaveSigner = SuaveSigner;
function checkProvider(signer, operation) {
    if (!signer.sprovider) {
        throw new Error('missing provider for ' + operation);
    }
    return signer.sprovider;
}
class SuaveWallet extends ethers_1.Wallet {
    constructor(privateKey, provider) {
        super(privateKey, provider);
        this.sprovider = provider;
    }
    static random(provider) {
        return new SuaveWallet(ethers_1.Wallet.createRandom().privateKey, provider);
    }
    static fromWallet(wallet, provider) {
        return new SuaveWallet(wallet.privateKey, provider);
    }
    async signCCR(ccr) {
        return ccr.signWithCallback((h) => this.signingKey.sign(h));
    }
    async populateCRecord(crecord) {
        var _a, _b, _c;
        const provider = checkProvider(this, "populateTransaction");
        const resolvedCRecord = await (0, ethers_1.resolveProperties)({
            ...crecord,
            gas: BigInt((_a = crecord.gas) !== null && _a !== void 0 ? _a : utils_1.DEFAULT_GAS_LIMIT),
            nonce: (_b = crecord.nonce) !== null && _b !== void 0 ? _b : this.getNonce("pending"),
            gasPrice: (_c = crecord.gasPrice) !== null && _c !== void 0 ? _c : provider.getFeeData().then(fd => fd.gasPrice),
        });
        const network = await provider.getNetwork();
        if (resolvedCRecord.chainId == null) {
            resolvedCRecord.chainId = network.chainId;
        }
        else if (resolvedCRecord.chainId !== network.chainId) {
            throw new Error("chainId mismatch");
        }
        const kettleAddress = await provider.getKettleAddress();
        if (resolvedCRecord.kettleAddress == null) {
            resolvedCRecord.kettleAddress = kettleAddress;
        }
        else if (resolvedCRecord.kettleAddress !== kettleAddress) {
            throw new Error("kettleAddress mismatch");
        }
        return new confidential_types_1.ConfidentialComputeRecord(resolvedCRecord);
    }
    async sendCCR(crecord, cinputs) {
        const popCRecord = await this.populateCRecord(crecord);
        const ccr = new confidential_types_1.ConfidentialComputeRequest(popCRecord, cinputs);
        const signedCCR = await this.signCCR(ccr);
        const encoded = signedCCR.rlpEncode();
        const txhash = await this.sprovider.send('eth_sendRawTransaction', [encoded]);
        return this.sprovider.getConfidentialTransaction(txhash);
    }
}
exports.SuaveWallet = SuaveWallet;
class SuaveContract extends ethers_1.BaseContract {
    constructor(address, abi, runner) {
        super(address, abi, runner);
        _SuaveContract_instances.add(this);
        this.inner = new ethers_1.Contract(address, abi, runner);
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                const item = Reflect.get(target.inner, prop, receiver);
                if (typeof item === 'function' && target.inner.interface.hasFunction(prop)) {
                    const extendedMethod = item;
                    const prepareConfidentialRequest = async (...args) => {
                        let fragment = extendedMethod.getFragment(...args);
                        const raw_overrides = fragment.inputs.length + 1 === args.length ? args.pop() : {};
                        let crecord = { ...raw_overrides };
                        crecord.data = this.interface.encodeFunctionData(fragment, args);
                        crecord.to = await this.getAddress();
                        const crecordPop = await __classPrivateFieldGet(this, _SuaveContract_instances, "m", _SuaveContract_signer).call(this).populateCRecord(crecord);
                        return new confidential_types_1.ConfidentialComputeRequest(crecordPop, raw_overrides === null || raw_overrides === void 0 ? void 0 : raw_overrides.confidentialInputs);
                    };
                    extendedMethod.prepareConfidentialRequest = prepareConfidentialRequest;
                    extendedMethod.sendConfidentialRequest = async (...args) => {
                        const ccrq = await prepareConfidentialRequest(...args);
                        const ccrqSigned = await __classPrivateFieldGet(this, _SuaveContract_instances, "m", _SuaveContract_signer).call(this).signCCR(ccrq);
                        const ccrqSignedRlp = ccrqSigned.rlpEncode();
                        const sprovider = __classPrivateFieldGet(target, _SuaveContract_instances, "m", _SuaveContract_provider).call(target);
                        const txhash = await sprovider.send('eth_sendRawTransaction', [ccrqSignedRlp])
                            .catch(__classPrivateFieldGet(target, _SuaveContract_instances, "m", _SuaveContract_throwFormattedSubmissionError).bind(target));
                        const txRes = await sprovider.getConfidentialTransaction(txhash);
                        return txRes;
                    };
                    return extendedMethod;
                }
                const actions = {
                    'connect': (wallet) => target.connect(wallet),
                    'attach': (address) => target.attach(address)
                };
                if (actions[prop]) {
                    return actions[prop];
                }
                return item;
            },
            has: (target, prop) => {
                return Reflect.has(target.inner, prop);
            }
        });
    }
    connect(wallet) {
        return new SuaveContract(this.inner.target, this.inner.interface, wallet);
    }
    attach(address) {
        return new SuaveContract(address, this.inner.interface, this.wallet);
    }
    formatSubmissionError(error) {
        var _a, _b;
        const errMsg = (_a = error === null || error === void 0 ? void 0 : error.error) === null || _a === void 0 ? void 0 : _a.message;
        if (!errMsg) {
            const err = error || 'Unknown error';
            throw new ConfidentialRequestError(err);
        }
        const re = /^execution reverted: (?<msg>0x([0-f][0-f])*)/;
        const matched = errMsg.match(re);
        if (!matched || !((_b = matched.groups) === null || _b === void 0 ? void 0 : _b.msg)) {
            throw new ConfidentialRequestError(errMsg);
        }
        const errSlice = matched.groups.msg;
        let parsedErr;
        try {
            parsedErr = this.inner.interface.parseError(errSlice);
        }
        catch (_c) {
            throw new ConfidentialExecutionError(errMsg);
        }
        const fargs = parsedErr.args.join('\', \'');
        const fmsg = `${parsedErr.name}('${fargs}')\n`;
        return fmsg;
    }
}
exports.SuaveContract = SuaveContract;
_SuaveContract_instances = new WeakSet(), _SuaveContract_throwFormattedSubmissionError = function _SuaveContract_throwFormattedSubmissionError(error) {
    const fmsg = this.formatSubmissionError(error);
    throw new ConfidentialExecutionError(fmsg);
}, _SuaveContract_provider = function _SuaveContract_provider() {
    if (__classPrivateFieldGet(this, _SuaveContract_instances, "m", _SuaveContract_runnerIsSigner).call(this)) {
        return __classPrivateFieldGet(this, _SuaveContract_instances, "m", _SuaveContract_signer).call(this).sprovider;
    }
    else {
        return this.runner;
    }
}, _SuaveContract_signer = function _SuaveContract_signer() {
    if (!__classPrivateFieldGet(this, _SuaveContract_instances, "m", _SuaveContract_runnerIsSigner).call(this)) {
        throw new Error('runner is not a signer');
    }
    return this.runner;
}, _SuaveContract_runnerIsSigner = function _SuaveContract_runnerIsSigner() {
    const runner = this.runner;
    return runner.sprovider &&
        runner.signCCR &&
        runner.populateCRecord;
};
class ConfidentialExecutionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConfidentialCallError';
        this.stack = this.stack.replace(/^.*Error: /, `${this.name}: `);
    }
}
class ConfidentialRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConfidentialRequestError';
        this.stack = this.stack.replace(/^.*Error: /, `${this.name}: `);
    }
}
class ConfidentialTransactionResponse {
    constructor(rawJson, provider) {
        _ConfidentialTransactionResponse_provider.set(this, void 0);
        const formatted = new ethers_1.JsonRpcProvider()._wrapTransactionResponse(rawJson, null);
        const rr = new RequestRecord(rawJson.requestRecord);
        __classPrivateFieldSet(this, _ConfidentialTransactionResponse_provider, provider, "f");
        this.blockNumber = formatted.blockNumber;
        this.blockHash = formatted.blockHash;
        this.transactionIndex = formatted.index;
        this.hash = formatted.hash;
        this.type = formatted.type;
        this.to = formatted.to;
        this.from = formatted.from;
        this.nonce = formatted.nonce;
        this.gas = Number(formatted.gasLimit);
        this.gasPrice = formatted.gasPrice;
        this.input = formatted.data;
        this.value = formatted.value;
        this.chainId = formatted.chainId;
        this.v = formatted.signature.v;
        this.r = formatted.signature.r;
        this.s = formatted.signature.s;
        this.requestRecord = rr;
        this.confidentialComputeResult = rawJson.confidentialComputeResult;
    }
    wait(confirmations = 1, timeout) {
        return new ethers_1.TransactionResponse(this, __classPrivateFieldGet(this, _ConfidentialTransactionResponse_provider, "f")).wait(confirmations, timeout);
    }
}
exports.ConfidentialTransactionResponse = ConfidentialTransactionResponse;
_ConfidentialTransactionResponse_provider = new WeakMap();
class RequestRecord {
    constructor(rawJson) {
        this.chainId = BigInt(rawJson.chainId);
        this.confidentialInputsHash = rawJson.confidentialInputsHash;
        this.gas = parseInt(rawJson.gas);
        this.gasPrice = BigInt(rawJson.gasPrice);
        this.hash = rawJson.hash;
        this.input = rawJson.input;
        this.kettleAddress = rawJson.kettleAddress;
        this.maxFeePerGas = rawJson.maxFeePerGas ? BigInt(rawJson.maxFeePerGas) : null;
        this.maxPriorityFeePerGas = rawJson.maxPriorityFeePerGas ? BigInt(rawJson.maxPriorityFeePerGas) : null;
        this.nonce = parseInt(rawJson.nonce);
        this.r = rawJson.r;
        this.s = rawJson.s;
        this.to = rawJson.to;
        this.type = parseInt(rawJson.type);
        this.v = parseInt(rawJson.v);
        this.value = BigInt(rawJson.value);
    }
}
exports.RequestRecord = RequestRecord;
//# sourceMappingURL=wrappers.js.map