import { Meeting } from '../contracts/meeting'
import {
    bsv,
    TestWallet,
    DefaultProvider,
    MethodCallOptions,
    sha256,
    toByteString,
    PubKeyHash,
    Ripemd160,
    findSig,
    PubKey,
    HashedSet
} from 'scrypt-ts'

import { findOrigin } from './../meetings'

import { decode } from 'bs58'

import * as dotenv from 'dotenv'

import { fetchTransaction } from './../whatsonchain'

// Load the .env file
dotenv.config()

// Read the private key from the .env file.
// The default private key inside the .env file is meant to be used for the Bitcoin testnet.
// See https://scrypt.io/docs/bitcoin-basics/bsv/#private-keys
const privateKey = bsv.PrivateKey.fromWIF(process.env.PRIVATE_KEY || '')
const privateKey2 = bsv.PrivateKey.fromWIF(process.env.PRIVATE_KEY_2 || '')
const privateKey3 = bsv.PrivateKey.fromWIF(process.env.PRIVATE_KEY_3 || '')
const privateKey4 = bsv.PrivateKey.fromWIF(process.env.PRIVATE_KEY_4 || '')

class Wallet extends TestWallet {
  get network() { return bsv.Networks.livenet }
}

const provider = new DefaultProvider()

const publicKey = privateKey.publicKey
const publicKey2 = privateKey2.publicKey
const publicKey3 = privateKey3.publicKey
const publicKey4 = privateKey4.publicKey

// Prepare signer.
// See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
const signer = new Wallet(
    privateKey,
    provider
)

async function deployNewContract(): Promise<Meeting> {

    // TODO: Adjust the amount of satoshis locked in the smart contract:
    const amount = 1

    const price = 5000n

    const owner = PubKeyHash(Ripemd160(Buffer.from(decode(privateKey.toAddress().toString())).toString('hex')))

    var admins = new HashedSet<PubKey>()
    const invitees = new HashedSet<PubKey>()
    const attendees = new HashedSet<PubKey>()
    const inviteRequired = false

    admins = admins.add(PubKey(publicKey.toString()))

    const instance = new Meeting(
        toByteString('Weekly Scrypt Meetup #19', true),
        toByteString('This is the description of the weekly Scrypt meetup #19.', true),
        1620000000n,
        1620003600n,        
        admins,
        invitees,
        attendees,
        inviteRequired
    )

    const network = await provider.getNetwork()

    console.log({ network })

    // Connect to a signer.
    await instance.connect(signer)

    // Contract deployment.
    const deployTx = await instance.deploy(amount)
    console.log(`Meeting contract deployed: ${deployTx.id}`)

    return instance

}

async function main() {

    await Meeting.compile()

    const origin = process.env.meeting_origin || `2ee639a86283a7032ef379b8b7841c3953bb5f5cbfb002d393b4cda18d540e81_0`

    var meeting: Meeting;

    const pubKey = PubKey(publicKey.toString())

    if (true) {

      meeting = await deployNewContract() 

    } else {

      const [txid, vout] = origin.split('_')

      const tx = await fetchTransaction({ txid })

      const admins = new HashedSet<PubKey>()

      admins.add(pubKey)

      console.log(tx)

      meeting = Meeting.fromTx(tx, parseInt(vout), {
        admins: new HashedSet<PubKey>(),
        attendees: new HashedSet<PubKey>(),
        invitees: new HashedSet<PubKey>()
      })

    }

    await meeting.connect(signer)

    var nextInstance = meeting.next()

    nextInstance.attendees.add(PubKey(publicKey.toString()))

    const { tx: attendTx } = await meeting.methods.attend(PubKey(publicKey.toString()), (sigResponses: any) => {
      return findSig(sigResponses, publicKey)
    }, {
      pubKeyOrAddrToSign: publicKey.toAddress(),
      next:{
        instance:nextInstance,
        balance: meeting.balance
      }
    } as MethodCallOptions<Meeting>)

    console.log('attendees0', meeting.isAttending(pubKey))
  
    console.log({ attendTx })

    console.log('attendTx', attendTx.hash)

    meeting = Meeting.fromTx(attendTx, 0, {
      attendees: nextInstance.attendees,
      invitees: nextInstance.invitees,
      admins: nextInstance.admins
    })

    await meeting.connect(signer)

    //const originContract = await findOrigin(meeting)

    //console.log({ originContract })

    //return

    var nextInstance = meeting.next()

    const pubKey2 = PubKey(privateKey2.publicKey.toString())

    nextInstance.invitees.add(pubKey2)

    const { tx: inviteTx } = await meeting.methods.invite(pubKey2, pubKey, (sigResponses: any) => {
      return findSig(sigResponses, publicKey)
    }, {
      pubKeyOrAddrToSign: publicKey.toAddress(),
      next:{
        instance:nextInstance,
        balance: meeting.balance
      }
    } as MethodCallOptions<Meeting>)

    meeting = Meeting.fromTx(inviteTx, 0, {
      attendees: nextInstance.attendees,
      invitees: nextInstance.invitees,
      admins: nextInstance.admins
    })

    const minting = await findOrigin(meeting)

    console.log('minting', minting)

    return

    console.log('player 2 is invited?', meeting.isInvited(pubKey2))
    console.log('player 2 is attending?', meeting.isAttending(pubKey2))
  
    console.log({ inviteTx })

    console.log('inviteTx', inviteTx.hash)


    nextInstance = meeting.next()

    const signer2 = new Wallet(
        privateKey2,
        provider
    )

    await meeting.connect(signer2)

    nextInstance.attendees.add(pubKey2)

    const { tx: attend2Tx } = await meeting.methods.attend(pubKey2, (sigResponses: any) => {
      return findSig(sigResponses, publicKey2)
    }, {
      pubKeyOrAddrToSign: publicKey2.toAddress(),
      next:{
        instance:nextInstance,
        balance: meeting.balance
      }
    } as MethodCallOptions<Meeting>)

    meeting = Meeting.fromTx(attend2Tx, 0, {
      attendees: nextInstance.attendees,
      invitees: nextInstance.invitees,
      admins: nextInstance.admins
    })

    console.log('player 2 is invited?', meeting.isInvited(pubKey2))
    console.log('player 2 is attending?', meeting.isAttending(pubKey2))
    console.log('')
    console.log('player 1 is invited?', meeting.isInvited(pubKey))
    console.log('player 1 is attending?', meeting.isAttending(pubKey))

    console.log(meeting.attendees)

    meeting.attendees.forEach(attendee => {

      console.log(attendee)

    })

}

main()
