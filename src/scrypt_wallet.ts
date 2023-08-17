import { TestWallet, bsv } from "scrypt-ts";

export class Wallet extends TestWallet {
    get network() { return bsv.Networks.livenet }
  }
  