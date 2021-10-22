import { assert } from 'chai'
import { Requester } from '@chainlink/external-adapter'
import { assertError } from '@chainlink/adapter-test-helpers'
import createRequest from '../src/createRequest'

describe('createRequest', () => {
  const jobID = '1'

  describe('successful calls', () => {
    const requests = [
      { name: 'id not supplied', testData: { data: { base: 'ETH', quote: 'USD' } } },
      { name: 'base/quote', testData: { id: jobID, data: { base: 'ETH', quote: 'USD' } } },
      { name: 'from/to', testData: { id: jobID, data: { from: 'ETH', to: 'USD' } } },
      { name: 'coin/market', testData: { id: jobID, data: { coin: 'ETH', market: 'USD' } } },
    ]

    requests.forEach(req => {
      it(`${req.name}`, () => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 200)
          assert.equal(data.jobRunID, jobID)
          assert.isNotEmpty(data.data)
          assert.isAbove(Number(data.result), 0)
          assert.isAbove(Number(data.data.result), 0)
        })
      })
    })
  })

  describe('error calls', () => {
    const requests = [
      { name: 'empty body', testData: {} },
      { name: 'empty data', testData: { data: {} } },
      { name: 'base not supplied', testData: { id: jobID, data: { quote: 'USD' } } },
      { name: 'quote not supplied', testData: { id: jobID, data: { base: 'ETH' } } },
      { name: 'unknown base', testData: { id: jobID, data: { base: 'not_real', quote: 'USD' } } },
      { name: 'unknown quote', testData: { id: jobID, data: { base: 'ETH', quote: 'not_real' } } },
    ]

    requests.forEach(req => {
      it(`${req.name}`, async () => {
        try {
          await createRequest(req.testData)
        } catch (error) {
          const errorRes = Requester.errored(jobID, error)
          assertError({ expected: 500, actual: errorRes.statusCode }, errorRes, jobID)
        }
      })
    })
  })
})
