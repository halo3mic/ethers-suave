
import { expect } from 'chai'
import { ethers } from 'ethers'

import { ConfidentialComputeRequest } from '../src/confidential-types'


describe('ConfidentialComputeRequest', async () => {

	it('sign ConfidentialComputeRequest correctly', async () => {
		const confidentialInputs = '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001ea7b22747873223a5b7b2274797065223a22307830222c226e6f6e6365223a22307830222c22746f223a22307863613135656439393030366236623130363038653236313631373361313561343766383933613661222c22676173223a22307835323038222c226761735072696365223a22307864222c226d61785072696f72697479466565506572476173223a6e756c6c2c226d6178466565506572476173223a6e756c6c2c2276616c7565223a223078336538222c22696e707574223a223078222c2276223a2230786366323838222c2272223a22307863313764616536383866396262393632376563636439626636393133626661346539643232383139353134626539323066343435653263666165343366323965222c2273223a22307835633337646235386263376161336465306535656638613432353261366632653464313462613639666338323631636333623630633962643236613634626265222c2268617368223a22307862643263653662653964333461366132393934373239346662656137643461343834646663363565643963383931396533626539366131353634363630656265227d5d2c2270657263656e74223a31302c224d617463684964223a5b302c302c302c302c302c302c302c302c302c302c302c302c302c302c302c305d7d00000000000000000000000000000000000000000000'
		const confidentialRecord = {
			'nonce': '0x22',
			'to': '0x780675d71ebe3d3ef05fae379063071147dd3aee',
			'gas': '0x0f4240',
			'gasPrice': '0x3b9aca00',
			'value': '0x',
			'data': '0x236eb5a70000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000780675d71ebe3d3ef05fae379063071147dd3aee0000000000000000000000000000000000000000000000000000000000000000',
			'executionNode': '0x7d83e42b214b75bf1f3e57adc3415da573d97bff',
			'chainId': '0x067932',
		}
		const pk = '1111111111111111111111111111111111111111111111111111111111111111'

		const confidentialRequest = new ConfidentialComputeRequest(confidentialRecord, confidentialInputs).signWithPK(pk)

		const filledRecord = confidentialRequest.confidentialComputeRecord
		expect(filledRecord.confidentialInputsHash).to.eq('0x89ee438ca379ac86b0478517d43a6a9e078cf51543acac0facd68aff313e2ff1')
		expect(filledRecord.v).to.eq('0x')
		expect(filledRecord.r).to.eq('0x1567c31c4bebcd1061edbaf22dd73fd40ff30f9a3ba4525037f23b2dc61e3473')
		expect(filledRecord.s).to.eq('0x2dce69262794a499d525c5d58edde33e06a5847b4d321d396b743700a2fd71a8')
	})

})


