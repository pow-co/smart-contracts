
import { Meeting } from './contracts/meeting'

import { bsv, TxOutputRef } from 'scrypt-ts'

import { fetchTransaction, getSpend } from './whatsonchain'

interface Outpoint {
  tx: bsv.Transaction
  vout: number
}

interface Inpoint {
  tx: bsv.Transaction
  vin: number
}

export async function findNext(meeting: Meeting): Promise<Meeting> {

  console.log('FIND NEXT')

  const spend = await getSpend({
    txid: (meeting.from as TxOutputRef).tx.hash,
    vout: meeting.from.outputIndex,
    script_hash: meeting.scriptHash
  }) 

  console.log('SPEND', spend)

  return meeting
}

export async function findOrigin(meeting: Meeting): Promise<Meeting> {

  let tx = (meeting.from as TxOutputRef).tx

  const outputIndex = meeting.from.outputIndex

  var previousMeeting: Meeting;

  var inputIndex = 0

  for (let input of tx.inputs) {

    console.log({ input })

    const previousTx = await fetchTransaction({ txid: input.prevTxId.toString('hex') })

    console.log({ previousTx })

    try {

      const callData = Meeting.parseCallData(previousTx, inputIndex)

      console.log('parseCallData.result', callData)

    } catch(error) {

      console.log('parseCallData.error', error)

    }   

    for (let i=0; i<previousTx.outputs.length; i++) {

      let output = previousTx.outputs[i]

      try {

        console.log(output, i)

        previousMeeting = Meeting.fromTx(previousTx, i)

        break;

      } catch(error) {

        console.error(error)

      }

    }

    inputIndex++

  }

  return previousMeeting

  // find the previous state of the contract
  // if there is no previous state, you are at the origin 
  // if there is a previous state, repeat
  return

}

export async function findLocation(meeting: Meeting): Promise<Outpoint | undefined> {

  return

}

export async function getPrevious(meeting: Meeting): Promise<Meeting | undefined> {

  return

}

export async function getNext(meeting: Meeting): Promise<Meeting | undefined> {

  return

}

