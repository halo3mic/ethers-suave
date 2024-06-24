import {
	ConfidentialComputeRequest,
	ConfidentialComputeRecord,
} from './confidential-types'
import {
	JsonRpcApiProvider,
	TransactionResponse,
	TransactionReceipt, 
	BaseContractMethod,
	JsonRpcProvider,
	AbstractSigner,
	BrowserProvider,
	Eip1193Provider,
	TransactionLike,
	JsonRpcSigner,
	InterfaceAbi,
	BaseContract,
	Interface, 
	Signature,
	Contract, 
	Wallet,
} from 'ethers'


export abstract class SuaveProvider extends JsonRpcApiProvider {
	abstract getConfidentialTransaction(hash: string): Promise<ConfidentialTransactionResponse>
	abstract getKettleAddress(): Promise<string>
	abstract setKettleAddress(address: string): void
}

export class SuaveJsonRpcProvider extends JsonRpcProvider implements SuaveProvider {
	#kettleAddress: string | undefined

	constructor(url: string) {
		super(url)
	}

	setKettleAddress(address: string) {
		this.#kettleAddress = address
	}

	async getConfidentialTransaction(hash: string): Promise<ConfidentialTransactionResponse> {
		const raw = await super.send('eth_getTransactionByHash', [hash])
		return new ConfidentialTransactionResponse(raw, this)
	}

	async getKettleAddress(): Promise<string> {
		if (!this.#kettleAddress) {
			const kettleAddress = await this.#getKettleAddress()
			this.setKettleAddress(kettleAddress)
		}
		return this.#kettleAddress
	}

	async #getKettleAddress(): Promise<string> {
		return this.send('eth_kettleAddress', []).then(r => r[0])
	}

}

export class SuaveBrowserProvider extends BrowserProvider implements SuaveProvider {
	#kettleAddress: string | undefined

	constructor(ethereum: Eip1193Provider) {
		super(ethereum)
	}

	setKettleAddress(address: string) {
		this.#kettleAddress = address
	}

	async getConfidentialTransaction(hash: string): Promise<ConfidentialTransactionResponse> {
		const raw = await this.send('eth_getTransactionByHash', [hash])
		return new ConfidentialTransactionResponse(raw, this)
	}

	async getKettleAddress(): Promise<string> {
		if (!this.#kettleAddress) {
			const kettleAddress = await this.#getKettleAddress()
			this.setKettleAddress(kettleAddress)
		}
		return this.#kettleAddress
	}

	async #getKettleAddress(): Promise<string> {
		return this.send('eth_kettleAddress', []).then(r => r[0])
	}

}

export abstract class SuaveSigner extends AbstractSigner {
	abstract sprovider: SuaveProvider
	abstract signCCR(ccr: ConfidentialComputeRequest): Promise<ConfidentialComputeRequest>
}

export class SuaveWallet extends Wallet implements SuaveSigner {
	sprovider: SuaveProvider

	constructor(privateKey: string, provider?: SuaveProvider) {
		super(privateKey, provider)
		this.sprovider = provider
	}
	
	static random(provider?: SuaveProvider): SuaveWallet {
		return new SuaveWallet(Wallet.createRandom().privateKey, provider)
	}

	static fromWallet(wallet: Wallet, provider?: SuaveProvider): SuaveWallet {
		return new SuaveWallet(wallet.privateKey, provider)
	}

	async signCCR(ccr: ConfidentialComputeRequest): Promise<ConfidentialComputeRequest> {
		return ccr.signWithCallback((h) => this.signingKey.sign(h))
	}

}

export class SuaveRpcSigner extends JsonRpcSigner implements SuaveSigner {
	sprovider: SuaveBrowserProvider

	constructor(provider: SuaveBrowserProvider, address: string) {
		super(provider, address)
	}

	async signCCR(ccr: ConfidentialComputeRequest): Promise<ConfidentialComputeRequest> {
		return ccr.signWithAsyncCallback(async (h) => this._legacySignMessage(h).then(Signature.from))
	}
}

