import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
import fs from 'fs'

import { SuaveContract, SuaveProvider, SuaveWallet } from '../src'

chai.use(chaiAsPromised)
const { expect } = chai


describe('Confidential Provider/Wallet/Contract', async () => {

	it('use connect', async () => {
		const pk1 = '1111111111111111111111111111111111111111111111111111111111111111'
		const pk2 = '1111111111111111111111111111111111111111111111111111111111111112'
		const kettleUrl = 'https://rpc.rigil.suave.flashbots.net'
		const blockadAbi = fetchJSON('./tests/abis/BlockAdAuction.json')

		const provider = new SuaveProvider(kettleUrl)
		const wallet1 = new SuaveWallet(pk1, provider)
		const wallet2 = new SuaveWallet(pk2, provider)

		const blockadAddress = '0xf75e0C824Df257c02fe7493d6FF6d98F1ddab467'
		
		let BlockAd = new SuaveContract(blockadAddress, blockadAbi, wallet1)
		const BlockAd2 = BlockAd.connect(wallet2)

		const resp = await BlockAd2.builder.sendConfidentialRequest()
		expect(resp).to.have.property('from').to.eq(wallet2.address)
	}).timeout(100000)

	it('Confidential send response', async () => {
	    const pk = '1111111111111111111111111111111111111111111111111111111111111111'
	    const kettleUrl = 'https://rpc.rigil.suave.flashbots.net'
	    const blockadAbi = fetchJSON('./tests/abis/BlockAdAuction.json')

	    const provider = new SuaveProvider(kettleUrl)
	    const wallet = new SuaveWallet(pk, provider)
	    const blockadAddress = '0xee9794177378e98268b30Ca14964f2FDFc71bD6D'
        
	    const BlockAd = new SuaveContract(blockadAddress, blockadAbi, wallet)
	    const crq = await BlockAd.builder.sendConfidentialRequest()

	    expect(crq).to.have.property('requestRecord')
	    expect(crq).to.have
			.property('confidentialComputeResult')
			.eq('0x000000000000000000000000d4610c597b921269e96b0c2b914e3d46ebea5a36')
	}).timeout(100000)

	it('confidential tx response', async () => {
		const provider = new SuaveProvider('https://rpc.rigil.suave.flashbots.net')
		const tx = await provider.getConfidentialTransaction('0xafac2b381a1a4875d3407373db0bf8d27f44ac7553ce57f01dd58ea9aad13122')
		const expected = {
			blockNumber: 708670,
			blockHash: '0x2e59f91450c0bda952db8b987f07c1fbd4c1c7d40639544ca719020ec6fc515a',
			hash: '0xafac2b381a1a4875d3407373db0bf8d27f44ac7553ce57f01dd58ea9aad13122',
			type: 80,
			to: '0xee9794177378e98268b30Ca14964f2FDFc71bD6D',
			from: '0x16f2Aa8dF055b6e672b93Ded41FecCCabAB565B0',
			nonce: 540,
			gas: 2000000,
			gasPrice: BigInt(20000000000),
			input: '0xee2cc3640000000000000000000000000000000000000000000000000000000000000060a35348a13371a30216fa8732bcef57c66b8709a4d413b3cc1ab21588478376c9ed9d5dcc5bb156ded65fd25c7fad2d54317f34aa24d444c89eb04ee0c6d578280000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000009bae0130367ed979df56cbb984dceee40e8ae7000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004f09f91bd00000000000000000000000000000000000000000000000000000000',
			value: BigInt(0),
			chainId: BigInt(16813125),
			v: 27,
			r: '0x35bd86630b523c4739b6f0884ade744cb14b6a7c5de9f4a64f1d21ce482588fc',
			s: '0x1a65918d09437b59ed47604a0a821e420abe503287a4eb34e20780622f0fa670',
			requestRecord: {
				chainId: BigInt(16813125),
				confidentialInputsHash: '0x8f768cadde635ad433121ae1d0d3f48ed000cb549d9c1837e4d069de24bd3bd5',
				gas: 2000000,
				gasPrice: BigInt(20000000000),
				hash: '0xf10378fe6c83b24fd5e4b4fc0e1a807dcd43f33ada25b5e28332557e0cd310d0',
				input: '0xfd38f21d00000000000000000000000000000000000000000000000000000000009bae0100000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000004f09f91bd00000000000000000000000000000000000000000000000000000000',
				kettleAddress: '0x03493869959c866713c33669ca118e774a30a0e5',
				maxFeePerGas: null,
				maxPriorityFeePerGas: null,
				nonce: 540,
				r: '0x4bed07d52a4659851f2938332dfe4218b28601ed4cbabaea0aee1056a8336e58',
				s: '0x3ded4a55e963c80b5bb759cda404f5494ccd06925eefd401a4a5150c75107936',
				to: '0xee9794177378e98268b30ca14964f2fdfc71bd6d',
				type: 66,
				v: 0,
				value: BigInt(0)
			},
			confidentialComputeResult: '0xee2cc3640000000000000000000000000000000000000000000000000000000000000060a35348a13371a30216fa8732bcef57c66b8709a4d413b3cc1ab21588478376c9ed9d5dcc5bb156ded65fd25c7fad2d54317f34aa24d444c89eb04ee0c6d578280000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000009bae0130367ed979df56cbb984dceee40e8ae7000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004f09f91bd00000000000000000000000000000000000000000000000000000000'
		}

		for (const key in expected) {
			expect(tx).to.have.property(key)
			const val = tx[key]
			if ((typeof val) == 'object') {
				expect(tx).has.property(key)
				const subexpected = expected[key]
				const subtx = val
				for (const subkey in subexpected) {
					expect(subtx[subkey]).to.be.eq(subexpected[subkey])
				}
			} else {
				expect(val).eq(expected[key])
			}
		}
	})

	it('confidential wait', async () => {
		const provider = new SuaveProvider('https://rpc.rigil.suave.flashbots.net')
		const tx = await provider.getConfidentialTransaction('0xafac2b381a1a4875d3407373db0bf8d27f44ac7553ce57f01dd58ea9aad13122')
		const receipt = await tx.wait()
		expect(receipt).to.have.property('blockNumber').eq(708670)
		expect(receipt).to.have.property('index').eq(0)
		expect(receipt).to.have.property('gasPrice').eq(BigInt(20000000000))
		expect(receipt).to.have.property('status').eq(1)
		expect(receipt).to.have.property('type').eq(80)
	})

	it('Allow empty overrides', async () => {
		const pk = '1111111111111111111111111111111111111111111111111111111111111111'
		const kettleUrl = 'https://rpc.rigil.suave.flashbots.net'
		const blockadAbi = fetchJSON('./tests/abis/BlockAdAuction.json')

		const provider = new SuaveProvider(kettleUrl)
		const wallet = new SuaveWallet(pk, provider)
		const blockadAddress = '0xf75e0C824Df257c02fe7493d6FF6d98F1ddab467'
        
		const BlockAd = new SuaveContract(blockadAddress, blockadAbi, wallet)
		const crqPromise = BlockAd.builder.sendConfidentialRequest()
		await expect(crqPromise).to.eventually.be.fulfilled
	}).timeout(100000)

	it('get kettle address', async () => {
		const provider = new SuaveProvider('https://rpc.rigil.suave.flashbots.net')
		const kettle = await provider.getKettleAddress()
		expect(kettle).to.eq('0x03493869959c866713c33669ca118e774a30a0e5')
	})

})

