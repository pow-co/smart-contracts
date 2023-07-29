import axios from 'axios'
import { Sellable } from '../contracts/sellable'
import {
    buildPublicKeyHashScript,
    Ripemd160,
    hash160,
    findSig,
    MethodCallOptions,
    bsv,
    TestWallet,
    DefaultProvider,
    sha256,
    toByteString,
    PubKey,
    ContractTransaction,
} from 'scrypt-ts'

import { decode } from 'bs58'

import * as dotenv from 'dotenv'

// Load the .env file
dotenv.config()

// Read the private key from the .env file.
// The default private key inside the .env file is meant to be used for the Bitcoin testnet.
// See https://scrypt.io/docs/bitcoin-basics/bsv/#private-keys
const privateKey = bsv.PrivateKey.fromWIF(process.env.PRIVATE_KEY || '')

// Prepare signer.
// See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
const signer = new TestWallet(
    privateKey,
    new DefaultProvider({ network: bsv.Networks.mainnet })
)

async function main() {
    await Sellable.compile()

    const amount = parseInt(process.argv[4] || '100')

    const ownerAddress = process.argv[2] || privateKey.toPublicKey().toHex()

    console.log(privateKey.publicKey.toString())
    console.log(privateKey.publicKey.toAddress().toString(), '--address--')

    //process.exit(0)

    const owner = PubKey(ownerAddress)

    const instance = new Sellable(
        toByteString(process.argv[3] || 'music.house.soul', true),
        owner,
        BigInt(amount)
    )

    // Connect to a signer.
    await instance.connect(signer)

    // Contract deployment.
    const deployTx = await instance.deploy(amount)

    console.log('Sellable contract deployed: ', deployTx.id)

    const nextInstance = instance.next()

    const nextPrice  = 200n

    nextInstance.price = nextPrice

    const { tx: callTx } = await instance.methods.setPrice(
        nextPrice,
        (sigResps) => {
            return findSig(sigResps, privateKey.publicKey)
        },
        {
            pubKeyOrAddrToSign: privateKey.publicKey.toAddress(),
            next: {
                instance: nextInstance,
                //@ts-ignore
                balance: instance.balance,
            },
        } as MethodCallOptions<Sellable>
    )

    console.log(`Sellable setPrice(${nextPrice}) called tx: `, callTx.id)

    nextInstance.bindTxBuilder(
        'buy',
        (
            current: Sellable,
            options: MethodCallOptions<Sellable>,
            ...args: any
        ): Promise<ContractTransaction> => {
            // create the next instance from the current
            const nextInstance = current.next()
            // apply updates on the next instance locally
            nextInstance.owner = PubKey(privateKey.publicKey.toString())

            const tx = new bsv.Transaction()
            tx.addInput(current.buildContractInput(options.fromUTXO))
                .addOutput(
                    new bsv.Transaction.Output({
                        script: nextInstance.lockingScript,
                        satoshis: current.balance,
                    })
                )
                .addOutput(
                    new bsv.Transaction.Output({
                        script: buildPublicKeyHashScript(
                            hash160(current.owner)
                        ),
                        satoshis: Number(current.price),
                    })
                )

            tx.change(privateKey.publicKey.toAddress())

            return Promise.resolve({
                tx: tx,
                atInputIndex: 0,
                nexts: [
                    {
                        instance: nextInstance,
                        balance: current.balance,
                        atOutputIndex: 0,
                    },
                ],
            })
        }
    )

    const { tx: buyTx } = await nextInstance.methods.buy(
        PubKey(privateKey.publicKey.toString())
    )

    console.log({ buyTx: buyTx.id })

    const thirdInstance = Sellable.fromTx(buyTx, 0)

    await thirdInstance.connect(signer)

    const { tx: removeTx } = await thirdInstance.methods.remove((sigResps) => {
        return findSig(sigResps, privateKey.publicKey)
    })

    console.log({ removeTx: removeTx.id })
}

main()
