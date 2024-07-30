# ethers-suave

A typescript library, built on top of ethers.js, for interacting with Suave confidential requests.

## Usage

#### Send confidential request with ABI
```typescript
const provider = new SuaveProvider(kettleUrl)
const wallet = new SuaveWallet(pk, provider)

const StoreContract = new SuaveContract(storeContractAdd, storeABI, wallet)
const milkLiters = 2
const milkType = 1 // 'whole'
// Non-confidential methods are called as usual
const milkPrice = await StoreContract.milkSpotPrice(milkType)
const confidentialInputs = createPaymentBundle(milkPrice, milkLiters)
// Response is ConfidentialTransactionResponse 
const res = await StoreContract.buyMilk.sendConfidentialRequest(milkType, milkLiters, { confidentialInputs })
// Receipt is a normal EVM transaction receipt
const receipt = await res.wait()
```

#### Create a confidential request
```typescript
const ccr = await StoreContract.buyMilk.prepareConfidentialRequest(milkType, milkLiters, { confidentialInputs }) 
```

#### Get a confidential request
```typescript
const tx = await provider.getConfidentialTransaction('0xafac2...')
```

#### Send/Populate confidential request without ABI
```typescript
const crecordlike = {
    data: '0x966a0212...',
    to: storeContractAdd
}
const crecord = await wallet.populateCRecord(crecordlike)
const confidentialTxResponse = await wallet.sendCCR(crecordlike, confidentialInputs)
```

## Dev Setup
#### Install dependencies
```bash
yarn install --dev
```

#### Test
```bash
yarn test
```

## Contributions 

Any contributions are welcome! Please submit a PR or an issue.


