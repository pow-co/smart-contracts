import Video from '../contracts/video'
import {
    bsv,
    TestWallet,
    DefaultProvider,
    toByteString,
    PubKeyHash,
    Ripemd160,
    Sha256,
    HashedMap,
    ByteString,
    PubKey,
    hash256,
    findSig,
    MethodCallOptions
} from 'scrypt-ts'

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

async function buildNewContract(): Promise<Video> {

    const sha256Hash = hash256(toByteString(publicKey.toString()))

    const contentLength = 50000n

    const video = Video.buildVideo({      
        owner: publicKey,
        operator: publicKey,
        contentLength,
        sha256Hash
    })

    return video

}

async function main() {

    await Video.compile()

    var video: Video = await buildNewContract()

    await video.connect(signer)

    const fundingTx = await video.deploy(1)

    await video.connect(signer)

    console.log('video.funded', {txid: fundingTx.hash })

    const nextInstance = video.next()

    nextInstance.accepted = true

    const { tx: acceptTx } = await video.methods.accept((sigResponses: any) => {
        return findSig(sigResponses, publicKey)
      }, {
        pubKeyOrAddrToSign: publicKey.toAddress(),
        next:{
          instance: nextInstance,
          balance: video.balance
        }
      } as MethodCallOptions<Video>)

      console.log('video.accepted', {txid: acceptTx.hash })

      video = Video.fromTx(acceptTx, 0, {
        segments: nextInstance.segments
      })

      await video.connect(signer)

      for (let i=0; i<1000; i++) {

        const nextAddSegment = video.next()

        const segmentBytes = toByteString('hls video segment part', true)
  
        nextAddSegment.segments.set(BigInt(video.segments.size), segmentBytes)
  
        const { tx: addSegmentTx } = await video.methods.addSegment({
          _bytes: segmentBytes,
          duration: toByteString('8.333333', true)
        }, (sigResponses: any) => {
          return findSig(sigResponses, publicKey)
        }, {
          pubKeyOrAddrToSign: publicKey.toAddress(),
          next:{
            instance: nextAddSegment,
            balance: video.balance
          }
        } as MethodCallOptions<Video>)
  
        console.log('video.addSegment.result', {txid: addSegmentTx.hash, index: i })

        video = Video.fromTx(addSegmentTx, 0, {
            segments: nextAddSegment.segments
        })

        await video.connect(signer)

      }



}

main()
