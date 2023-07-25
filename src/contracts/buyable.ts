import {
    Utils,
    Sig,
    method,
    prop,
    SmartContract,
    hash256,
    hash160,
    assert,
    ByteString,
    SigHash,
    PubKey,
    PubKeyHash,
    ContractTransaction,
    MethodCallOptions,
    bsv
} from 'scrypt-ts'

const { Script, Transaction } = bsv

export class Buyable extends SmartContract {

    @prop()
    offer: ByteString

    @prop(true)
    price: bigint

    @prop(true)
    pubKeyHash: PubKeyHash

    constructor(offer: ByteString, price: bigint, pubKeyHash: PubKeyHash) {
        super(...arguments)
        this.offer = offer
        this.price = price
        this.pubKeyHash = pubKeyHash
    }

    @method()
    public buy(pubKeyHash: PubKeyHash) {
        assert(this.price > 0, "Price of 0 means not actively for sale")

        const seller = this.pubKeyHash

        // assign ownership to buyer
        this.pubKeyHash = pubKeyHash

        // ensure seller receives the asking price
        const output: ByteString = Utils.buildPublicKeyHashOutput(seller, this.price)
        assert(this.ctx.hashOutputs === hash256(output), 'hashOutputs mismatch')

    }

    public setPrice(price: bigint, pubKey: PubKey, sig: Sig) {
        this.price = price;

        // make sure balance in the contract does not change
        const amount: bigint = this.ctx.utxo.value
        // output containing the latest state
        const output: ByteString = this.buildStateOutput(amount)
        // verify current tx has this single output
        assert(this.ctx.hashOutputs === hash256(output), 'hashOutputs mismatch')

        assert(hash160(pubKey) === this.pubKeyHash)
        assert(
            this.checkSig(sig, pubKey),
            `checkSig failed, pubKeyHash: ${this.pubKeyHash}`
        )
    }

    @method()
    public unlock(signature: Sig, pubkey: PubKey) {
        assert(hash160(pubkey) === this.pubKeyHash)
        assert(
            this.checkSig(signature, pubkey),
            `checkSig failed, pubKeyHash: ${this.pubKeyHash}`
        )
    }

    static buyTxBuilder(
        current: Buyable,
        options: MethodCallOptions<Buyable>,
        pubKeyHash: PubKeyHash
    ): Promise<ContractTransaction> {

        console.log(current, 'current')

        const nextInstance = current.next()
        nextInstance.pubKeyHash = pubKeyHash

        console.log(options, 'options')

        console.log('CURRENT BALANCE', current.balance)
        console.log('FROM', current.from)

        console.log(Object.keys(current))

        console.log('CURRENT PUBKEY HASH', current.pubKeyHash)

        const unsignedTx = new Transaction()
            // add contract input
            .addInput(current.buildContractInput(options.fromUTXO))
            // build next instance output
            .addOutput(
                new Transaction.Output({
                    script: nextInstance.lockingScript,
                    satoshis: Number(1),
                })
            )
            .addOutput(
              new Transaction.Output({
                  script: Script.fromHex(Utils.buildPublicKeyHashScript(current.pubKeyHash)),
                  satoshis: Number(current.price)
              })
            )

        if (options.changeAddress) {

          unsignedTx.change(options.changeAddress)

        }

        console.log(unsignedTx)

        return Promise.resolve({
            tx: unsignedTx,
            atInputIndex: 0,
            nexts: [
                {
                    instance: nextInstance,
                    atOutputIndex: 0,
                    balance: current.balance
                },
            ],
        })
    }

}
