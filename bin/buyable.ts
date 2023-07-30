
import { Command } from 'commander'

import { parseFromTxid } from '..'

import { Buyable } from '..'

const program = new Command()


program
  .command('demo_deploy_and_sell')
  .action(async () => {

    try {


      process.exit(0)

    } catch(error) {

      console.error(error)

      process.exit(1)

    }

  })



program
  .command('parse_from_txid <txid>')
  .action(async (txid) => {

    try {

      //@ts-ignore
      const instances: Buyable[] = await parseFromTxid<typeof Buyable>(Buyable, txid)

      for (let instance of instances) {

        console.log(instance)

      }

      process.exit(0)

    } catch(error) {

      console.error(error)

      process.exit(1)

    }

  })

program.parse(process.argv)

