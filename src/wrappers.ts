import {
	ConfidentialComputeRequest,
	ConfidentialComputeRecord,
} from './confidential-types'
import { 
	TransactionResponse,
	TransactionReceipt, 
	BaseContractMethod,
	JsonRpcProvider,
	InterfaceAbi,
	Interface, 
	Contract, 
	Wallet, 
} from 'ethers'


export class SuaveProvider extends JsonRpcProvider {
	executionNode: string | null

	constructor(url: string, executionNode: string = null) {
		super(url)
		this.executionNode = executionNode
	}

	async getConfidentialTransaction(hash: string): Promise<ConfidentialTransactionResponse> {
		const raw = await super.send('eth_getTransactionByHash', [hash])
		return new ConfidentialTransactionResponse(raw, this)
	}

}
export class SuaveWallet extends Wallet {
	sprovider: SuaveProvider

	constructor(privateKey: string, provider?: SuaveProvider) {
		super(privateKey, provider)
		this.sprovider = provider
	}
	
	static random(provider?: SuaveProvider): SuaveWallet {
		return new SuaveWallet(Wallet.createRandom().privateKey, provider)
	}

}

interface ExtendedContractMethod extends BaseContractMethod<any[], any, any> {
    prepareConfidentialRequest?: (args: any) => Promise<ConfidentialComputeRequest>;
    sendConfidentialRequest?: (args: any) => Promise<ConfidentialTransactionResponse>;
}

export class SuaveContract {
	[k: string]: any;
	wallet: SuaveWallet
	inner: Contract

	constructor(address: string, abi: Interface | InterfaceAbi, wallet: SuaveWallet) {
		this.inner = new Contract(address, abi, wallet)
		this.wallet = wallet

		return new Proxy(this, {
			get: (target, prop, receiver): ExtendedContractMethod | any => {
				const item = Reflect.get(target.inner, prop, receiver)
				if (typeof item === 'function' && target.inner.interface.hasFunction(prop as string)) {
					const extendedMethod: ExtendedContractMethod = item

					const prepareConfidentialRequest = async (...args: any[]): Promise<ConfidentialComputeRequest> => {
						const overrides = args[args.length - 1]
						const contractTx = await extendedMethod.populateTransaction(...args)
						contractTx.type = 0
						contractTx.gasLimit = BigInt(overrides.gasLimit || 1e7)
						const filledTx = await target.wallet.populateTransaction(contractTx)
						if (wallet.sprovider.executionNode === null) {
							throw new Error('No execution node set')
						}
						const crc = new ConfidentialComputeRecord(filledTx, wallet.sprovider.executionNode)
						const crq = new ConfidentialComputeRequest(crc, overrides.confidentialInputs)
						return crq
					}

					extendedMethod.prepareConfidentialRequest = prepareConfidentialRequest
					extendedMethod.sendConfidentialRequest = async (...args: any[]) => {
						const crq = (await prepareConfidentialRequest(...args))
							.signWithWallet(target.wallet)
							.rlpEncode()
						const sprovider = target.wallet.sprovider
						const txhash = await sprovider.send('eth_sendRawTransaction', [crq])
							.catch(target.#formatSubmissionError.bind(target))
						const txRes = await sprovider.getConfidentialTransaction(txhash)
						return txRes
					}

					return extendedMethod
				}
				return item as ExtendedContractMethod
			},
			has: (target, prop) => {
				return Reflect.has(target.inner, prop)
			}
		})

	}
    
	#formatSubmissionError(error: any) {
		const errMsg = error?.error?.message
		if (!errMsg) {
			const err = error || 'Unknown error'
			throw new ConfidentialRequestError(err)
		}
		const re = /^execution reverted: (?<msg>0x([0-f][0-f])*)/
		const matched = errMsg.match(re)
		if (!matched || !matched.groups?.msg) {
			throw new ConfidentialRequestError(errMsg)
		}
		const errSlice = matched.groups.msg
		let parsedErr
		try {
			parsedErr = this.inner.interface.parseError(errSlice)
		} catch {
			throw new ConfidentialExecutionError(errMsg)
		}
		const fargs = parsedErr.args.join('\', \'')
		const fmsg = `${parsedErr.name}('${fargs}')\n`

		throw new ConfidentialExecutionError(fmsg)
	}
}

