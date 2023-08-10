
import { bsv } from 'scrypt-ts'

import axios from 'axios'

import delay from './delay'

export async function fetchTransaction({ txid }): Promise<bsv.Transaction> {
  
  const { data } = await axios.get(`https://api.whatsonchain.com/v1/bsv/main/tx/${txid}/hex`)

  return new bsv.Transaction(data)

}

export async function getTransaction(txid: string): Promise<WhatsonchainTransaction> {

  let url =`https://api.whatsonchain.com/v1/bsv/main/tx/hash/${txid}`

  let {data} = await axios.get(url)

  return data

}

export async function getScriptHistory({ scriptHash }:{ scriptHash: string }): Promise<{tx_hash: string, height: number}[]> {
    
  let url = `https://api.whatsonchain.com/v1/bsv/main/script/${scriptHash}/history`
      
  const { data } = await axios.get(url)
    
  return data
    
}

export async function getSpend(args: GetSpend): Promise<{txid:string,vin:number} | null> {

  const history = await getScriptHistory({ scriptHash: args.script_hash })

  await delay(500)

  const spends: any[] = [];

  for (let item of history) {

    await delay(500)

    const { tx_hash } = item

    if (tx_hash === args.txid) { return null }

    const transaction = await getTransaction(tx_hash)

    const matches = transaction.vin.map((vin, index) => {

      return Object.assign(vin, { index })

    }).filter((vin, index) => {

      return vin.txid == args.txid && vin.vout == args.vout

    })

    let match = matches[0]

    if (match) {

      spends.push({
        txid: tx_hash,
        vin: match.index 
      })

    };

  }

  const spend = spends.flat().filter(s => !!s)[0]

  return spend

}

interface GetSpend {
  script_hash: string;
  txid: string;
  vout: number;
} 


export interface WhatsonchainTransaction {
  txid: string;
  hash: string;
  time: number;
  blocktime: number;
  blockhash: string;
  vin: any[];
  vout: any[];
}
