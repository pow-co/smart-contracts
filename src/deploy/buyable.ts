import { Buyable } from '../contracts/buyable'
import {
    bsv,
    TestWallet,
    DefaultProvider,
    sha256,
    toByteString,
    PubKeyHash,
    Ripemd160,
    findSig,
    PubKey
} from 'scrypt-ts'

import { decode } from 'bs58'

import * as dotenv from 'dotenv'

// Load the .env file
dotenv.config()

// Read the private key from the .env file.
// The default private key inside the .env file is meant to be used for the Bitcoin testnet.
// See https://scrypt.io/docs/bitcoin-basics/bsv/#private-keys
const privateKey = bsv.PrivateKey.fromWIF(process.env.PRIVATE_KEY || '')

class Wallet extends TestWallet {
  get network() { return bsv.Networks.livenet }
}

const provider = new DefaultProvider()

// Prepare signer.
// See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
const signer = new Wallet(
    privateKey,
    provider
)

async function main() {

    await Buyable.compile()

    // TODO: Adjust the amount of satoshis locked in the smart contract:
    const amount = 1

    const price = 5000n

    const publicKey = privateKey.publicKey

    const owner = PubKeyHash(Ripemd160(Buffer.from(decode(privateKey.toAddress().toString())).toString('hex')))

    const instance = new Buyable(
        toByteString('my great offer', true),
        price,
        owner
    )

    const network = await provider.getNetwork()

    console.log({ network })

    // Connect to a signer.
    await instance.connect(signer)

    // Contract deployment.
    const deployTx = await instance.deploy(amount)
    console.log(`Buyable contract deployed: ${deployTx.id}`)

    const unlockTx = await instance.methods.unlock(PubKey(publicKey.toString()), (sigResponses: any) => {
      return findSig(sigResponses, publicKey)
    })

    console.log({ unlockTx })

    const setPriceTx = await instance.methods.setPrice(500n, PubKey(publicKey.toString()), (sigResponses: any) => {
      return findSig(sigResponses, publicKey)
    })

    console.log({ setPriceTx })

    const setPriceTx2 = await instance.methods.setPrice(0n, PubKey(publicKey.toString()), (sigResponses: any) => {
      return findSig(sigResponses, publicKey)
    })

    console.log({ setPriceTx2 })

}

main()
