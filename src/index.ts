
import { join } from 'path'

import { PersonalInterest } from './contracts/personalInterest'

var contracts: any = require('require-all')({

  dirname: join(__dirname, 'contracts'),

  map: (name, path) => capitalizeFirstLetter(name),

  resolve: (_module) => {

    if (_module.default) return _module.default

    return _module[Object.keys(_module)[0]]

  }
});

for (let className in contracts) {

  const artifactFileName = `${lowercaseFirstLetter(className)}.json`

  const artifactPath = join(__dirname, '..', '..', 'artifacts', artifactFileName)

  const artifact = require(artifactPath)

  const Contract = contracts[className]

  Contract.loadArtifact(artifact)

  module.exports[className] = Contract

}

export { contracts } 

export default contracts

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowercaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
