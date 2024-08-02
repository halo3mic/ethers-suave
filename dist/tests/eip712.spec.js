"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const chai_1 = __importDefault(require("chai"));
const src_1 = require("../src");
chai_1.default.use(chai_as_promised_1.default);
const { expect } = chai_1.default;
describe('EIP712', async () => {
    it('confidential record eip712 hash validity', async () => {
        const expectedHash = '0xdc035c7f6570decb0be366aea943742c3c9911fe51ebda7360c04c60e13595d6';
        const crecord = new src_1.ConfidentialComputeRecord({
            data: '0xfd38f21d00000000000000000000000000000000000000000000000000000000001f56440000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000c536f20457874726120e29ca80000000000000000000000000000000000000000',
            gas: 1000000,
            gasPrice: 1000000000,
            kettleAddress: '0xF579DE142D98F8379C54105ac944fe133B7A17FE',
            nonce: 0,
            to: '0xa60F1B5cB70c0523A086BbCbe132C8679085ea0E',
            chainId: 33626250,
            isEIP712: true
        });
        crecord.confidentialInputsHash = '0x5b7a6636304da9f032336a9c2a1a13680513b2196c0a156e3ad11caf0846af3a';
        const hash = crecord.eip712Hash();
        expect(hash).to.equal(expectedHash);
    });
});
//# sourceMappingURL=eip712.spec.js.map