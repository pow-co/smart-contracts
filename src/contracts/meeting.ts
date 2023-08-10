import {
    assert,
    ByteString,
    method,
    toByteString,
    prop,
    sha256,
    hash256,
    Sha256,
    SmartContract,
    ScriptContext,
    HashedSet,
    PubKey,
    Sig
} from 'scrypt-ts'

export class Meeting extends SmartContract {
    @prop(true)
    title: ByteString;

    @prop(true)
    admins: HashedSet<PubKey>

    @prop(true)
    attendees: HashedSet<PubKey>

    @prop(true)
    invitees: HashedSet<PubKey>

    @prop(true)
    cancelled: boolean

    @prop(true)
    inviteRequired: boolean

    constructor(
      title: ByteString,
      admins: HashedSet<PubKey>,
      invitees: HashedSet<PubKey>,
      attendees: HashedSet<PubKey>,
      inviteRequired: boolean
    ) {
        super(...arguments)
        this.title = title
        this.admins = admins
        this.invitees = invitees
        this.inviteRequired = inviteRequired
        this.attendees = attendees
        this.cancelled = false
    }

    @method()
    public uncancel(pubkey: PubKey, sig: Sig) {

        assert(this.checkSig(sig, pubkey),`checkSig failed, pubkey: ${pubkey}`)

        assert(this.admins.has(pubkey))

        this.cancelled = false

        let outputs: ByteString = this.buildStateOutput(this.ctx.utxo.value)
        if (this.changeAmount > 0n) { outputs += this.buildChangeOutput() }
        assert(this.ctx.hashOutputs == hash256(outputs), 'state not preserved')

    }

    @method()
    public invite(invitee: PubKey, pubkey: PubKey, sig: Sig) {

        assert(this.checkSig(sig, pubkey),`checkSig failed, pubkey: ${pubkey}`)

        assert(this.admins.has(pubkey))

        if (!this.invitees.has(invitee) && !this.attendees.has(invitee)) {
          this.invitees.add(invitee)
        }

        let outputs: ByteString = this.buildStateOutput(this.ctx.utxo.value)
        if (this.changeAmount > 0n) { outputs += this.buildChangeOutput() }
        assert(this.ctx.hashOutputs == hash256(outputs), 'state not preserved')

    }

    @method()
    public decline(pubkey: PubKey, sig: Sig) {

      assert(this.checkSig(sig, pubkey),`checkSig failed, pubkey: ${pubkey}`)

      if (this.invitees.has(pubkey)) {

        this.invitees.delete(pubkey)

      }

      if (this.attendees.has(pubkey)) {

        this.attendees.delete(pubkey)

      }

      let outputs: ByteString = this.buildStateOutput(this.ctx.utxo.value)
      if (this.changeAmount > 0n) { outputs += this.buildChangeOutput() }
      assert(this.ctx.hashOutputs == hash256(outputs), 'state not preserved')

    }

    @method()
    public attend(pubkey: PubKey, sig: Sig) {

      assert(this.checkSig(sig, pubkey),`checkSig failed, pubkey: ${pubkey}`)

      if (this.inviteRequired) {
        assert(this.invitees.has(pubkey) || this.admins.has(pubkey))
      }

      this.attendees.add(pubkey)

      let outputs: ByteString = this.buildStateOutput(this.ctx.utxo.value)
      if (this.changeAmount > 0n) { outputs += this.buildChangeOutput() }
      assert(this.ctx.hashOutputs == hash256(outputs), 'state not preserved')

    }

    isAttending(pubkey: PubKey): boolean {
      return this.attendees.has(pubkey)
    }

    isInvited(pubkey: PubKey): boolean {
      return this.invitees.has(pubkey)
    }

    isAdmin(pubkey: PubKey): boolean {
      return this.admins.has(pubkey)
    }

    @method()
    public cancel(pubkey: PubKey, sig: Sig) {

        assert(this.checkSig(sig, pubkey),`checkSig failed, pubkey: ${pubkey}`)

        assert(this.admins.has(pubkey))

        this.cancelled = true

        let outputs: ByteString = this.buildStateOutput(this.ctx.utxo.value)
        if (this.changeAmount > 0n) { outputs += this.buildChangeOutput() }
        assert(this.ctx.hashOutputs == hash256(outputs), 'state not preserved')

    }

}
