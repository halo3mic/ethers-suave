import { JsonRpcProvider, Interface , InterfaceAbi, Wallet, Contract, ContractTransactionResponse, BaseContractMethod } from 'ethers'
import { SUAVE_CHAIN_ID } from './const'
import { ConfidentialComputeRecord, ConfidentialComputeRequest } from './confidential-types'
import * as utils from '../src/utils'

type HexString = `0x${string}`


export class SuaveProvider extends JsonRpcProvider {
    executionNode: HexString

    constructor(url: string, executionNode: HexString) {
        super(url)
        this.executionNode = executionNode
    }

}
export class SuaveWallet extends Wallet {
    sprovider: SuaveProvider

    constructor(privateKey: string, provider?: SuaveProvider) {
        super(privateKey, provider)
        this.sprovider = provider
    }

}

interface ExtendedContractMethod extends BaseContractMethod<any[], any, any> {
    prepareConfidentialRequest?: (args: any) => Promise<ConfidentialComputeRequest>;
    sendConfidentialRequest?: (args: any) => Promise<ContractTransactionResponse>;
}


interface IDynamic {
    [key: string]: any;
}

export class SuaveContract implements IDynamic {
    [k: string]: any;
    wallet: SuaveWallet
    inner: Contract
    
    constructor(address: HexString, abi: Interface | InterfaceAbi, wallet: SuaveWallet) {
        this.inner = new Contract(address, abi, wallet)
        this.wallet = wallet

        return new Proxy(this, {
            get: (target, prop, receiver): ExtendedContractMethod | any => {
                const item = Reflect.get(target.inner, prop, receiver);
                if (typeof item === 'function' && target.inner.interface.hasFunction(prop as string)) {
                    const extendedMethod: ExtendedContractMethod = item

                    const fnn = async (...args: any[]): Promise<ConfidentialComputeRequest> => {
                        const overrides = args[args.length - 1]
                        const contractTx = await extendedMethod.populateTransaction(...args)
                        contractTx.type = 0
                        contractTx.gasLimit = BigInt(overrides.gasLimit || 1e7)
                        const filledTx = await target.wallet.populateTransaction(contractTx)
                        const crc = utils.createConfidentialComputeRecord(filledTx, wallet.sprovider.executionNode)
                        const crq = new ConfidentialComputeRequest(crc, overrides.confidentialInputs)
                        return crq
                    }

                    extendedMethod.prepareConfidentialRequest = fnn

                    extendedMethod.sendConfidentialRequest = async (...args: any[]) => {
                        const crq = (await fnn(...args))
                            .signWithWallet(target.wallet)
                            .rlpEncode()
                        const sprovider = target.wallet.sprovider
                        const txhash = await sprovider.send('eth_sendRawTransaction', [crq])
                        const txRes = await sprovider.getTransaction(txhash)
                        return new ContractTransactionResponse(target.inner.interface, sprovider, txRes)
                    }

                    return extendedMethod as ExtendedContractMethod;
                }
                return item as ExtendedContractMethod;
            },
            has: (target, prop) => {
                return Reflect.has(target.inner, prop);
            }
        });

    }

}

