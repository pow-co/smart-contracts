import { join } from 'path'

import { readFileSync } from 'fs'

import { SmartContract } from 'scrypt-ts'

interface Contracts {
    [key: string]: SmartContract
}

const contracts: Contracts = require('require-all')({
    dirname: join(__dirname, 'contracts'),

    map: (name) => capitalizeFirstLetter(name),

    resolve: (_module) => {
        if (_module.default) return _module.default

        return _module[Object.keys(_module)[0]]
    },
})

for (const className in contracts) {
    const artifactFileName = `${lowercaseFirstLetter(className)}.json`

    const artifactPath = join(
        __dirname,
        '..',
        '..',
        'artifacts',
        artifactFileName
    )

    const artifact = JSON.parse(readFileSync(artifactPath).toString())

    const Contract = contracts[className]

    //@ts-ignore
    Contract.loadArtifact(artifact)

    module.exports[className] = Contract
}

export { contracts }

export default contracts

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function lowercaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1)
}
