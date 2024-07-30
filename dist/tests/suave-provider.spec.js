"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const chai_1 = __importDefault(require("chai"));
const fs_1 = __importDefault(require("fs"));
const src_1 = require("../src");
const ethers_1 = require("ethers");
chai_1.default.use(chai_as_promised_1.default);
const { expect } = chai_1.default;
describe('Confidential Provider/Wallet/Contract', async () => {
    it('use connect', async () => {
        const pk1 = '1111111111111111111111111111111111111111111111111111111111111111';
        const pk2 = '1111111111111111111111111111111111111111111111111111111111111112';
        const kettleUrl = 'https://rpc.toliman.suave.flashbots.net';
        const blockadAbi = fetchJSON('./tests/abis/BlockAdAuction.json');
        const provider = new src_1.SuaveJsonRpcProvider(kettleUrl);
        const wallet1 = new src_1.SuaveWallet(pk1, provider);
        const wallet2 = new src_1.SuaveWallet(pk2, provider);
        const blockadAddress = '0xa60F1B5cB70c0523A086BbCbe132C8679085ea0E';
        const BlockAd = new src_1.SuaveContract(blockadAddress, blockadAbi, wallet1);
        const BlockAd2 = BlockAd.connect(wallet2);
        const resp = await BlockAd2.builder.sendCCR();
        expect(resp).to.have.property('from').to.eq(wallet2.address);
    }).timeout(100000);
    it('Non-confidential call / Contract with provider', async () => {
        const blockadAbi = fetchJSON('./tests/abis/BlockAdAuction.json');
        const provider = new src_1.SuaveJsonRpcProvider('https://rpc.toliman.suave.flashbots.net');
        const blockadAddress = '0xa60F1B5cB70c0523A086BbCbe132C8679085ea0E';
        const BlockAd = new src_1.SuaveContract(blockadAddress, blockadAbi, provider);
        const isInitialized = await BlockAd.isInitialized();
        expect(isInitialized).to.be.true;
    });
    it('Confidential send response', async () => {
        const pk = '1111111111111111111111111111111111111111111111111111111111111111';
        const kettleUrl = 'https://rpc.toliman.suave.flashbots.net';
        const blockadAbi = fetchJSON('./tests/abis/BlockAdAuction.json');
        const provider = new src_1.SuaveJsonRpcProvider(kettleUrl);
        const wallet = new src_1.SuaveWallet(pk, provider);
        const blockadAddress = '0xa60F1B5cB70c0523A086BbCbe132C8679085ea0E';
        const BlockAd = new src_1.SuaveContract(blockadAddress, blockadAbi, wallet);
        const cresponse = await BlockAd.builder.sendCCR();
        expect(cresponse).to.have.property('requestRecord');
        expect(cresponse).to.have
            .property('confidentialComputeResult')
            .eq('0x0000000000000000000000005d7f7f0b1a1ade67d6e3add498d07289481e9d20');
    }).timeout(100000);
    it('confidential tx response', async () => {
        const provider = new src_1.SuaveJsonRpcProvider('https://rpc.toliman.suave.flashbots.net');
        const tx = await provider.getConfidentialTransaction('0x59ab298e560bff030915f0f61b1adc4bbcc4594d0f0c72fb7facd247532f68d1');
        const expected = {
            blockNumber: 431781,
            blockHash: '0x1ddc21b2f47cf362d2a0069c60d7ada0246a3c3deed671129172e96174ed8e7e',
            hash: '0x59ab298e560bff030915f0f61b1adc4bbcc4594d0f0c72fb7facd247532f68d1',
            type: 0x50,
            to: '0xa60F1B5cB70c0523A086BbCbe132C8679085ea0E',
            from: '0x16f2Aa8dF055b6e672b93Ded41FecCCabAB565B0',
            nonce: 0xa,
            gas: 0x1e8480,
            gasPrice: BigInt(0x4a817c800),
            input: '0x64e65a6200000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001e02003c66c8f601b57adf63ce945a82650206caa73778387718b709ee2f1a074a1be70672ec99d3c2519df6f6f6ec4e8ad0cdb9a02a3e23a5ec7aa0f68305bd01d00000000000000000000000000000000000000000000000000000000000000a4e48c31e000000000000000000000000000000000000000000000000000000000000000407c8abef6d601a5bc2ab54d190b45226aeea7840530f19071c07fae658c7202fd000000000000000000000000000000000000000000000000000000000000004030363830626431646633666161653530383738636663643261353763393237393031663266336433313061666431323762666563303230643534326331643865000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000454b7a44c300000000000000000000000000000000000000000000000000000000000000000',
            value: BigInt(0),
            chainId: BigInt(0x201188a),
            v: 28,
            r: '0xa9c6de7368472d57f50bedf4990cffc6f7af8bf1354f2e3a7ab58c114506853c',
            s: '0x37906417f21c031bd082beb04a8dc09e12bd15aa78be5514ff9987dea5cf73ab',
            requestRecord: {
                chainId: BigInt(0x201188a),
                confidentialInputsHash: '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470',
                gas: 0x1e8480,
                gasPrice: BigInt(0x4a817c800),
                hash: '0x52d2b8d7667e38bb75190110723640c26ee8308026147cd21cd652a976087d5b',
                input: '0x060b0d17000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000001dd60e00000000000000000000000000000000000000000000000000000000002059e00000000000000000000000000000000000000000000000000000000000000160694928f003e3113cb25ac650d6e5f66a8e9d1832871fd74a809232843ada562e000000000000000000000000000000000000000000000000000000006699a14000000000000000000000000065fdc9a172746d54a5b05e6ac5130b991abaf0790000000000000000000000000000000000000000000000000000000001c9c38094b62a56105686c79598d8f15ff2c65c5133ab4b303661154879edeee6434baf00000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000009e04ccf48a52b02fdc0fe15348534c77a3d9aa731be98c39aefcb52e1c92c4a2d9f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030b87ac65718d747701b384b3ff86bb70a84c2d48d4a0f7808297536bec20edf5050638d03e072e543461bab1b1b5d425b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000001dab20e000000000000000000000000000000000000000000000000000000000015ad800000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a4200000000000000000000000000000000000000000000000000000000006ffd6f0000000000000000000000000000000000000000000000000000000001dab20f000000000000000000000000000000000000000000000000000000000015ad810000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a42000000000000000000000000000000000000000000000000000000000070cb840000000000000000000000000000000000000000000000000000000001dab210000000000000000000000000000000000000000000000000000000000015ad820000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a4200000000000000000000000000000000000000000000000000000000006ef02e0000000000000000000000000000000000000000000000000000000001dab211000000000000000000000000000000000000000000000000000000000015ad830000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a42000000000000000000000000000000000000000000000000000000000070ae410000000000000000000000000000000000000000000000000000000001dab212000000000000000000000000000000000000000000000000000000000015ad840000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a4200000000000000000000000000000000000000000000000000000000006f1e2a0000000000000000000000000000000000000000000000000000000001dab213000000000000000000000000000000000000000000000000000000000015ad850000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a4200000000000000000000000000000000000000000000000000000000006fa6a60000000000000000000000000000000000000000000000000000000001dab214000000000000000000000000000000000000000000000000000000000015ad860000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a4200000000000000000000000000000000000000000000000000000000007071bb0000000000000000000000000000000000000000000000000000000001dab215000000000000000000000000000000000000000000000000000000000015ad870000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a4200000000000000000000000000000000000000000000000000000000006fa4500000000000000000000000000000000000000000000000000000000001dab216000000000000000000000000000000000000000000000000000000000015ad880000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a4200000000000000000000000000000000000000000000000000000000007095e60000000000000000000000000000000000000000000000000000000001dab217000000000000000000000000000000000000000000000000000000000015ad890000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a4200000000000000000000000000000000000000000000000000000000006f7d150000000000000000000000000000000000000000000000000000000001dab218000000000000000000000000000000000000000000000000000000000015ad8a0000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a4200000000000000000000000000000000000000000000000000000000007051200000000000000000000000000000000000000000000000000000000001dab219000000000000000000000000000000000000000000000000000000000015ad8b0000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a4200000000000000000000000000000000000000000000000000000000006ffd5b0000000000000000000000000000000000000000000000000000000001dab21a000000000000000000000000000000000000000000000000000000000015ad8c0000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a42000000000000000000000000000000000000000000000000000000000070e7060000000000000000000000000000000000000000000000000000000001dab21b000000000000000000000000000000000000000000000000000000000015ad8d0000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a420000000000000000000000000000000000000000000000000000000000705eee0000000000000000000000000000000000000000000000000000000001dab21c000000000000000000000000000000000000000000000000000000000015ad8e0000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a4200000000000000000000000000000000000000000000000000000000006fb29d0000000000000000000000000000000000000000000000000000000001dab21d000000000000000000000000000000000000000000000000000000000015ad8f0000000000000000000000002b1d879b5e102e60166202de79537b48e2f18a4200000000000000000000000000000000000000000000000000000000006f6b4900000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
                kettleAddress: '0xf579de142d98f8379c54105ac944fe133b7a17fe',
                maxFeePerGas: null,
                maxPriorityFeePerGas: null,
                nonce: 0xa,
                r: '0x3fdca8b0237284d7c5ad930af69b755616286f8ab372567b0495e08843f6deeb',
                s: '0x44e7f18a22a5fb4ced5ee81562472bb59742ddb5afad355558463ef57229cefd',
                to: '0xa60f1b5cb70c0523a086bbcbe132c8679085ea0e',
                type: 0x42,
                v: 0,
                value: BigInt(0)
            },
            confidentialComputeResult: '0x64e65a6200000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001e02003c66c8f601b57adf63ce945a82650206caa73778387718b709ee2f1a074a1be70672ec99d3c2519df6f6f6ec4e8ad0cdb9a02a3e23a5ec7aa0f68305bd01d00000000000000000000000000000000000000000000000000000000000000a4e48c31e000000000000000000000000000000000000000000000000000000000000000407c8abef6d601a5bc2ab54d190b45226aeea7840530f19071c07fae658c7202fd000000000000000000000000000000000000000000000000000000000000004030363830626431646633666161653530383738636663643261353763393237393031663266336433313061666431323762666563303230643534326331643865000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000454b7a44c300000000000000000000000000000000000000000000000000000000000000000'
        };
        for (const key in expected) {
            expect(tx).to.have.property(key);
            const val = tx[key];
            if ((typeof val) == 'object') {
                expect(tx).has.property(key);
                const subexpected = expected[key];
                const subtx = val;
                for (const subkey in subexpected) {
                    expect(subtx[subkey]).to.be.eq(subexpected[subkey]);
                }
            }
            else {
                expect(val).eq(expected[key]);
            }
        }
    });
    it('confidential wait', async () => {
        const provider = new src_1.SuaveJsonRpcProvider('https://rpc.toliman.suave.flashbots.net');
        const tx = await provider.getConfidentialTransaction('0x59ab298e560bff030915f0f61b1adc4bbcc4594d0f0c72fb7facd247532f68d1');
        const receipt = await tx.wait();
        expect(receipt).to.have.property('blockNumber').eq(0x696a5);
        expect(receipt).to.have.property('index').eq(0);
        expect(receipt).to.have.property('gasPrice').eq(BigInt(0x4a817c800));
        expect(receipt).to.have.property('status').eq(1);
        expect(receipt).to.have.property('type').eq(80);
    });
    it('Allow empty overrides', async () => {
        const pk = '1111111111111111111111111111111111111111111111111111111111111111';
        const kettleUrl = 'https://rpc.toliman.suave.flashbots.net';
        const blockadAbi = fetchJSON('./tests/abis/BlockAdAuction.json');
        const provider = new src_1.SuaveJsonRpcProvider(kettleUrl);
        const wallet = new src_1.SuaveWallet(pk, provider);
        const blockadAddress = '0xa60F1B5cB70c0523A086BbCbe132C8679085ea0E';
        const BlockAd = new src_1.SuaveContract(blockadAddress, blockadAbi, wallet);
        const crqPromise = BlockAd.builder.sendCCR();
        await expect(crqPromise).to.eventually.be.fulfilled;
    }).timeout(100000);
    it('get kettle address', async () => {
        const provider = new src_1.SuaveJsonRpcProvider('https://rpc.toliman.suave.flashbots.net');
        const kettle = await provider.getKettleAddress();
        expect(kettle).to.eq('0xf579de142d98f8379c54105ac944fe133b7a17fe');
    });
    it('ccr no abi', async () => {
        const pk = '1111111111111111111111111111111111111111111111111111111111111111';
        const kettleUrl = 'https://rpc.toliman.suave.flashbots.net';
        const provider = new src_1.SuaveJsonRpcProvider(kettleUrl);
        const wallet = new src_1.SuaveWallet(pk, provider);
        const iface = new ethers_1.ethers.Interface(['function queryLatestPrice(string)', 'function DECIMALS()']);
        const oracle_address = '0x48931D75dD8A617F6aC7176EE131F90AC779FEB0';
        let cresponse = await wallet.sendCCR({
            data: iface.encodeFunctionData('queryLatestPrice', ['ETHUSDT']),
            to: oracle_address,
            gas: 300000,
        });
        expect(cresponse).to.have.property('requestRecord');
        expect(cresponse).to.have.property('confidentialComputeResult');
        let [price_raw] = ethers_1.ethers.AbiCoder.defaultAbiCoder()
            .decode(['uint256'], cresponse.confidentialComputeResult);
        let dec = await provider.call({
            data: iface.encodeFunctionData('DECIMALS'),
            to: oracle_address,
        }).then(res => parseInt(res.slice(65, 66)[0]));
        let price = parseInt(price_raw) / 10 ** dec;
        expect(price).to.be.above(100).and.below(20000);
        console.log(price);
    }).timeout(10000);
});
describe('err handling', async () => {
    it('insufficient funds', async () => {
        const kettleUrl = 'https://rpc.toliman.suave.flashbots.net';
        const blockadAbi = fetchJSON('./tests/abis/BlockAdAuction.json');
        const provider = new src_1.SuaveJsonRpcProvider(kettleUrl);
        let emptyWallet;
        for (let i = 0; i < 10; i++) {
            emptyWallet = src_1.SuaveWallet.random(provider);
            const bal = await provider.getBalance(emptyWallet.address);
            if (bal == BigInt(0)) {
                break;
            }
            if (i == 9) {
                throw new Error('could not find empty wallet');
            }
        }
        const wallet = src_1.SuaveWallet.random(provider);
        expect(await provider.getBalance(wallet.address)).to.eq(BigInt(0));
        const blockadAddress = '0xa60F1B5cB70c0523A086BbCbe132C8679085ea0E';
        const BlockAd = new src_1.SuaveContract(blockadAddress, blockadAbi, wallet);
        const blockLimit = 100;
        const extra = '🚀🚀';
        const confidentialInputs = '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000f37b22747873223a5b22307866383636383162613836303861393666343839383661383235323038393431366632616138646630353562366536373262393364656434316665636363616261623536356230383038303264613035333266616561616165373262383636623535356635313936613936616238356432366335643233363261326439333036336635616135333838633937336433613031396231643836336664323933396231643062353962363133393665613635333164353438306134333231633833373534313537633434623532343165616265225d2c22726576657274696e67486173686573223a5b5d7d00000000000000000000000000';
        const crqPromise = BlockAd.buyAd.sendCCR(blockLimit, extra, { confidentialInputs });
        await expect(crqPromise).to.eventually.be.rejectedWith(/insufficient funds.*/);
    }).timeout(100000);
    it('wrong kettle address', async () => {
        const pk = '1111111111111111111111111111111111111111111111111111111111111122';
        const kettleUrl = 'https://rpc.toliman.suave.flashbots.net';
        const blockadAbi = fetchJSON('./tests/abis/BlockAdAuction.json');
        const provider = new src_1.SuaveJsonRpcProvider(kettleUrl);
        provider.setKettleAddress('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef');
        const wallet = new src_1.SuaveWallet(pk, provider);
        const blockadAddress = '0xa60F1B5cB70c0523A086BbCbe132C8679085ea0E';
        const BlockAd = new src_1.SuaveContract(blockadAddress, blockadAbi, wallet);
        const blockLimit = 100;
        const extra = '🚀🚀';
        const confidentialInputs = '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000f37b22747873223a5b22307866383636383162613836303861393666343839383661383235323038393431366632616138646630353562366536373262393364656434316665636363616261623536356230383038303264613035333266616561616165373262383636623535356635313936613936616238356432366335643233363261326439333036336635616135333838633937336433613031396231643836336664323933396231643062353962363133393665613635333164353438306134333231633833373534313537633434623532343165616265225d2c22726576657274696e67486173686573223a5b5d7d00000000000000000000000000';
        const crqPromise = BlockAd.buyAd.sendCCR(blockLimit, extra, { confidentialInputs });
        await expect(crqPromise).to.eventually.be.rejectedWith(/unknown account/);
    }).timeout(100000);
    it('wrong chain', async () => {
        const pk = '1111111111111111111111111111111111111111111111111111111111111122';
        const kettleUrl = 'https://ethereum-holesky-rpc.publicnode.com';
        const blockadAbi = fetchJSON('./tests/abis/BlockAdAuction.json');
        const provider = new src_1.SuaveJsonRpcProvider(kettleUrl);
        provider.setKettleAddress('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef');
        const wallet = new src_1.SuaveWallet(pk, provider);
        const blockadAddress = '0xa60F1B5cB70c0523A086BbCbe132C8679085ea0E';
        const BlockAd = new src_1.SuaveContract(blockadAddress, blockadAbi, wallet);
        const blockLimit = 100;
        const extra = '🚀🚀';
        const confidentialInputs = '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000f37b22747873223a5b22307866383636383162613836303861393666343839383661383235323038393431366632616138646630353562366536373262393364656434316665636363616261623536356230383038303264613035333266616561616165373262383636623535356635313936613936616238356432366335643233363261326439333036336635616135333838633937336433613031396231643836336664323933396231643062353962363133393665613635333164353438306134333231633833373534313537633434623532343165616265225d2c22726576657274696e67486173686573223a5b5d7d00000000000000000000000000';
        const crqPromise = BlockAd.buyAd.sendCCR(blockLimit, extra, { confidentialInputs });
        await expect(crqPromise).to.eventually.be.rejectedWith(/transaction type not supported/);
    });
});
function fetchJSON(path) {
    const content = fs_1.default.readFileSync(path, 'utf8');
    return JSON.parse(content);
}
//# sourceMappingURL=suave-provider.spec.js.map