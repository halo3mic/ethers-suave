"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const utils_1 = require("../src/utils");
describe('parseHexArg', () => {
    it('parse numbers', () => {
        checkExpectations([
            [1, '0x01'],
            [42, '0x2a'],
            [0, '0x'],
            [2.324, '0x02'],
        ]);
    });
    it('parse bigints', () => {
        checkExpectations([
            [BigInt(0), '0x'],
            [BigInt(123), '0x7b'],
            [BigInt('0x446c3b15f9926687d2c40534fdb564000000000000'), '0x446c3b15f9926687d2c40534fdb564000000000000'],
        ]);
    });
    it('parse BN', () => {
        checkExpectations([
            [BigInt(1), '0x01'],
            [BigInt(42), '0x2a'],
            [BigInt(0), '0x'],
        ]);
    });
    it('parse strings', () => {
        checkExpectations([
            ['0x01', '0x01'],
            ['0x2a', '0x2a'],
            ['0x', '0x'],
            ['', '0x'],
        ]);
    });
    it('parse null', () => {
        checkExpectations([
            [null, '0x'],
        ]);
    });
    it('parse invalid strings', () => {
        (0, chai_1.expect)(() => (0, utils_1.parseHexArg)('0xzz')).to.throw();
        (0, chai_1.expect)(() => (0, utils_1.parseHexArg)('2133')).to.throw();
        (0, chai_1.expect)(() => (0, utils_1.parseHexArg)('x2h33')).to.throw();
    });
    function checkExpectations(inputToExpected) {
        for (const [input, expected] of inputToExpected) {
            const actual = (0, utils_1.parseHexArg)(input);
            (0, chai_1.expect)(actual).to.eq(expected);
        }
    }
});
describe('utils', () => {
    it('hexFillZero', () => {
        (0, chai_1.expect)((0, utils_1.hexFill32)('0x3618e711cb980ccec6da1250624f4439df9c10e19da047cb6e4c7d0b7f3be'))
            .to.eq('0x0003618e711cb980ccec6da1250624f4439df9c10e19da047cb6e4c7d0b7f3be');
    });
});
//# sourceMappingURL=utils.spec.js.map