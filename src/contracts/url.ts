import {
    Sig,
    method,
    prop,
    SmartContract,
    hash160,
    assert,
    ByteString,
    PubKey,
    PubKeyHash,
} from 'scrypt-ts'

export class Buyable extends SmartContract {

    @prop()
    url: ByteString

    @prop(true)
    owner: PubKeyHash

    constructor(url: ByteString, owner: PubKeyHash) {
        super(...arguments)
        this.url = url
        this.owner = owner
    }

    @method()
    public unlock(signature: Sig, pubkey: PubKey) {
        assert(hash160(pubkey) === this.owner)
        assert(
            this.checkSig(signature, pubkey),
            `checkSig failed, pubKeyHash: ${this.owner}`
        )
    }
}

