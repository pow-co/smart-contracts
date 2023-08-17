import {
    assert,
    ByteString,
    hash256,
    method,
    prop,
    PubKey,
    Sig,
    SmartContract,
} from 'scrypt-ts'

/* The Logger contract allows for applications to emit a stream of log
   messages to the blockchain. Logger may be used in conjunction with other
   logging systems

*/

export class Logger extends SmartContract {

    @prop(true)
    namespace:  ByteString;

    @prop(true)
    operator: PubKey;

    @prop(true)
    owner: PubKey;

    constructor(namespace: ByteString, operator: PubKey, owner: PubKey) {
        super(...arguments)

        this.namespace = namespace
        this.operator = operator
        this.owner = owner        
    }

    @method()
    public log(level: ByteString, kind: ByteString, message: ByteString, signature: Sig) {

        console.log(`log: ${level} ${kind} ${message} ${signature}`)

        assert(
            this.checkSig(signature, this.operator),
            `checkSig failed, pubkey: ${this.operator}`
        )

        const amount: bigint = this.ctx.utxo.value
        let outputs: ByteString = this.buildStateOutput(amount)
        if (this.changeAmount > 0n) {
            outputs += this.buildChangeOutput()
        }
        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    @method()
    public destroy(signature: Sig) {
        assert(
            this.checkSig(signature, this.owner),
            `checkSig failed, pubkey: ${this.owner}`
        )
    } 

}
