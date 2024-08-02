import { ethers, Wallet, BigNumberish, Signature } from 'ethers'
import { parseHexArg, keccak256, removeLeadingZeros } from './utils'
import {
	CONFIDENTIAL_COMPUTE_REQUEST_TYPE,
	CONFIDENTIAL_COMPUTE_RECORD_TYPE,
} from './const'


export class ConfidentialComputeRequest {
	confidentialComputeRecord: ConfidentialComputeRecord
	readonly confidentialInputs: string

	constructor(
		confidentialComputeRecord: ConfidentialComputeRecord, 
		confidentialInputs: string = '0x'
	) {
		this.confidentialComputeRecord = confidentialComputeRecord
		this.confidentialInputs = confidentialInputs
		this.confidentialComputeRecord.confidentialInputsHash = keccak256(confidentialInputs)
	}

	async signWithAsyncCallback(
		callback: (hash: string) => Promise<Signature>,
		useEIP712?: boolean
	): Promise<ConfidentialComputeRequest> {
		return callback(this.#hash(useEIP712)).then((sig) => {
			this.confidentialComputeRecord.signature = parseSignature(sig)
			return this
		})
	}

	signWithCallback(
		callback: (hash: string) => Signature,
		useEIP712?: boolean
	): ConfidentialComputeRequest {
		this.confidentialComputeRecord.signature = parseSignature(callback(this.#hash(useEIP712)))
		return this
	}

	signWithWallet(wallet: Wallet, useEIP712?: boolean): ConfidentialComputeRequest {
		return this.signWithCallback((h) => wallet.signingKey.sign(h), useEIP712)
	}

	signWithPK(pk: string, useEIP712?: boolean): ConfidentialComputeRequest {
		return this.signWithWallet(new Wallet(pk), useEIP712)
	}

	rlpEncode(): string {
		const crecord = this.confidentialComputeRecord
		crecord.checkFields(['confidentialInputsHash', 'signature'])
		const elements = [
			[
				crecord.nonce, 
				crecord.gasPrice, 
				crecord.gas,
				crecord.to,
				crecord.value, 
				crecord.data, 
				crecord.kettleAddress,
				crecord.confidentialInputsHash,
				crecord.isEIP712,
				crecord.chainId,
				crecord.signature.v, 
				crecord.signature.r, 
				crecord.signature.s, 
			].map(parseHexArg),
			this.confidentialInputs,
		]
		const rlpEncoded = ethers.encodeRlp(elements).slice(2)
		const encodedWithPrefix = CONFIDENTIAL_COMPUTE_REQUEST_TYPE + rlpEncoded
            
		return encodedWithPrefix
	}

	#hash(useEIP712: boolean = false): string {
		const crecord = this.confidentialComputeRecord
		return useEIP712 ? crecord.eip712Hash() : crecord.hash()
	}

}

export interface CRecordLike {
	to?: string,
	value?: BigNumberish,
	data?: string,
	isEIP712?: boolean,
	gas?: BigNumberish,
	nonce?: number,
	gasPrice?: BigNumberish,
	kettleAddress?: string,
	chainId?: BigNumberish,
}

export class ConfidentialComputeRecord {
	readonly to: string
	readonly value: BigNumberish
	readonly data: string
	readonly isEIP712: boolean
	readonly gas: BigNumberish
	readonly nonce: number
	readonly gasPrice: BigNumberish
	readonly kettleAddress: string
	readonly chainId: BigNumberish
	confidentialInputsHash: null | string
	signature: null | SigSplit

	constructor(crecord: CRecordLike) {
		this.chainId = crecord.chainId
		this.data = crecord.data
		this.gas = crecord.gas
		this.gasPrice = crecord.gasPrice
		this.isEIP712 = crecord.isEIP712 || false
		this.kettleAddress = crecord.kettleAddress
		this.nonce = crecord.nonce
		this.to = crecord.to

		this.checkFields([
			'kettleAddress',
			'gasPrice',
			'chainId',
			'nonce',
			'data',
			'gas',
			'to',
		])
	}

	checkFields(keys: Array<string>) {
		for (const key of keys) {
			this.#checkField(key)
		}
	}

	#checkField(key: string) {
		if (this[key] === null || this[key] === undefined) {
			throw new Error(`Missing ${key}`)
		}
	}

	hash() {
		const elements = [
			this.kettleAddress, 
			this.confidentialInputsHash, 
			this.nonce, 
			this.gasPrice, 
			this.gas, 
			this.to,
			this.value,
			this.data,
		].map(parseHexArg)
		const rlpEncoded = ethers.encodeRlp(elements).slice(2)
		const encodedWithPrefix = CONFIDENTIAL_COMPUTE_RECORD_TYPE + rlpEncoded
		const hash = keccak256(encodedWithPrefix)
		return hash
	}

	eip712Hash() {
        const domain = {
            name: "ConfidentialRecord",
            verifyingContract: this.kettleAddress
        };
        const types = {
            ConfidentialRecord: [
                { name: "nonce", type: "uint64" },
                { name: "gasPrice", type: "uint256" },
                { name: "gas", type: "uint64" },
                { name: "to", type: "address" },
                { name: "value", type: "uint256" },
                { name: "data", type: "bytes" },
                { name: "kettleAddress", type: "address" },
                { name: "confidentialInputsHash", type: "bytes32" }
            ]
        };
        const message = {
            nonce: this.nonce,
            gasPrice: this.gasPrice,
            gas: this.gas,
            to: this.to,
            value: this.value ?? 0,
            data: this.data,
            kettleAddress: this.kettleAddress,
            confidentialInputsHash: this.confidentialInputsHash
        };
        const hash = ethers.TypedDataEncoder.hash(domain, types, message);
		
        return hash;
    }
	
}

function parseSignature(sig: Signature): SigSplit {
	const sigParsed = {} as SigSplit
	sigParsed.r = removeLeadingZeros(sig.r)
	sigParsed.s = removeLeadingZeros(sig.s)
	sigParsed.v = sig.v - 27
	return sigParsed
}

type SigSplit = {
	r: string,
	s: string,
	v: number,
}
