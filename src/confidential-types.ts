import { ethers, Wallet, BigNumberish } from 'ethers'
import { parseHexArg, keccak256, removeLeadingZeros } from './utils'
import {
	CONFIDENTIAL_COMPUTE_REQUEST_TYPE,
	CONFIDENTIAL_COMPUTE_RECORD_TYPE,
} from './const'


export class ConfidentialComputeRequest {
	readonly confidentialComputeRecord: ConfidentialComputeRecord
	readonly confidentialInputs: string

	constructor(confidentialComputeRecord: ConfidentialComputeRecord, confidentialInputs: string = '0x') {
		this.confidentialComputeRecord = confidentialComputeRecord
		this.confidentialInputs = confidentialInputs
	}

	rlpEncode(): string {
		const ccr = this.confidentialComputeRecord
		if (!ccr.confidentialInputsHash || !ccr.r || !ccr.s || ccr.v === null) {
			throw new Error('Missing fields')
		}
		const elements = [
			[
				ccr.nonce, 
				ccr.gasPrice, 
				ccr.gas,
				ccr.to,
				ccr.value, 
				ccr.data, 
				ccr.executionNode,
				ccr.confidentialInputsHash,
				ccr.chainId,
				ccr.v, 
				ccr.r, 
				ccr.s, 
			].map(parseHexArg),
			this.confidentialInputs,
		]
		const rlpEncoded = ethers.encodeRlp(elements).slice(2)
		const encodedWithPrefix = CONFIDENTIAL_COMPUTE_REQUEST_TYPE + rlpEncoded
            
		return encodedWithPrefix
	}

	async signWithAsyncCallback(callback: (hash: string) => Promise<SigSplit>): Promise<ConfidentialComputeRequest> {
		return callback(this.#hash()).then((sig) => {
			const { v, s, r } = parseSignature(sig)
			this.confidentialComputeRecord.r = r
			this.confidentialComputeRecord.s = s
			this.confidentialComputeRecord.v = v
			return this
		})
	}

	signWithCallback(callback: (hash: string) => SigSplit): ConfidentialComputeRequest {
		const { v, s, r } = parseSignature(callback(this.#hash()))
		this.confidentialComputeRecord.r = r
		this.confidentialComputeRecord.s = s
		this.confidentialComputeRecord.v = v
		return this
	}

	signWithWallet(wallet: Wallet): ConfidentialComputeRequest {
		return this.signWithCallback((h) => {
			const sig = wallet.signingKey.sign(h)
			return { v: sig.v, r: sig.r, s: sig.s }
		})
	}

	signWithPK(pk: string): ConfidentialComputeRequest {
		return this.signWithWallet(new Wallet(pk))
	}

	#hash(): string {
		const confidentialInputsHash = keccak256(this.confidentialInputs)
		this.confidentialComputeRecord.confidentialInputsHash = confidentialInputsHash
		const ccr = this.confidentialComputeRecord

		const elements = [
			ccr.executionNode, 
			confidentialInputsHash, 
			ccr.nonce, 
			ccr.gasPrice, 
			ccr.gas, 
			ccr.to,
			ccr.value,
			ccr.data,
		].map(parseHexArg)
		const rlpEncoded = ethers.encodeRlp(elements).slice(2)
		const encodedWithPrefix = CONFIDENTIAL_COMPUTE_RECORD_TYPE + rlpEncoded
		const hash = keccak256(encodedWithPrefix)

		return hash
	}

}

interface CCROverrides {
	nonce?: number,
	gasPrice?: BigNumberish,
	gas?: BigNumberish,
	to?: string,
	value?: BigNumberish,
	data?: string,
	chainId?: BigNumberish,
	confidentialInputsHash?: string,
	executionNode?: string,
	v?: BigNumberish,
	r?: BigNumberish,
	s?: BigNumberish,
}

export class ConfidentialComputeRecord {
	readonly nonce: number
	readonly to: string
	readonly gas: BigNumberish
	readonly gasPrice: BigNumberish
	readonly value: BigNumberish
	readonly data: string
	readonly executionNode: string
	readonly chainId: BigNumberish
	confidentialInputsHash: null | string
	v: null | BigNumberish
	r: null | BigNumberish
	s: null | BigNumberish

	constructor(
		transaction: any, 
		executionNode: string,
		overrides?: CCROverrides,
	) {
		this.nonce = transaction.nonce || overrides?.nonce
		this.to = transaction.to?.toString() || overrides?.to || ethers.ZeroAddress
		this.gas = transaction.gasLimit || transaction.gas || overrides?.gas
		this.gasPrice = transaction.gasPrice || overrides?.gasPrice
		this.value = transaction.value || overrides?.value || '0x'
		this.data = transaction.data || transaction.input || overrides?.data
		this.executionNode = executionNode || overrides?.executionNode
		this.chainId = transaction.chainId || overrides?.chainId
		this.#checkFields([
			'executionNode',
			'gasPrice',
			'chainId',
			'nonce',
			'data',
			'gas',
		])
		this.confidentialInputsHash = null
		this.v = null
		this.r = null
		this.s = null
	}

	#checkFields(keys: Array<string>) {
		for (const key of keys) {
			this.#checkField(key)
		}
	}

	#checkField(key: string) {
		if (!this[key]) {
			throw new Error(`Missing ${key}`)
		}
	}
}

export type SigSplit = {
    r: string,
    s: string,
    v: number,
}

function parseSignature(sig: SigSplit): SigSplit {
	sig.r = removeLeadingZeros(sig.r)
	sig.s = removeLeadingZeros(sig.s)
	sig.v = Number(sig.v) == 27 ? 0 : 1
	return sig
}
