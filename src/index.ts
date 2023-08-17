import { join } from 'path'

import { SmartContract, ByteString } from 'scrypt-ts'

export { HashedMap, bsv } from 'scrypt-ts'

export { ByteString }

interface Contracts {
    [key: string]: typeof SmartContract
}

import Video from './contracts/video'

const contracts: Contracts = {
    Video: Video,
}

function loadArtifact(className: string) {
    const artifactFileName = `${lowercaseFirstLetter(className)}.json`

    const artifactPath = join(
        __dirname,
        '..',
        '..',
        'artifacts',
        artifactFileName
    )

    const artifact = require(artifactPath)

    const Contract = contracts[className]

    //@ts-ignore
    Contract.loadArtifact(artifact)
}

for (const contract in contracts) {
    loadArtifact(contract)

    module.exports[contract] = contracts[contract]
}

export { Video }

export { contracts }

export default contracts

export { LogOperator } from './log_operator'

export { Wallet } from './scrypt_wallet'

function lowercaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1)
}
