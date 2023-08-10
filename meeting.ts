import {
    assert,
    ByteString,
    method,
    prop,
    SmartContract,
    Sig,
    PubKey,
    hash256,
    HashedSet
} from 'scrypt-ts'

export class Meeting extends SmartContract {

  constructor() {
    super(...arguments)
  }

    /*

    @prop(true)
    admins: HashedSet<PubKey>

    @prop(true)
    attendees: HashedSet<PubKey>

    @prop(true)
    invitees: HashedSet<PubKey>

    @prop(true)
    title: ByteString

    @prop(true)
    description: ByteString

    @prop(true)
    meetingDate: bigint

    @prop(true)
    proposedDate: bigint

    @prop(true)
    cancelled: boolean

    @prop(true)
    inviteRequired: boolean

    constructor(
      title: ByteString,
      description: ByteString,
      meetingDate: bigint,
      admins: HashedSet<PubKey>,
      attendees: HashedSet<PubKey>,
      invitees: HashedSet<PubKey>,
      inviteRequired: boolean
    ) {
        super(...arguments)
        this.title = title
        this.description = description
        this.meetingDate = bigint
        this.admins = new HashedSet<PubKey>
        this.attendees = new HashedSet<PubKey>
        this.invitees = new HashedSet<PubKey>
        this.inviteRequired = inviteRequired

        this.cancelled = false
    }


    @method
    public invite(invitee: PubKey, admin: PubKey, sig: Sig) {

    }

    @method
    public addAdmin(invitee: PubKey, admin: PubKey, sig: Sig) {

    }

    @method
    public attend() {

    }

    @method
    public decline(pubkey: PubKey, sig: Sig) {
      
    }

    @method
    public proposeDate(date: bigint, pubkey: PubKey, sig: Sig) {

      assert(this.admins.has(pubkey))

    }

    @method
    public acceptDate(pubkey: PubKey, sig: Sig) {

      assert(this.admins.has(pubkey))

    }

    @method
    public declineDate(pubkey: PubKey, sig: Sig) {

      assert(this.admins.has(pubkey)

    }
    */

    @method
    public cancel() {

      assert(true)

    }
}
