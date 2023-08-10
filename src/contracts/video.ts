import {
    assert,
    ByteString,
    method,
    prop,
    SmartContract,
    Sig,
    PubKey,
    hash256,
    bsv,
    HashedMap
} from 'scrypt-ts'

interface Segment {
  _bytes: ByteString;
  duration: ByteString;
}

type Segments = HashedMap<bigint, ByteString>;

export default class Video extends SmartContract {

    @prop(true)
    segments: Segments;

    @prop(true)
    closed: boolean;

    @prop(true)
    owner: PubKey;

    constructor(segments: Segments, owner: PubKey) {
        super(...arguments)
        this.segments = segments
        this.owner = owner
        this.closed = false
    }

    static createVideo({ owner }: { owner: bsv.PublicKey }): Video {

      const segments = new HashedMap<bigint, ByteString>()

      const pubKey = PubKey(owner.toString())

      return new Video(segments, pubKey)

    } 

    @method()
    public addSegment(segment: Segment, signature: Sig) {
      assert(!this.closed, 'This video stream is closed')

      this.segments.set(BigInt(this.segments.size), segment._bytes)

      const amount: bigint = this.ctx.utxo.value
      let outputs: ByteString = this.buildStateOutput(amount)
      if (this.changeAmount > 0n) {
        outputs += this.buildChangeOutput()
      }
      assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')

      assert(this.checkSig(signature, this.owner), `checkSig failed, pubkey: ${this.owner}`)
    }

    @method()
    public close(signature: Sig) {

      this.closed = true
      const amount: bigint = this.ctx.utxo.value
      let outputs: ByteString = this.buildStateOutput(amount)
      if (this.changeAmount > 0n) {
        outputs += this.buildChangeOutput()
      }
      assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')

      assert(this.checkSig(signature, this.owner), `checkSig failed, pubkey: ${this.owner}`)
    }

    @method()
    public transfer(newOwner: PubKey, signature: Sig) {
      assert(this.checkSig(signature, this.owner), `checkSig failed, pubkey: ${this.owner}`)

      this.owner = newOwner;
      const amount: bigint = this.ctx.utxo.value
      let outputs: ByteString = this.buildStateOutput(amount)
      if (this.changeAmount > 0n) {
        outputs += this.buildChangeOutput()
      }
      assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')

    }

}
