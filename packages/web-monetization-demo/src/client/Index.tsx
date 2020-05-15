import ReactDOM from 'react-dom'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { hot } from 'react-hot-loader/root'
import {
  IfNotWebMonetized,
  IfWebMonetizationPending,
  IfWebMonetized,
  useMonetizationCounter,
  useMonetizationState
} from '@web-monetization/react'

function pretty(val: unknown) {
  return JSON.stringify(val, null, 2)
}

const Index = hot(() => {
  const state = useMonetizationState()
  const counter = useMonetizationCounter()

  const paymentPointers = [
    'http://localhost:4000/spsp/~niq',
    'http://localhost:4001/spsp/~niq'
  ]
  const [paymentPointer, setPaymentPointer] = useState<string>(
    paymentPointers[0]
  )
  const [serverBalance, setServerBalance] = useState<number | null>(null)
  const [useReceipts, setUseReceipts] = useState<boolean>(true)
  const toggleReceipts = () => setUseReceipts(!useReceipts)
  useEffect(() => {
    async function submitReceipt(requestId: string, receipt: string) {
      const resp = await fetch(
        `http://localhost:4002/balances/${requestId}:creditReceipt`,
        {
          method: 'POST',
          body: receipt
        }
      )
      if (resp.ok) {
        const balance = await resp.json()
        setServerBalance(balance)
      }
    }
    if (counter.requestId && counter.receipt) {
      submitReceipt(counter.requestId, counter.receipt)
    }
  }, [counter.receipt])
  useEffect(() => {
    setPaymentPointer(paymentPointers[+useReceipts])
  }, [useReceipts])
  return (
    <div>
      <Helmet>
        <meta charSet='utf-8' />
        <title>Web-Monetization Demo</title>
        <meta name='monetization' content={paymentPointer} />
      </Helmet>
      <h1>Web-Monetization Demo</h1>
      <form>
        <label>
          Use receipts:
          <input
            name='useReceipts'
            type='checkbox'
            checked={useReceipts}
            onChange={toggleReceipts}
          />
        </label>
      </form>
      <pre>(React) useMonetizationState: {pretty(state)}</pre>

      <pre>(React) useMonetizationCounter: {pretty(counter)}</pre>

      <pre>
        (React) IfNotWebMonetized: <IfNotWebMonetized>Yes</IfNotWebMonetized>
      </pre>

      <pre>
        (React) IfWebMonetized: <IfWebMonetized>Yes</IfWebMonetized>
      </pre>

      <pre>
        (React) IfWebMonetizationPending:{' '}
        <IfWebMonetizationPending>Yes</IfWebMonetizationPending>
      </pre>
      <pre>(Receipt Verifier) Balance: {serverBalance}</pre>
    </div>
  )
})

ReactDOM.render(<Index />, document.querySelector('#root'))
