var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var _ConfidentialTransactionResponse_provider;
import { ConfidentialComputeRequest, ConfidentialComputeRecord } from './confidential-types';
import { TransactionResponse, JsonRpcProvider, Contract, Wallet, } from 'ethers';
export { ConfidentialComputeRequest, ConfidentialComputeRecord } from './confidential-types';
class ConfidentialCallError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConfidentialCallError';
        this.stack = this.stack.replace(/^Error\n/, `${this.name}: `);
    }
}
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
class ConfidentialTransactionResponse {
    constructor(rawJson, provider) {
        _ConfidentialTransactionResponse_provider.set(this, void 0);
        const formatted = new JsonRpcProvider()._wrapTransactionResponse(rawJson, null);
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
        return new TransactionResponse(this, __classPrivateFieldGet(this, _ConfidentialTransactionResponse_provider, "f")).wait(confirmations, timeout);
    }
}
_ConfidentialTransactionResponse_provider = new WeakMap();
export class SuaveProvider extends JsonRpcProvider {
    constructor(url, executionNode = null) {
        super(url);
        this.executionNode = executionNode;
    }
    getConfidentialTransaction(hash) {
        const _super = Object.create(null, {
            send: { get: () => super.send }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const raw = yield _super.send.call(this, 'eth_getTransactionByHash', [hash]);
            return new ConfidentialTransactionResponse(raw, this);
        });
    }
}
export class SuaveWallet extends Wallet {
    constructor(privateKey, provider) {
        super(privateKey, provider);
        this.sprovider = provider;
    }
}
export class SuaveContract {
    constructor(address, abi, wallet) {
        this.inner = new Contract(address, abi, wallet);
        this.wallet = wallet;
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                const item = Reflect.get(target.inner, prop, receiver);
                if (typeof item === 'function' && target.inner.interface.hasFunction(prop)) {
                    const extendedMethod = item;
                    const prepareConfidentialRequest = (...args) => __awaiter(this, void 0, void 0, function* () {
                        const overrides = args[args.length - 1];
                        const contractTx = yield extendedMethod.populateTransaction(...args);
                        contractTx.type = 0;
                        contractTx.gasLimit = BigInt(overrides.gasLimit || 1e7);
                        const filledTx = yield target.wallet.populateTransaction(contractTx);
                        if (wallet.sprovider.executionNode === null) {
                            throw new Error('No execution node set');
                        }
                        const crc = new ConfidentialComputeRecord(filledTx, wallet.sprovider.executionNode);
                        const crq = new ConfidentialComputeRequest(crc, overrides.confidentialInputs);
                        return crq;
                    });
                    extendedMethod.prepareConfidentialRequest = prepareConfidentialRequest;
                    extendedMethod.sendConfidentialRequest = (...args) => __awaiter(this, void 0, void 0, function* () {
                        const crq = (yield prepareConfidentialRequest(...args))
                            .signWithWallet(target.wallet)
                            .rlpEncode();
                        const sprovider = target.wallet.sprovider;
                        const txhash = yield sprovider.send('eth_sendRawTransaction', [crq])
                            .catch(target.formatSubmissionError.bind(target));
                        const txRes = yield sprovider.getConfidentialTransaction(txhash);
                        return txRes;
                    });
                    return extendedMethod;
                }
                return item;
            },
            has: (target, prop) => {
                return Reflect.has(target.inner, prop);
            }
        });
    }
    formatSubmissionError(error) {
        var _a, _b;
        const errMsg = (_a = error === null || error === void 0 ? void 0 : error.error) === null || _a === void 0 ? void 0 : _a.message;
        if (!errMsg) {
            throw new Error('Unknown error');
        }
        const re = /^execution reverted: (?<msg>0x([0-f][0-f])*)/;
        const errSlice = (_b = errMsg.match(re).groups) === null || _b === void 0 ? void 0 : _b.msg;
        if (!errSlice) {
            throw new Error(errMsg);
        }
        let parsedErr;
        try {
            parsedErr = this.inner.interface.parseError(errSlice);
        }
        catch (_c) {
            throw new Error(errMsg);
        }
        const fargs = parsedErr.args.join('\', \'');
        const fmsg = `${parsedErr.name}('${fargs}')\n`;
        throw new ConfidentialCallError(fmsg);
    }
}
//# sourceMappingURL=index.js.map