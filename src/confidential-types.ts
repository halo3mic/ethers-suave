import { ethers, Wallet, BigNumberish, Signature } from 'ethers'
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
				ccr.kettleAddress,
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

	async signWithAsyncCallback(callback: (hash: string) => Promise<Signature>): Promise<ConfidentialComputeRequest> {
		return callback(this.#hash()).then(this.#setSignature)
	}

	signWithCallback(callback: (hash: string) => Signature): ConfidentialComputeRequest {
		return this.#setSignature(callback(this.#hash()))
	}

	signWithWallet(wallet: Wallet): ConfidentialComputeRequest {
		return this.signWithCallback((h) => wallet.signingKey.sign(h))
	}

	signWithPK(pk: string): ConfidentialComputeRequest {
		return this.signWithWallet(new Wallet(pk))
	}

	#hash(): string {
		const confidentialInputsHash = keccak256(this.confidentialInputs)
		this.confidentialComputeRecord.confidentialInputsHash = confidentialInputsHash
		const ccr = this.confidentialComputeRecord

		const elements = [
			ccr.kettleAddress, 
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

	#setSignature(sig: Signature): ConfidentialComputeRequest {
		const { r, s, v } = parseSignature(sig)
		this.confidentialComputeRecord.r = r
		this.confidentialComputeRecord.s = s
		this.confidentialComputeRecord.v = v
		return this
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
	kettleAddress?: string,
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
	readonly kettleAddress: string
	readonly chainId: BigNumberish
	confidentialInputsHash: null | string
	v: null | BigNumberish
	r: null | BigNumberish
	s: null | BigNumberish

	constructor(
		transaction: any, 
		kettleAddress: string,
		overrides?: CCROverrides,
	) {
		this.nonce = transaction.nonce || overrides?.nonce || 0
		this.to = transaction.to?.toString() || overrides?.to || ethers.ZeroAddress
		this.gas = transaction.gasLimit || transaction.gas || overrides?.gas
		this.gasPrice = transaction.gasPrice || overrides?.gasPrice || '0x'
		this.value = transaction.value || overrides?.value || '0x'
		this.data = transaction.data || transaction.input || overrides?.data
		this.kettleAddress = kettleAddress || overrides?.kettleAddress
		this.chainId = transaction.chainId || overrides?.chainId || 1
		this.#checkFields([
			'kettleAddress',
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
		if (this[key] === null || this[key] === undefined) {
			throw new Error(`Missing ${key}`)
		}
	}
}

export type SigSplit = {
    r: string,
    s: string,
    v: number,
}

function parseSignature(sig: Signature): SigSplit {
	return {
		r: removeLeadingZeros(sig.r),
		s: removeLeadingZeros(sig.s),
		v: Number(sig.v) == 27 ? 0 : 1,
	}
}
