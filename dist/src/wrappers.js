"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _SuaveProvider_instances, _SuaveProvider_kettleAddress, _SuaveProvider_getKettleAddress, _SuaveContract_instances, _SuaveContract_formatSubmissionError, _ConfidentialTransactionResponse_provider;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRecord = exports.ConfidentialTransactionResponse = exports.SuaveContract = exports.SuaveWallet = exports.SuaveProvider = void 0;
const confidential_types_1 = require("./confidential-types");
const ethers_1 = require("ethers");
class SuaveProvider extends ethers_1.JsonRpcProvider {
    constructor(url) {
        super(url);
        _SuaveProvider_instances.add(this);
        _SuaveProvider_kettleAddress.set(this, void 0);
    }
    async getConfidentialTransaction(hash) {
        const raw = await super.send('eth_getTransactionByHash', [hash]);
        if (raw === null) {
            throw new Error(`Transaction not found: ${hash}`);
        }
        return new ConfidentialTransactionResponse(raw, this);
    }
    async getKettleAddress() {
        if (!__classPrivateFieldGet(this, _SuaveProvider_kettleAddress, "f")) {
            const kettleAddress = await __classPrivateFieldGet(this, _SuaveProvider_instances, "m", _SuaveProvider_getKettleAddress).call(this);
            this.setKettleAddress(kettleAddress);
        }
        return __classPrivateFieldGet(this, _SuaveProvider_kettleAddress, "f");
    }
    setKettleAddress(address) {
        __classPrivateFieldSet(this, _SuaveProvider_kettleAddress, address, "f");
    }
}
exports.SuaveProvider = SuaveProvider;
_SuaveProvider_kettleAddress = new WeakMap(), _SuaveProvider_instances = new WeakSet(), _SuaveProvider_getKettleAddress = async function _SuaveProvider_getKettleAddress() {
    return this.send('eth_kettleAddress', []).then(r => r[0]);
};
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
}
exports.SuaveWallet = SuaveWallet;
class SuaveContract extends ethers_1.BaseContract {
    constructor(address, abi, runner) {
        super(address, abi, runner);
        _SuaveContract_instances.add(this);
        this.inner = new ethers_1.Contract(address, abi, runner);
        this.wallet = runner;
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                const item = Reflect.get(target.inner, prop, receiver);
                if (typeof item === 'function' && target.inner.interface.hasFunction(prop)) {
                    const extendedMethod = item;
                    const prepareConfidentialRequest = async (...args) => {
                        const overrides = args[args.length - 1] || {};
                        const contractTx = await extendedMethod.populateTransaction(...args);
                        contractTx.type = 0;
                        contractTx.gasLimit = BigInt(overrides.gasLimit || 1e7);
                        const filledTx = await target.wallet.populateTransaction(contractTx);
                        const kettleAddress = await runner.provider.getKettleAddress();
                        const crc = new confidential_types_1.ConfidentialComputeRecord(filledTx, kettleAddress);
                        const crq = new confidential_types_1.ConfidentialComputeRequest(crc, overrides.confidentialInputs);
                        return crq;
                    };
                    extendedMethod.prepareConfidentialRequest = prepareConfidentialRequest;
                    extendedMethod.sendConfidentialRequest = async (...args) => {
                        const crq = (await prepareConfidentialRequest(...args))
                            .signWithWallet(target.wallet)
                            .rlpEncode();
                        const sprovider = target.wallet.sprovider;
                        const txhash = await sprovider.send('eth_sendRawTransaction', [crq])
                            .catch(__classPrivateFieldGet(target, _SuaveContract_instances, "m", _SuaveContract_formatSubmissionError).bind(target));
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
}
exports.SuaveContract = SuaveContract;
_SuaveContract_instances = new WeakSet(), _SuaveContract_formatSubmissionError = function _SuaveContract_formatSubmissionError(error) {
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
    throw new ConfidentialExecutionError(fmsg);
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