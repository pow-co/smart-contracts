
import { SmartContract, ByteString } from 'scrypt-ts'

export { HashedMap, HashedSet, PubKey, bsv } from 'scrypt-ts'

export * as scrypt from 'scrypt-ts'

export { ByteString }

interface Contracts {
    [key: string]: typeof SmartContract
}

import Video from './contracts/video'
import { Logger } from './contracts/logger'
import { Meeting } from './contracts/meeting'

const contracts: Contracts = {
    Video,
    Meeting,
    Logger
}

export { Video, Meeting, Logger }

for (const contract in contracts) {
    loadArtifact(contract)
}

export { contracts }

export default contracts

export { LogOperator } from './log_operator'

export { Wallet } from './scrypt_wallet'

function lowercaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1)
}

function loadArtifact(className: string) {
    const artifactFileName = `${lowercaseFirstLetter(className)}.json`

    const artifactPath = `../../artifacts/${artifactFileName}`

    const artifact = require(artifactPath)

    const Contract = contracts[className]

    Contract.loadArtifact(artifact)
}