class ConfidentialExecutionError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ConfidentialCallError'
		this.stack = this.stack.replace(/^.*Error: /, `${this.name}: `)
	}
}

class ConfidentialRequestError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ConfidentialRequestError'
		this.stack = this.stack.replace(/^.*Error: /, `${this.name}: `)
	}
}

export class ConfidentialTransactionResponse  {
	readonly #provider: SuaveProvider
	readonly blockNumber: number
	readonly blockHash: string
	readonly transactionIndex: number
	readonly hash: string
	readonly type: number
	readonly to: string
	readonly from: string
	readonly nonce: number
	readonly gas: number
	readonly gasPrice: bigint
	readonly input: string
	readonly value: bigint
	readonly chainId: bigint
	readonly v: number
	readonly r: string
	readonly s: string
	readonly requestRecord: RequestRecord
	readonly confidentialComputeResult: string

	constructor(rawJson: {[k: string]: any}, provider: SuaveProvider) {
		const formatted = new JsonRpcProvider()._wrapTransactionResponse((rawJson as any), null)
		const rr = new RequestRecord(rawJson.requestRecord)
		this.#provider = provider
		this.blockNumber = formatted.blockNumber
		this.blockHash = formatted.blockHash
		this.transactionIndex = formatted.index
		this.hash = formatted.hash
		this.type = formatted.type
		this.to = formatted.to
		this.from = formatted.from
		this.nonce = formatted.nonce
		this.gas = Number(formatted.gasLimit)
		this.gasPrice = formatted.gasPrice
		this.input = formatted.data
		this.value = formatted.value
		this.chainId = formatted.chainId
		this.v = formatted.signature.v
		this.r = formatted.signature.r
		this.s = formatted.signature.s
		this.requestRecord = rr
		this.confidentialComputeResult = rawJson.confidentialComputeResult
	}

	wait(confirmations: number = 1, timeout?: number): Promise<TransactionReceipt> {
		return new TransactionResponse(this as any, this.#provider).wait(confirmations, timeout)
	}
}

export class RequestRecord {
	readonly chainId: bigint
	readonly confidentialInputsHash: string
	readonly gas: number
	readonly gasPrice: bigint
	readonly hash: string
	readonly input: string
	readonly kettleAddress: string
	readonly maxFeePerGas: bigint | null
	readonly maxPriorityFeePerGas: bigint | null
	readonly nonce: number
	readonly r: string
	readonly s: string
	readonly to: string
	readonly type: number
	readonly v: number
	readonly value: bigint

	constructor(rawJson: {[k: string]: string}) {
		this.chainId = BigInt(rawJson.chainId)
		this.confidentialInputsHash = rawJson.confidentialInputsHash
		this.gas = parseInt(rawJson.gas)
		this.gasPrice = BigInt(rawJson.gasPrice)
		this.hash = rawJson.hash
		this.input = rawJson.input
		this.kettleAddress = rawJson.kettleAddress
		this.maxFeePerGas = rawJson.maxFeePerGas ? BigInt(rawJson.maxFeePerGas) : null
		this.maxPriorityFeePerGas = rawJson.maxPriorityFeePerGas ? BigInt(rawJson.maxPriorityFeePerGas) : null
		this.nonce = parseInt(rawJson.nonce)
		this.r = rawJson.r
		this.s = rawJson.s
		this.to = rawJson.to
		this.type = parseInt(rawJson.type)
		this.v = parseInt(rawJson.v)
		this.value = BigInt(rawJson.value)
	}
}