import { ConfidentialComputeRecord } from './confidential-types'
import { ethers, BigNumberish, Transaction } from 'ethers'


export interface IBundle {
	txs: Array<string>,
	revertingHashes: Array<string>,
}

export function keccak256(x: string): string {
	return hexFillZero(ethers.keccak256(x))
}

export function parseHexArg(arg: null | BigNumberish): string {
	if (!arg) { // 0, null, undefined, ''
		return '0x'
	}
	if (typeof arg === 'object' && 'toHexString' in (arg as any)) {
		arg = (arg as any).toHexString()
	}
  
	switch (typeof arg) {
		case 'number':
		case 'bigint':
			return intToHex(arg)
		case 'string':
			if (ethers.isHexString(arg)) {
				return arg == '0x00' ? '0x' : arg
			} else {
				throw new Error(`Invalid hex string: ${arg}`)
			}
		default:
			return '0x'
		}
}

export function intToHex(intVal: number | bigint): string {
	let hex = intVal.toString(16)
	hex = hex.split('.')[0]
	if (hex === '0') {
		return '0x'
	}
	if (hex.length % 2) {
		hex = '0' + hex
	}
	return '0x' + hex
}

export function hexFillZero(hex: string): string {
	return '0x' + hex.slice(2).padStart(64, '0')
}

export function removeLeadingZeros(hex: string): string {
	return '0x' + hex.slice(2).replace(/^00+/, '')
}

export function txToBundleBytes(signedTx): string {
	return bundleToBytes(txToBundle(signedTx))
}

export function txToBundle(signedTx): IBundle {
	return {
		txs: [signedTx],
		revertingHashes: [],
	}
}

export function bundleToBytes(bundle: IBundle): string {
	const bundleBytes = Buffer.from(JSON.stringify(bundle), 'utf8')
	const confidentialDataBytes = ethers.AbiCoder.defaultAbiCoder().encode(['bytes'], [bundleBytes])
	return confidentialDataBytes
}

export function createConfidentialComputeRecord(
	tx: Transaction,
	executionNode: string, 
): ConfidentialComputeRecord {
	const nonce = tx.nonce
	const gasPrice = tx.isLondon() ? tx.maxFeePerGas : tx.gasPrice
	if (!gasPrice)
		throw new Error('Invalid gas price')
	const gas = tx.gasLimit
	const to = tx.to || ethers.ZeroAddress
	const value = tx.value
	const data = tx.data
	const chainId = '0x' + tx.chainId.toString(16)
	return {
		executionNode,
		nonce, 
		gasPrice,
		gas,
		to,
		value,
		data,
		chainId,
	}
}