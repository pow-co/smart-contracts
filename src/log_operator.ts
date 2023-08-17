
import { Logger} from './contracts/logger'

import { ContractTransaction, MethodCallOptions, SignatureResponse, bsv, findSig, toByteString, Signer, DefaultProvider, Provider, PubKey } from 'scrypt-ts'

import { Wallet } from './scrypt_wallet'

export class LogOperator {

    private publicKey: bsv.PublicKey

    private logger: Logger

    private signer: Signer

    private provider: Provider

    constructor({ logger, privateKey, provider }: { logger: Logger, privateKey: bsv.PrivateKey, provider?: Provider }) {

        this.publicKey = privateKey.publicKey

        this.provider = provider || new DefaultProvider()

        this.signer = new Wallet(
            privateKey,
            this.provider
        )

        this.setLogger(logger)

    }

    static async createNewLogger({ privateKey, sastoshis, namespace }: { privateKey: bsv.PrivateKey, sastoshis: number, namespace: string }): Promise<LogOperator> {

        const logger = new Logger(
            toByteString(namespace, true),
            PubKey(privateKey.publicKey.toString()),
            PubKey(privateKey.publicKey.toString())
        )

        const logOperator = new LogOperator({
            logger,
            privateKey
        })

        await logger.deploy(sastoshis)

        return logOperator

    }

    get operator(): bsv.PublicKey {
        return new bsv.PublicKey(this.logger.operator.toString())
    }

    async log(level: string, kind: string, data: Buffer): Promise<bsv.Transaction> {

        const { tx } = await this.logger.methods.log(
            toByteString(level, true),
            toByteString(kind, true),
            toByteString(data.toString('hex'), false),
            (sigResponses: SignatureResponse[]) => {
                return findSig(sigResponses, this.publicKey)
            }
        )

        await this.setLogger(Logger.fromTx(tx, 0))

        return tx

    }

    async trace(kind: string, data: Buffer): Promise<bsv.Transaction> {
        // A log level describing events showing step by step execution of your code that can be ignored during the standard operation, but may be useful during extended debugging sessions.
        return this.log('TRACE', kind, data)

    }

    async debug(kind: string, data: Buffer): Promise<bsv.Transaction> {
        // A log level used for events considered to be useful during software debugging when more granular information is needed.
        return this.log('DEBUG', kind, data)

    }

    async info(kind: string, data: Buffer): Promise<bsv.Transaction> {
        // An event happened, the event is purely informative and can be ignored during normal operations.
        return this.log('INFO', kind, data)

    }
    
    async warn(kind: string, data: Buffer): Promise<bsv.Transaction> {
        // Unexpected behavior happened inside the application, but it is continuing its work and the key business features are operating as expected.
        return this.log('WARN', kind, data)

    }

    async error(kind: string, data: Buffer): Promise<bsv.Transaction> {
        // One or more functionalities are not working, preventing some functionalities from working correctly.
        return this.log('ERROR', kind, data)

    }

    async fatal(kind: string, data: Buffer): Promise<bsv.Transaction> {
        // One or more key business functionalities are not working and the whole system doesn’t fulfill the business functionalities. 
        return this.log('FATAL', kind, data)

    }

    private async setLogger(logger: Logger) {

        await logger.connect(this.signer)

        logger.bindTxBuilder('log', (
            current: Logger,
            options: MethodCallOptions<Logger>
        ): Promise<ContractTransaction> => {

            const nextInstance = current.next()

            const tx = new bsv.Transaction()
            tx.addInput(current.buildContractInput(options.fromUTXO)).addOutput(
                new bsv.Transaction.Output({
                    script: nextInstance.lockingScript,
                    satoshis: current.balance,
                })
            )
            tx.change(this.publicKey.toAddress())

            tx.feePerKb(Number(process.env.FEE_PER_KB) || 5)

            return Promise.resolve({
                tx: tx,
                atInputIndex: 0,
                nexts: [
                    {
                        instance: nextInstance,
                        balance: current.balance,
                        atOutputIndex: 0,
                    },
                ],
            })

        })

        this.logger = logger

    }

}