describe('err handling', async () => {

	it('insufficient funds', async () => {
		const kettleUrl = 'https://rpc.rigil.suave.flashbots.net'
		const blockadAbi = fetchJSON('./tests/abis/BlockAdAuction.json')

		const provider = new SuaveProvider(kettleUrl)
		let emptyWallet: SuaveWallet
		for (let i = 0; i < 10; i++) {
			emptyWallet = SuaveWallet.random(provider)
			let bal = await provider.getBalance(emptyWallet.address)
			if (bal == BigInt(0)) {
				break
			}
			if (i == 9) {
				throw new Error('could not find empty wallet')
			}
		}
		const wallet = SuaveWallet.random(provider)
		expect(await provider.getBalance(wallet.address)).to.eq(BigInt(0))
		const blockadAddress = '0xf75e0C824Df257c02fe7493d6FF6d98F1ddab467'
        
		const BlockAd = new SuaveContract(blockadAddress, blockadAbi, wallet)
		const blockLimit = 100
		const extra = '🚀🚀'
		const confidentialInputs = '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000f37b22747873223a5b22307866383636383162613836303861393666343839383661383235323038393431366632616138646630353562366536373262393364656434316665636363616261623536356230383038303264613035333266616561616165373262383636623535356635313936613936616238356432366335643233363261326439333036336635616135333838633937336433613031396231643836336664323933396231643062353962363133393665613635333164353438306134333231633833373534313537633434623532343165616265225d2c22726576657274696e67486173686573223a5b5d7d00000000000000000000000000'
		const crqPromise = BlockAd.buyAd.sendConfidentialRequest(blockLimit, extra, {confidentialInputs})
		await expect(crqPromise).to.eventually.be.rejectedWith(/insufficient funds.*/)
	}).timeout(100000)

	it('wrong kettle address', async () => {
		const pk = '1111111111111111111111111111111111111111111111111111111111111122'
		const kettleUrl = 'https://rpc.rigil.suave.flashbots.net'
		const blockadAbi = fetchJSON('./tests/abis/BlockAdAuction.json')

		const provider = new SuaveProvider(kettleUrl)
		provider.setKettleAddress('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef')
		const wallet = new SuaveWallet(pk, provider)
		const blockadAddress = '0xf75e0C824Df257c02fe7493d6FF6d98F1ddab467'
        
		const BlockAd = new SuaveContract(blockadAddress, blockadAbi, wallet)
		const blockLimit = 100
		const extra = '🚀🚀'
		const confidentialInputs = '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000f37b22747873223a5b22307866383636383162613836303861393666343839383661383235323038393431366632616138646630353562366536373262393364656434316665636363616261623536356230383038303264613035333266616561616165373262383636623535356635313936613936616238356432366335643233363261326439333036336635616135333838633937336433613031396231643836336664323933396231643062353962363133393665613635333164353438306134333231633833373534313537633434623532343165616265225d2c22726576657274696e67486173686573223a5b5d7d00000000000000000000000000'
		const crqPromise = BlockAd.buyAd.sendConfidentialRequest(blockLimit, extra, {confidentialInputs})
		await expect(crqPromise).to.eventually.be.rejectedWith(/unknown account/)
	}).timeout(100000)

	it('wrong chain', async () => {
		const pk = '1111111111111111111111111111111111111111111111111111111111111122'
		const kettleUrl = 'https://ethereum-holesky-rpc.publicnode.com'
		const blockadAbi = fetchJSON('./tests/abis/BlockAdAuction.json')

		const provider = new SuaveProvider(kettleUrl)
		provider.setKettleAddress('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef')
		const wallet = new SuaveWallet(pk, provider)
		const blockadAddress = '0xf75e0C824Df257c02fe7493d6FF6d98F1ddab467'
        
		const BlockAd = new SuaveContract(blockadAddress, blockadAbi, wallet)
		const blockLimit = 100
		const extra = '🚀🚀'
		const confidentialInputs = '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000f37b22747873223a5b22307866383636383162613836303861393666343839383661383235323038393431366632616138646630353562366536373262393364656434316665636363616261623536356230383038303264613035333266616561616165373262383636623535356635313936613936616238356432366335643233363261326439333036336635616135333838633937336433613031396231643836336664323933396231643062353962363133393665613635333164353438306134333231633833373534313537633434623532343165616265225d2c22726576657274696e67486173686573223a5b5d7d00000000000000000000000000'
		const crqPromise = BlockAd.buyAd.sendConfidentialRequest(blockLimit, extra, {confidentialInputs})
		await expect(crqPromise).to.eventually.be.rejectedWith(/transaction type not supported/)
	})

})

function fetchJSON(path: string) {
	const content = fs.readFileSync(path, 'utf8')
	return JSON.parse(content)
}