describe('ConfidentialSigning', () => {

	it('rlp encode signed ConfidentialComputeRequest correctly', async () => {
		const confidentialComputeRequestPrefix = '0x43'
		const confidentialRecord = {
			nonce: '0x22',
			to: '0x780675d71ebe3d3ef05fae379063071147dd3aee',
			gas: '0x0f4240',
			gasPrice: '0x3b9aca00',
			val: '0x',
			input: '0x236eb5a70000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000780675d71ebe3d3ef05fae379063071147dd3aee0000000000000000000000000000000000000000000000000000000000000000',
			executionNode: '0x7d83e42b214b75bf1f3e57adc3415da573d97bff',
			chainId: '0x067932',
			confidentialInputsHash: '0x89ee438ca379ac86b0478517d43a6a9e078cf51543acac0facd68aff313e2ff1',
			v: '0x',
			r: '0x1567c31c4bebcd1061edbaf22dd73fd40ff30f9a3ba4525037f23b2dc61e3473', 
			s: '0x2dce69262794a499d525c5d58edde33e06a5847b4d321d396b743700a2fd71a8',
		}
		const confidentialRequest = {
			confidentialRecord,
			confidentialInputs: '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001ea7b22747873223a5b7b2274797065223a22307830222c226e6f6e6365223a22307830222c22746f223a22307863613135656439393030366236623130363038653236313631373361313561343766383933613661222c22676173223a22307835323038222c226761735072696365223a22307864222c226d61785072696f72697479466565506572476173223a6e756c6c2c226d6178466565506572476173223a6e756c6c2c2276616c7565223a223078336538222c22696e707574223a223078222c2276223a2230786366323838222c2272223a22307863313764616536383866396262393632376563636439626636393133626661346539643232383139353134626539323066343435653263666165343366323965222c2273223a22307835633337646235386263376161336465306535656638613432353261366632653464313462613639666338323631636333623630633962643236613634626265222c2268617368223a22307862643263653662653964333461366132393934373239346662656137643461343834646663363565643963383931396533626539366131353634363630656265227d5d2c2270657263656e74223a31302c224d617463684964223a5b302c302c302c302c302c302c302c302c302c302c302c302c302c302c302c305d7d00000000000000000000000000000000000000000000',
		}
		const elements = [
			[
				confidentialRecord.nonce, 
				confidentialRecord.gasPrice, 
				confidentialRecord.gas,
				confidentialRecord.to,
				confidentialRecord.val, 
				confidentialRecord.input, 
				confidentialRecord.executionNode,
				confidentialRecord.confidentialInputsHash,
				confidentialRecord.chainId,
				confidentialRecord.v, 
				confidentialRecord.r, 
				confidentialRecord.s, 
			],
			confidentialRequest.confidentialInputs,
		]
		const rlpEncoded = confidentialComputeRequestPrefix + ethers.encodeRlp(elements).slice(2)

		const expected = '0x43f903a9f9016322843b9aca00830f424094780675d71ebe3d3ef05fae379063071147dd3aee80b8c4236eb5a70000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000780675d71ebe3d3ef05fae379063071147dd3aee0000000000000000000000000000000000000000000000000000000000000000947d83e42b214b75bf1f3e57adc3415da573d97bffa089ee438ca379ac86b0478517d43a6a9e078cf51543acac0facd68aff313e2ff18306793280a01567c31c4bebcd1061edbaf22dd73fd40ff30f9a3ba4525037f23b2dc61e3473a02dce69262794a499d525c5d58edde33e06a5847b4d321d396b743700a2fd71a8b90240000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001ea7b22747873223a5b7b2274797065223a22307830222c226e6f6e6365223a22307830222c22746f223a22307863613135656439393030366236623130363038653236313631373361313561343766383933613661222c22676173223a22307835323038222c226761735072696365223a22307864222c226d61785072696f72697479466565506572476173223a6e756c6c2c226d6178466565506572476173223a6e756c6c2c2276616c7565223a223078336538222c22696e707574223a223078222c2276223a2230786366323838222c2272223a22307863313764616536383866396262393632376563636439626636393133626661346539643232383139353134626539323066343435653263666165343366323965222c2273223a22307835633337646235386263376161336465306535656638613432353261366632653464313462613639666338323631636333623630633962643236613634626265222c2268617368223a22307862643263653662653964333461366132393934373239346662656137643461343834646663363565643963383931396533626539366131353634363630656265227d5d2c2270657263656e74223a31302c224d617463684964223a5b302c302c302c302c302c302c302c302c302c302c302c302c302c302c302c305d7d00000000000000000000000000000000000000000000'
		expect(rlpEncoded).to.eq(expected)
	})

	it('hash ConfidentialCompute(Request/Record) correctly', () => {
		const confidentialComputeRecordPrefix = '0x42'
		const args = {
			'nonce': '0x18',
			'to': '0x772092ff73c43883a547bea1e1e007ec0d33478e',
			'gas': '0x0f4240',
			'gasPrice': '0x3b9aca00',
			'value': '0x', // ! 0x00 != 0x
			'input': '0x236eb5a70000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000772092ff73c43883a547bea1e1e007ec0d33478e0000000000000000000000000000000000000000000000000000000000000000',
			'executionNode': '0x7d83e42b214b75bf1f3e57adc3415da573d97bff',
			'confidentialInputs': '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001ea7b22747873223a5b7b2274797065223a22307830222c226e6f6e6365223a22307830222c22746f223a22307838626265386333346637396433353534666631626236643932313733613237666661356237313233222c22676173223a22307835323038222c226761735072696365223a22307864222c226d61785072696f72697479466565506572476173223a6e756c6c2c226d6178466565506572476173223a6e756c6c2c2276616c7565223a223078336538222c22696e707574223a223078222c2276223a2230786366323837222c2272223a22307862396433643236643135633630376237653537353235333761336163326432363330643161653036386163353138616539393862613439313236323134383135222c2273223a22307835636534666439613565376533373138656630613731386533633462333135306538373036376533373361333439323538643962333330353930396332303565222c2268617368223a22307863633934626637386463366631373963663331376638643839353438393364393730303366333266353332623530623865333861626631333939353364643664227d5d2c2270657263656e74223a31302c224d617463684964223a5b302c302c302c302c302c302c302c302c302c302c302c302c302c302c302c305d7d00000000000000000000000000000000000000000000',
		}
		const confidentialInputsHash = ethers.keccak256(args.confidentialInputs)

		const rlpHashElements = ethers.encodeRlp([
			args.executionNode, 
			confidentialInputsHash, 
			args.nonce, 
			args.gasPrice, 
			args.gas, 
			args.to,
			args.value,
			args.input,
		])
		const hash = ethers.keccak256(confidentialComputeRecordPrefix + rlpHashElements.slice(2))
    
		expect(hash).to.eq('0x72ffab40c5116931200ca87052360787559871297b3615a8c2ff28be738ac59f')
	})

	it('confidential inputs hash', () => {
		const confInputs = '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001ea7b22747873223a5b7b2274797065223a22307830222c226e6f6e6365223a22307830222c22746f223a22307832353437666539326362356134303935306234393638353336343133306638616362326666646435222c22676173223a22307835323038222c226761735072696365223a22307864222c226d61785072696f72697479466565506572476173223a6e756c6c2c226d6178466565506572476173223a6e756c6c2c2276616c7565223a223078336538222c22696e707574223a223078222c2276223a2230786366323838222c2272223a22307864306565316361303834306335643061306631346536666139336438316237643332623762613663316337316461626431326539653234336534383630386430222c2273223a22307831313834633237386662366235663933633639383064383339343465376562633532353566343430633831396130663937663839663434333838623938613736222c2268617368223a22307862373039323338633831653563323633303839623330633161343234336533366439313631323664656166356361346663633934383763636131366439323938227d5d2c2270657263656e74223a31302c224d617463684964223a5b302c302c302c302c302c302c302c302c302c302c302c302c302c302c302c305d7d00000000000000000000000000000000000000000000'
		const hash = ethers.keccak256(confInputs)
		expect(hash).to.eq('0x06fb908c6cb4da7308cdeb2dc4293288dc85dd3ac77c8e0702e923a3b092ea7f')
	})

})
