import { parseHexArg, keccak256, removeLeadingZeros } from './utils'
import { ethers, Wallet, BigNumberish } from 'ethers'
import {
    CONFIDENTIAL_COMPUTE_REQUEST_TYPE,
    CONFIDENTIAL_COMPUTE_RECORD_TYPE,
} from './const'


export type SigSplit = {
    r: string,
    s: string,
    v: number,
}

export class ConfidentialComputeRequest {
	confidentialComputeRecord: ConfidentialComputeRecord
	confidentialInputs: string

	constructor(confidentialComputeRecord: ConfidentialComputeRecord, confidentialInputs: string) {
		this.confidentialComputeRecord = confidentialComputeRecord
		this.confidentialInputs = confidentialInputs
	}

	rlpEncode(): string {
		const ccr = this.confidentialComputeRecord
		if (!ccr.confidentialInputsHash || !ccr.r || !ccr.s || !ccr.v) {
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
		return callback(this._hash()).then(({ v, s, r }) => {
			this.confidentialComputeRecord.r = removeLeadingZeros(r)
			this.confidentialComputeRecord.s = removeLeadingZeros(s)
			this.confidentialComputeRecord.v = Number(v) == 27 ? '0x' : '0x01'
			return this
		})
	}

    signWithCallback(callback: (hash: string) => SigSplit): ConfidentialComputeRequest {
        const { v, s, r } = callback(this._hash())
        this.confidentialComputeRecord.r = removeLeadingZeros(r)
        this.confidentialComputeRecord.s = removeLeadingZeros(s)
        this.confidentialComputeRecord.v = Number(v) == 27 ? '0x' : '0x01'

		return this
	}

    signWithWallet(wallet: Wallet): ConfidentialComputeRequest {
        return this.signWithCallback((h) => {
            return wallet.signingKey.sign(h) as SigSplit
        })
    }

    signWithPK(pk: string): ConfidentialComputeRequest {
        return this.signWithWallet(new Wallet(pk))
    }

	_hash(): string {
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

export interface ConfidentialComputeRecord {
    nonce: string | number,
    to: string,
    gas: BigNumberish,
    gasPrice: BigNumberish,
    value: BigNumberish,
    data: string,
    executionNode: string,
    chainId: string | number,
    confidentialInputsHash?: null | string,
    v?: null | BigNumberish,
    r?: null | BigNumberish,
    s?: null | BigNumberish,
}