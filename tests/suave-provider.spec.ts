import { Contract, JsonRpcProvider, Wallet } from 'ethers'
import { expect } from 'chai'
import { SuaveContract, SuaveProvider, SuaveWallet } from '../src/index'

import fs from 'fs'

function require(path: string) {
    return JSON.parse(fs.readFileSync(path).toString())
}


describe.only('SuaveProvider', async () => {

    it('Non-confidential call', async () => {
		const blockadAbi = require('./tests/abis/BlockAdAuction.json')
        const provider = new JsonRpcProvider('https://rpc.rigil.suave.flashbots.net')
        const blockadAddress = '0xee9794177378e98268b30Ca14964f2FDFc71bD6D'
        const BlockAd = new Contract(blockadAddress, blockadAbi, provider)
        const isInitialized = await BlockAd.isInitialized()
        expect(isInitialized).to.be.true
	})

    it.only('Confidential send', async () => {
        const blockadAbi = require('./tests/abis/BlockAdAuction.json')
        const executionNodeUrl = 'https://rpc.rigil.suave.flashbots.net'
        const executionNode = '0x03493869959c866713c33669ca118e774a30a0e5'
        const pk = '1111111111111111111111111111111111111111111111111111111111111111'
        const provider = new SuaveProvider(executionNodeUrl, executionNode)
        const wallet = new SuaveWallet(pk, provider)
        const blockadAddress = '0xee9794177378e98268b30Ca14964f2FDFc71bD6D'
        
        const BlockAd = new SuaveContract(blockadAddress, blockadAbi, wallet)
        const blockLimit = 100
        const extra = '🚀'
        const confidentialInputs = '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000f37b22747873223a5b22307866383636383162633836303861393666343839383732383235323038393431366632616138646630353562366536373262393364656434316665636363616261623536356230383038303264613033383730666466623934313835346236363663343265663266633333356231336161366637666430393436646337393039326466323235323365316637643435613036333465353435383236303535356138636466353261363234363035343061356664386439373461303332333866633235646663643431653833303061643764225d2c22726576657274696e67486173686573223a5b5d7d00000000000000000000000000'
        const crq = await BlockAd.buyAd.sendConfidentialRequest(blockLimit, extra, {confidentialInputs})
        console.log(crq)
    }).timeout(100000)


})


// async function main() {
    

    // const calldata = adbidInterface.encodeFunctionData('buyAd', [blockLimit, extra])
	// const confidentialRec = await utils.createConfidentialComputeRecord(
	// 	suaveSigner,
	// 	calldata, 
	// 	executionNodeAdd, 
	// 	adbuilderAdd,
	// )
	// const confidentialBytes = await utils.makePaymentBundleBytes(goerliSigner, bidAmount)
	// const inputBytes = new ConfidentialComputeRequest(confidentialRec, confidentialBytes)
	// 	.signWithWallet(suaveSigner)
	// 	.rlpEncode()
	// const result = await utils.submitRawTxPrettyRes(suaveSigner.provider, inputBytes, adbidInterface, 'SubmitAd')
// }