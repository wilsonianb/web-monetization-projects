const defaultLogger = console.log.bind(console, 'adaptive-bandwidth:')

export interface AdaptiveBandwidthTiers {
  getBandwidth(url: string): Promise<number>
}

export class AdaptiveBandwidth {
  // Fields for calculation of outgoing money
  private _timeStarted!: number
  private _sentAmount!: number

  constructor(
    private _pageUrl: string,
    private _tiers: AdaptiveBandwidthTiers,
    private _debug: (...args: any[]) => void = defaultLogger
  ) {
    this.reset()
  }

  public reset() {
    this._timeStarted = Date.now()
    this._sentAmount = 0
    this._debug('reset amount parameters to 0')
  }

  addSentAmount(amount: string) {
    this._debug('adding sent amount of', amount)
    this._sentAmount += Number(amount) || 0
  }

  // noinspection DuplicatedCode
  async getStreamSendMax() {
    const time = Date.now()
    const timeElapsed = time - this._timeStarted
    const secondsElapsed = timeElapsed / 1000
    const bandwidth = await this._tiers.getBandwidth(this._pageUrl)
    const sendAmount = Math.floor(secondsElapsed * bandwidth - this._sentAmount)
    this._debug('current send amount is', sendAmount)
    return sendAmount
  }
}
