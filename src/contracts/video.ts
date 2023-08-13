import {
    assert,
    ByteString,
    method,
    prop,
    SmartContract,
    Sig,
    PubKey,
    hash256,
    Sha256,
    bsv,
    HashedMap,
    toByteString
} from 'scrypt-ts'

interface Segment {
  _bytes: ByteString;
  duration: ByteString;
}

export default class Video extends SmartContract {

    @prop(false)
    sha256Hash: Sha256;

    @prop(false)
    contentLength: bigint;

    @prop(true)
    segments: HashedMap<bigint, ByteString>;

    @prop(true)
    closed: boolean;

    @prop(true)
    owner: PubKey;

    @prop(true)
    operator: PubKey;

    @prop(true)
    og_title: ByteString;

    @prop(true)
    og_description: ByteString;

    @prop(true)
    og_image: ByteString;

    @prop(true)
    og_url: ByteString;

    @prop(true)
    og_type: ByteString;

    @prop(true)
    og_site_name: ByteString;

    @prop(true)
    og_locale: ByteString;

    @prop(true)
    og_audio: ByteString;

    @prop(true)
    og_video: ByteString;

    @prop(true)
    og_article_author: ByteString;

    @prop(true)
    og_article_published_time: ByteString;

    @prop(true)
    og_article_modified_time: ByteString;

    constructor(
      sha256Hash: Sha256,
      contentLength: bigint,
      segments: HashedMap<bigint, ByteString>,
      owner: PubKey,
      operator: PubKey,
      og_title: ByteString,
      og_description: ByteString,
      og_image: ByteString,
      og_url: ByteString,
      og_type: ByteString,
      og_site_name: ByteString,
      og_locale: ByteString,
      og_audio: ByteString,
      og_video: ByteString,
      og_article_author: ByteString,
      og_article_published_time: ByteString,
      og_article_modified_time: ByteString
    ) {
        super(...arguments)
        this.sha256Hash = sha256Hash
        this.contentLength = contentLength
        this.segments = segments
        this.owner = owner
        this.operator = operator
        this.og_title = og_title
        this.og_description = og_description
        this.og_image = og_image
        this.og_url = og_url
        this.og_type = og_type
        this.og_site_name = og_site_name
        this.og_locale = og_locale
        this.og_audio = og_audio
        this.og_video = og_video
        this.og_article_author = og_article_author
        this.og_article_published_time = og_article_published_time
        this.og_article_modified_time = og_article_modified_time

        this.closed = false
        
    }

    static buildVideo(params: {
      operator: bsv.PublicKey,
      owner: bsv.PublicKey,
      contentLength: bigint,
      sha256Hash: ByteString,
      og_title?: ByteString,
      og_description?: ByteString,
      og_image?: ByteString,
      og_url?: ByteString,
      og_type?: ByteString,
      og_site_name?: ByteString,
      og_locale?: ByteString,
      og_audio?: ByteString,
      og_video?: ByteString,
      og_article_author?: ByteString,
      og_article_published_time?: ByteString,
      og_article_modified_time?: ByteString
    }): Video {

      const segments = new HashedMap<bigint, ByteString>()

      const ownerPubkey = PubKey(params.owner.toString())

      const operatorPubkey = PubKey(params.operator.toString())

      const og_title = toByteString(params.og_title || ' ', true)
      const og_description = toByteString(params.og_description || ' ', true)
      const og_image = toByteString(params.og_image || ' ', true)
      const og_url = toByteString(params.og_url || ' ', true)
      const og_type = toByteString(params.og_type || ' ', true)
      const og_site_name = toByteString(params.og_site_name || ' ', true)
      const og_locale = toByteString(params.og_locale || ' ', true)
      const og_audio = toByteString(params.og_audio || ' ', true)
      const og_video = toByteString(params.og_video || ' ', true)
      const og_article_author = toByteString(params.og_article_author || ' ', true)
      const og_article_published_time = toByteString(params.og_article_published_time || ' ', true)
      const og_article_modified_time = toByteString(params.og_article_modified_time || ' ', true)
      
      return new Video(
        hash256(toByteString(params.sha256Hash, false)),
        params.contentLength,
        segments,
        ownerPubkey,
        operatorPubkey,
        og_title,
        og_description,
        og_image,
        og_url,
        og_type,
        og_site_name,
        og_locale,
        og_audio,
        og_video,
        og_article_author,
        og_article_published_time,
        og_article_modified_time      
      )

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
