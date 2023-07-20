import { MessageHash256 } from '../../src/contracts/messageHash256'
import { getDefaultSigner, inputSatoshis } from '../utils/txHelper'
import { toByteString, sha256 } from 'scrypt-ts'

const message = 'hello world, sCrypt!'

async function main() {
    await MessageHash256.compile()
    const instance = new MessageHash256(sha256(toByteString(message, true)))

    // connect to a signer
    await instance.connect(getDefaultSigner())

    // contract deployment
    const deployTx = await instance.deploy(inputSatoshis)
    console.log('MessageHash256 contract deployed: ', deployTx.id)

    // contract call
    const { tx: callTx } = await instance.methods.unlock(
        toByteString(message, true)
    )
    console.log('MessageHash256 contract `unlock` called: ', callTx.id)
}

describe('Test SmartContract `MessageHash256` on testnet', () => {
    it('should succeed', async () => {
        await main()
    })
})
