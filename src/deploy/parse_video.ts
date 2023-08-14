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
    TxOutputRef,
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
    get network() {
        return bsv.Networks.livenet
    }
}

const provider = new DefaultProvider()

const publicKey = privateKey.publicKey
const publicKey2 = privateKey2.publicKey
const publicKey3 = privateKey3.publicKey
const publicKey4 = privateKey4.publicKey

// Prepare signer.
// See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
const signer = new Wallet(privateKey, provider)

async function buildNewContract(): Promise<Video> {
    const owner = PubKey(publicKey.toString())

    const operator = PubKey(publicKey.toString())

    const segments = new HashedMap<bigint, ByteString>()

    const slug = toByteString('that-awesome-dance-party-in-ibiza', true)

    const og_title = toByteString('Dancing In Ibiza Summer 2027', true)

    const og_description = toByteString(' ', true)

    const og_image = toByteString(' ', true)

    const og_url = toByteString(' ', true)

    const og_type = toByteString(' ', true)

    const og_site_name = toByteString(' ', true)

    const og_locale = toByteString(' ', true)

    const og_audio = toByteString(' ', true)

    const og_video = toByteString(' ', true)

    const og_article_author = toByteString(' ', true)

    const og_article_published_time = toByteString(' ', true)

    const og_article_modified_time = toByteString(' ', true)

    const sha256Hash = toByteString(' ', true)

    const contentLength = 50000n

    const instance = new Video(
        Sha256(sha256Hash),
        contentLength,
        segments,
        owner,
        operator,
        slug,
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

    return instance
}

async function main() {
    await Video.compile()

    const txid =
        '3ee66e97b50de5190105c71af741cc44ccdcd86389759baae5f830cd5b4e1ed5'

    const tx: bsv.Transaction = await fetchTransaction({ txid })

    const video = Video.fromTx(tx, 0, {
        segments: new HashedMap<bigint, ByteString>(),
    })

    console.log('video.funded', video)
}

main()
