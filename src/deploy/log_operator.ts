require('dotenv').config()

import { bsv } from "scrypt-ts";
import { Logger } from "../contracts/logger";
import { LogOperator } from "../log_operator";

import delay from "../delay";

export default async function main() {

    await Logger.compile()

    const privateKey = new bsv.PrivateKey(process.env.PRIVATE_KEY);

    const log: LogOperator = await LogOperator.createNewLogger({
        namespace: 'test',
        privateKey,
        sastoshis: 50000
    })

    /* Alternatively load an existing logger **
    
      const log: LogOperator = await LogOperator.loadFromOrigin({
        origin: '71fba386341b932380ec5bfedc3a40bce43d4974decdc94c419a94a8ce5dfc23_0',
        privateKey,
        scryptApiKey: process.env.SCRYPT_API_KEY
      })

      const log: LogOperator = await LogOperator.loadFromLocation({
        location: '8d81e17f8c62e97bc21555f7e3c754576fcaab3d37fdcdfbbfc7e870cf0f8fa4_0',
        privateKey
      })
    
    */

    for (let i = 0; i < 10; i++) {

        const tx = await log.info('test', Buffer.from('test'))

        console.log('tx', tx.hash)

        await delay(1000)

    }

}

if (require.main === module) main()