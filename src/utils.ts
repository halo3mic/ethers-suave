import { ConfidentialComputeRecord } from './confidential-types'
import { ethers, BigNumberish, Wallet } from 'ethers'


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
  
	if (typeof arg === 'object' && 'toHexString' in arg) {
		const x = (arg as any).toHexString()
		return x == '0x00' ? '0x' : x
	}
  
	switch (typeof arg) {
	case 'number':
	case 'bigint':
		return intToHex(arg)
	case 'string':
		if (ethers.isHexString(arg)) {
			return arg
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
	if (hex.length % 2 != 0) {
		hex = '0x0' + hex.slice(2)
	}
	return hex
}

export function removeLeadingZeros(hex: string): string {
	return '0x' + hex.slice(2).replace(/^00+/, '')
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

export async function createConfidentialComputeRecord(
	suaveSigner: Wallet, 
	calldata: string, 
	executionNodeAddr: string, 
	recipient: string,
	options: any = {} // todo: restrict
): Promise<ConfidentialComputeRecord> {
	const suaveNonce = await suaveSigner.getNonce()
	const chainId = await suaveSigner.provider?.getNetwork().then(x => x.chainId) // todo: rm 
	return {
		chainId,
		nonce: suaveNonce,
		to: recipient,
		value: ethers.parseEther('0'),
		gas: ethers.toBigInt(2000000),
		gasPrice: ethers.parseUnits('20', 'gwei'),
		data: calldata, 
		executionNode: executionNodeAddr,
		...options
	}
}