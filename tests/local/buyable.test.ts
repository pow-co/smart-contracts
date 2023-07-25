import { expect, use } from 'chai'

import { Signer, findSig, MethodCallOptions, sha256, toByteString, PubKeyHash, Ripemd160 } from 'scrypt-ts'
import { Buyable } from '../../src/contracts/buyable'

import { getDummySigner, getDummyUTXO } from '../utils/txHelper'

import chaiAsPromised from 'chai-as-promised'

import { decode } from 'bs58'

use(chaiAsPromised)

describe('Test SmartContract `Buyable`', () => {

    let instance: Buyable

    let signer: Signer;

    before(async () => {

        await Buyable.compile()

        signer = getDummySigner()

        const price = BigInt(5000)

        const offer = toByteString('The Holder Of This Token Gets Five Widgets Right On Time', true)

        let defaultAddress = (await signer.getDefaultAddress()).toString()

        const address = PubKeyHash(Ripemd160(Buffer.from(decode(defaultAddress)).toString('hex')))

        instance = new Buyable(offer, price, address)

        await instance.connect(signer)

        const deployTx = await instance.deploy(1)

        console.log('contract deployed: ', deployTx.id);
    })

    it.skip('#setPrice should allow only the current owner to set the price', async  () => {

    })

    it.skip('#unlock should destroy the state and recover the funds by the owner', async () => {

    })

    it('#buy should transfer the satoshis to the seller and the token to the buyer', async () => {

        let signer = getDummySigner()

        let defaultAddress = (await signer.getDefaultAddress()).toString()
      
        let pubKeyHash = PubKeyHash(Ripemd160(Buffer.from(decode(defaultAddress)).toString('hex')))

        instance.bindTxBuilder('buy', Buyable.buyTxBuilder)

        console.log(instance.balance, 'balance')

        let { tx: callTx, atInputIndex } = await instance.methods.buy(
          pubKeyHash,
          {
              fromUTXO: getDummyUTXO(Number(instance.price)),
          } as MethodCallOptions<Buyable>
        )

        const result = callTx.verifyScript(atInputIndex)

        expect(result.success, result.error).to.eq(false)

    })

})
