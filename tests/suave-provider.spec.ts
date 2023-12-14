import { Contract, JsonRpcProvider } from 'ethers'
import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'

import { SuaveContract, SuaveProvider, SuaveWallet } from '../src'

chai.use(chaiAsPromised)
const { expect } = chai


describe('Confidential Provider/Wallet/Contract', async () => {

	it('Non-confidential call', async () => {
		const blockadAbi = require('./abis/BlockAdAuction.json')
		const provider = new JsonRpcProvider('https://rpc.rigil.suave.flashbots.net')
		const blockadAddress = '0xee9794177378e98268b30Ca14964f2FDFc71bD6D'
		const BlockAd = new Contract(blockadAddress, blockadAbi, provider)
		const isInitialized = await BlockAd.isInitialized()
		expect(isInitialized).to.be.true
	})

	// it('Confidential send response', async () => {
	//     const pk = '1111111111111111111111111111111111111111111111111111111111111111'
	//     const executionNode = '0x03493869959c866713c33669ca118e774a30a0e5'
	//     const executionNodeUrl = 'https://rpc.rigil.suave.flashbots.net'
	//     const blockadAbi = require('./tests/abis/BlockAdAuction.json')

	//     const provider = new SuaveProvider(executionNodeUrl, executionNode)
	//     const wallet = new SuaveWallet(pk, provider)
	//     const blockadAddress = '0xee9794177378e98268b30Ca14964f2FDFc71bD6D'
        
	//     const BlockAd = new SuaveContract(blockadAddress, blockadAbi, wallet)
	//     const blockLimit = 100
	//     const extra = '🚀'
	//     const confidentialInputs = '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000f37b22747873223a5b22307866383636383162633836303861393666343839383732383235323038393431366632616138646630353562366536373262393364656434316665636363616261623536356230383038303264613033383730666466623934313835346236363663343265663266633333356231336161366637666430393436646337393039326466323235323365316637643435613036333465353435383236303535356138636466353261363234363035343061356664386439373461303332333866633235646663643431653833303061643764225d2c22726576657274696e67486173686573223a5b5d7d00000000000000000000000000'
	//     const crq = await BlockAd.buyAd.sendConfidentialRequest(blockLimit, extra, {confidentialInputs})

	//     expect(crq).to.have.property('requestRecord')
	//     expect(crq).to.have.property('confidentialComputeResult')
	// }).timeout(100000)

	it('Confidential err response', async () => {
		const pk = '1111111111111111111111111111111111111111111111111111111111111111'
		const executionNode = '0x03493869959c866713c33669ca118e774a30a0e5'
		const executionNodeUrl = 'https://rpc.rigil.suave.flashbots.net'
		const blockadAbi = require('./abis/BlockAdAuction.json')

		const provider = new SuaveProvider(executionNodeUrl, executionNode)
		const wallet = new SuaveWallet(pk, provider)
		const blockadAddress = '0xf75e0C824Df257c02fe7493d6FF6d98F1ddab467'
        
		const BlockAd = new SuaveContract(blockadAddress, blockadAbi, wallet)
		const blockLimit = 100
		const extra = '🚀🚀'
		const confidentialInputs = '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000f37b22747873223a5b22307866383636383162613836303861393666343839383661383235323038393431366632616138646630353562366536373262393364656434316665636363616261623536356230383038303264613035333266616561616165373262383636623535356635313936613936616238356432366335643233363261326439333036336635616135333838633937336433613031396231643836336664323933396231643062353962363133393665613635333164353438306134333231633833373534313537633434623532343165616265225d2c22726576657274696e67486173686573223a5b5d7d00000000000000000000000000'
		const crqPromise = BlockAd.buyAd.sendConfidentialRequest(blockLimit, extra, {confidentialInputs})
		await expect(crqPromise).to.eventually.be.rejectedWith(/SuaveError\('nonce too low:.*/)
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

})
