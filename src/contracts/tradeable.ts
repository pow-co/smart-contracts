import {
    assert,
    ByteString,
    method,
    prop,
    SmartContract,
    Sig,
    PubKey,
    hash256,
    hash160,
    Utils,
} from 'scrypt-ts'

export class Tradeable extends SmartContract {
    @prop()
    owner: PubKey

    @prop()
    topic: ByteString

    @prop(true)
    ask: bigint

    constructor(topic: ByteString, owner: PubKey, ask: bigint) {
        super(...arguments)
        this.topic = topic
        this.owner = owner
        this.ask = ask
    }

    @method()
    public setask(ask: bigint, signature: Sig) {
        assert(
            this.checkSig(signature, this.owner),
            `checkSig failed, pubkey: ${this.owner}`
        )

        this.ask = ask

        // Ensure Contract State Remains Locked With Exact Satoshis Value
        const amount: bigint = this.ctx.utxo.value
        let outputs: ByteString = this.buildStateOutput(amount)
        if (this.changeAmount > 0n) {
            outputs += this.buildChangeOutput()
        }
        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    @method()
    public remove(signature: Sig) {
        // No assertion that the state out remains the same. By calling remove() you essentially
        // destroy the smart contract and may reclaim all the satoshis

        assert(
            this.checkSig(signature, this.owner),
            `checkSig failed, pubkey: ${this.owner}`
        )
    }

    @method()
    public bid(bid: bigint, bidder: PubKey) {

        if (bid > this.ask && this.ask > 0) {

          // affect the sale at the asking price
          // final satoshi balance

          const newBalance = this.ctx.utxo.value - this.bid

          if (this.bid === 0) {

          }

        } else {

          const newBalance = this.ctx.utxo.value - this.bid + bid

          assert(bid > this.bid, "Bid invalid: lower than current bid")

          // TODO: assert that satoshi amount increases by the difference of the bids

          const currentBid = this.bid

          const currentBidder = this.bidder

          const seller = this.owner

          this.bid = bid

          this.bidder = bidder

          // ensure seller receives the asking ask
          const purchase: ByteString = Utils.buildPublicKeyHashOutput(
              hash160(seller),
              this.ask
          )

          // assign ownership to buyer
          this.owner = pubKey

          // once purchased make the object not sellable
          this.ask = 0n

          const stateOutput: ByteString = this.buildStateOutput(newBalance)
          // verify current tx has this single output

          let outputs = stateOutput + purchase

          if (this.changeAmount > 0n) {
              outputs += this.buildChangeOutput()
          }

          assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')

        }
    }

    @method()
    public buy(pubKey: PubKey) {

        assert(this.ask > 0, 'ask of 0 means not actively for sale')

        const seller = this.owner

        // ensure seller receives the asking ask
        const purchase: ByteString = Utils.buildPublicKeyHashOutput(
            hash160(seller),
            this.ask
        )

        // assign ownership to buyer
        this.owner = pubKey

        // once purchased make the object not sellable
        this.ask = 0n

        const stateOutput: ByteString = this.buildStateOutput(
            this.ctx.utxo.value
        )
        // verify current tx has this single output

        let outputs = stateOutput + purchase

        if (this.changeAmount > 0n) {
            outputs += this.buildChangeOutput()
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }
}
