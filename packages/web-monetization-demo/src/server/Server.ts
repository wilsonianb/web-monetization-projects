import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  requestBody,
  requestParam,
  response
} from 'inversify-express-utils'
import * as express from 'express'
import figlet from 'figlet'
import fetch from 'node-fetch'

export interface BatchPayment {
  time: number
  amount: number
}

@controller('/')
export class Server extends BaseHttpController {
  // balances: Record<string, number> = {}
  balances: Record<string, BatchPayment[]> = {}
  verifierUrl: string

  constructor() {
    super()
    this.verifierUrl =
      process.env.VERIFIER_URL || 'http://localhost:4001/verify'
  }

  @httpGet('balances/:requestId')
  async getBalance(@requestParam('requestId') requestId: string) {
    const balance = this.balances[requestId] || 0
    return this.ok(figlet.textSync(balance.toString()))
  }

  @httpPost('balances/:requestId::creditReceipt')
  async postReceipt(
    @requestParam('requestId') requestId: string,
    @requestBody() receipt: string,
    @response() resp: express.Response
  ) {
    const verifyResp = await fetch(this.verifierUrl, {
      method: 'POST',
      body: receipt
    })
    if (!verifyResp.ok) {
      resp.sendStatus(409)
      return
    }

    const amount = parseInt((await verifyResp.json()).amount)

    if (this.balances[requestId]) {
      const time = Date.now()
      const prevIdx = this.balances[requestId].length - 1
      const prevTime = this.balances[requestId][prevIdx].time
      const diff = time - prevTime
      if (diff < 5000) {
        this.balances[requestId][prevIdx].amount += amount
      } else {
        this.balances[requestId].push({
          amount,
          time
        })
        const totalTime =
          this.balances[requestId][prevIdx].time -
          this.balances[requestId][0].time
        const totalMin = Math.floor(totalTime / 60000)
          ? Math.floor(totalTime / 60000) + 'm'
          : ''
        const totalSec = Math.floor((totalTime % 60000) / 1000) + 's'
        console.log(
          '+' + totalMin + totalSec,
          this.balances[requestId][prevIdx].amount
        )
      }
    } else {
      this.balances[requestId] = [
        {
          amount,
          time: Date.now()
        }
      ]
    }
    resp.sendStatus(201)
  }
}
