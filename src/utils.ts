import { ethers, BigNumberish } from 'ethers'


export interface IBundle {
	txs: Array<string>,
	revertingHashes: Array<string>,
}

export function keccak256(x: string): string {
	return hexFill32(ethers.keccak256(x))
}

export function parseHexArg(arg: null | BigNumberish): string {
	if (!arg) {
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
			return arg == '0x00' ? '0x' : hexFillEven(arg)
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

export function hexFill32(hex: string): string {
	return '0x' + hex.slice(2).padStart(64, '0')
}

export function hexFillEven(hex: string): string {
	return hex.length % 2 ? '0x0' + hex.slice(2) : hex
}

export function removeLeadingZeros(hex: string): string {
	return '0x' + hex.slice(2).replace(/^00+/, '')
}

export function txToBundleBytes(signedTx: string): string {
	return bundleToBytes(txToBundle(signedTx))
}

export function txToBundle(signedTx: string): IBundle {
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

export const DEFAULT_GAS_LIMIT = 1e7