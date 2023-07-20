# Powco Smart Contracts

Quick access to all known smart contracts on powco at your fingertips

[![npm version](https://badge.fury.io/js/@powco%2Fsmart-contracts.svg)](https://badge.fury.io/js/@powco%2Fsmart-contracts)

```
npm install --save @powco/smart-contracts
```

Each contract added to ./src/contracts/ is compiled and its artifact.json pre-loaded
so you can use the contract class immediately right out of the box

```
import { TimeLockP2PKH } from '@powco/smart-contracts'

import { DevIssue } from '@powco/smart-contracts'

import { PersonalInterest } from '@powco/smart-contracts'

import { EventTicket } from '@powco/smart-contracts'

```

The goal is to accumulate source code for all known useful scrypt smart contracts,
and eventually allow for loading smart contract code classes directly from the
blockchain.

## Adding Your Contracts

Simply write your contract in the same format as the others in src/contracts, which
conform to the convention laid out by the scrypt-cli project generator.

## Usage in Development

If you are developing a new contract and want to test support in your app before
publishing a pull request to this repo, you can import the code into your project like
this:

- First build the code

`npm install && npm run build`

- Then in your typescript project

```
import { MySmartContract } from '/local/path/to/@powco/smart-contracts'

```

Remember to run `npm run build` after any change to your contract in development

## Build

```sh
npm run build
```

## Testing Locally

```sh
npm run test
```

## Run Bitcoin Testnet Tests

```sh
npm run testnet
```
