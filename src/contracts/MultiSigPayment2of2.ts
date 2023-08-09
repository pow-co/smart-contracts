import {
    assert,
    Sig,
    PubKey,
    hash160,
    ByteString,
    FixedArray,
    PubKeyHash,
    method,
    prop,
    sha256,
    Sha256,
    SmartContract,
} from 'scrypt-ts'

class MultiSigPayment2of2 extends SmartContract {
    // Public key hashes of the 2 recipients
    @prop()
    readonly pubKeyHashes: FixedArray<PubKeyHash, 2>

    constructor(pubKeyHashes: FixedArray<PubKeyHash, 2>) {
        super(...arguments)
        this.pubKeyHashes = pubKeyHashes
    }

    @method()
    public unlock(
        signatures: FixedArray<Sig, 2>,
        publicKeys: FixedArray<PubKey, 2>
    ) {
        // Check if the passed public keys belong to the specified public key hashes.
        for (let i = 0; i < 2; i++) {
            assert(
                hash160(publicKeys[i]) == this.pubKeyHashes[i],
                'public key hash mismatch'
            )
        }

        // Validate signatures.
        assert(
            this.checkMultiSig(signatures, publicKeys),
            'checkMultiSig failed'
        )
    }
}
