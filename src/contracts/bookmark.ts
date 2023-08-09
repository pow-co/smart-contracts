import {
    assert,
    toByteString,
    ByteString,
    method,
    hash256,
    prop,
    SmartContract,
    hash160,
    PubKeyHash,
    Ripemd160,
    PubKey,
    Sig,
} from 'scrypt-ts'

import { decode } from 'bs58'

interface BuildBookmark {
    address: string
    content_location: string
    directory?: string
    tags?: string
}

export class Bookmark extends SmartContract {
    @prop()
    content_location: ByteString

    @prop()
    owner: PubKeyHash

    @prop(true)
    directory: ByteString

    @prop(true)
    tags: ByteString

    constructor(
        content_location: ByteString,
        owner: PubKeyHash,
        directory: ByteString,
        tags: ByteString
    ) {
        super(...arguments)
        this.owner = owner
        this.content_location = content_location
        this.directory = directory
        this.tags = tags
    }

    @method()
    public unlock(signature: Sig, pubkey: PubKey) {
        assert(hash160(pubkey) === this.owner)
        assert(
            this.checkSig(signature, pubkey),
            `checkSig failed, owner: ${this.owner}`
        )
    }

    @method()
    public setTags(tags: ByteString, signature: Sig, pubkey: PubKey) {
        this.tags = tags
        const output: ByteString = this.buildStateOutput(this.ctx.utxo.value)
        assert(this.ctx.hashOutputs === hash256(output), 'hashOutputs mismatch')
    }

    @method()
    public setDirectory(directory: ByteString, signature: Sig, pubkey: PubKey) {
        this.directory = directory
        const output: ByteString = this.buildStateOutput(this.ctx.utxo.value)
        assert(this.ctx.hashOutputs === hash256(output), 'hashOutputs mismatch')
    }

    static buildBookmark(args: BuildBookmark): Bookmark {
        console.log('args', args)

        console.log('address', args.address)
        const decoded = Buffer.from(decode(args.address).toString()).toString(
            'hex'
        )
        console.log('decoded', decoded)

        return new Bookmark(
            toByteString(args.content_location, true),
            PubKeyHash(Ripemd160(decoded)),
            toByteString(args.directory || '/', true),
            toByteString(args.tags || '', true)
        )
    }
}