interface ExtendedContractMethod extends BaseContractMethod<any[], any, any> {
    prepareConfidentialRequest?: (args: any) => Promise<ConfidentialComputeRequest>;
    sendConfidentialRequest?: (args: any) => Promise<ConfidentialTransactionResponse>;
}

type SuaveContractRunner = SuaveWallet | SuaveRpcSigner | SuaveBrowserProvider | SuaveJsonRpcProvider

export class SuaveContract extends BaseContract {
	[k: string]: any;
	inner: Contract

	constructor(address: string, abi: Interface | InterfaceAbi, runner: SuaveContractRunner) {
		super(address, abi, runner)
		this.inner = new Contract(address, abi, runner)

		return new Proxy(this, {
			get: (target, prop, receiver) => {
				const item = Reflect.get(target.inner, prop, receiver)
				if (typeof item === 'function' && target.inner.interface.hasFunction(prop as string)) {
					const extendedMethod: ExtendedContractMethod = item

					const prepareConfidentialRequest = async (...args: any[]): Promise<ConfidentialComputeRequest> => {
						const overrides = args[args.length - 1] || {}
						let tx = (await extendedMethod.populateTransaction(...args)) as TransactionLike
						tx.type = 0
						tx.gasLimit = BigInt(overrides.gasLimit || 1e7)

						if (this.#isRunnerSigner()) {
							tx = await (target.runner as SuaveWallet).populateTransaction(tx)
						} else {
							const provider = this.#provider()
							tx.nonce = overrides.nonce === undefined && tx.from
								? await provider.getTransactionCount(tx.from)
								: overrides.nonce
							tx.chainId = await provider.send('eth_chainId', [])
							tx.gasPrice = overrides.gasPrice == undefined ?
								await provider.send('eth_gasPrice', []) :
								overrides.gasPrice
						}
						const kettleAddress = await this.#provider().getKettleAddress()
						const crc = new ConfidentialComputeRecord(tx, kettleAddress)
						const crq = new ConfidentialComputeRequest(crc, overrides.confidentialInputs)
						return crq
					}

					extendedMethod.prepareConfidentialRequest = prepareConfidentialRequest
					extendedMethod.sendConfidentialRequest = async (...args: any[]) => {
						if (!this.#isRunnerSigner()) {
							throw new Error('Runner must be a wallet to send confidential requests')
						}
						const crq = (await prepareConfidentialRequest(...args))
							.signWithWallet(target.runner as SuaveWallet)
							.rlpEncode()
						const sprovider = target.#provider()
						const txhash = await sprovider.send('eth_sendRawTransaction', [crq])
							.catch(target.#throwFormattedSubmissionError.bind(target))
						const txRes = await sprovider.getConfidentialTransaction(txhash)
						return txRes
					}

					return extendedMethod
				}

				const actions = {
					'connect': (wallet: SuaveWallet) => target.connect(wallet),
					'attach': (address: string) => target.attach(address)
				}
				if (actions[prop as string]) {
					return actions[prop as string]
				}

				return item as ExtendedContractMethod
			},
			has: (target, prop) => {
				return Reflect.has(target.inner, prop)
			}
		})

	}

	connect(wallet: SuaveWallet): SuaveContract {
		return new SuaveContract(this.inner.target as string, this.inner.interface, wallet)
	}

	attach(address: string): SuaveContract {
		return new SuaveContract(address, this.inner.interface, this.wallet)
	}
    
	formatSubmissionError(error: any): string {
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

		return fmsg
	}

	#throwFormattedSubmissionError(error: any) {
		const fmsg = this.formatSubmissionError(error)
		throw new ConfidentialExecutionError(fmsg)
	}

	#isRunnerSigner(): boolean {
		return this.runner instanceof SuaveWallet || this.runner instanceof SuaveRpcSigner
	}

	#provider(): SuaveProvider {
		if (this.#isRunnerSigner()) {
			return (this.runner as SuaveSigner).sprovider
		} else {
			return this.runner as SuaveProvider
		}
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