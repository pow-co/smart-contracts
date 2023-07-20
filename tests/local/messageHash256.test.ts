import { expect, use } from 'chai'
import { MethodCallOptions, sha256, toByteString } from 'scrypt-ts'
import { MessageHash256 } from '../../src/contracts/messageHash256'
import { getDummySigner, getDummyUTXO } from '../utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)

describe('Test SmartContract `MessageHash256`', () => {
    let instance: MessageHash256

    before(async () => {
        await MessageHash256.compile()
        instance = new MessageHash256(sha256(toByteString('hello world', true)))
        await instance.connect(getDummySigner())
    })

    it('should pass the public method unit test successfully.', async () => {
        const { tx: callTx, atInputIndex } = await instance.methods.unlock(
            toByteString('hello world', true),
            {
                fromUTXO: getDummyUTXO(),
            } as MethodCallOptions<MessageHash256>
        )

        const result = callTx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
    })

    it('should throw with wrong message.', async () => {
        return expect(
            instance.methods.unlock(toByteString('wrong message', true), {
                fromUTXO: getDummyUTXO(),
            } as MethodCallOptions<MessageHash256>)
        ).to.be.rejectedWith(/Hash does not match/)
    })
})
