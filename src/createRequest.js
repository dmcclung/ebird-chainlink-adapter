import { Requester, Validator } from '@chainlink/external-adapter'

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = data => {
  if (data.Response === 'Error') return true
  return false
}

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  base: ['base', 'from', 'coin'],
  quote: ['quote', 'to', 'market'],
  endpoint: false,
}

const createRequest = async (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const endpoint = validator.validated.data.endpoint || 'price'
  const url = `https://min-api.cryptocompare.com/data/${endpoint}`
  const fsym = validator.validated.data.base.toUpperCase()
  const tsyms = validator.validated.data.quote.toUpperCase()

  const params = {
    fsym,
    tsyms,
  }

  // This is where you would add method and headers
  // you can add method like GET or POST and add it to the config
  // The default is GET requests
  // method = 'get'
  // headers = 'headers.....'
  const config = {
    url,
    params,
  }

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  try {
    const response = await Requester.request(config, customError)

    // It's common practice to store the desired value at the top-level
    // result key. This allows different adapters to be compatible with
    // one another.
    response.data.result = Requester.validateResultNumber(response.data, [tsyms])
    callback(response.status, Requester.success(jobRunID, response))
  } catch (error) {
    callback(500, Requester.errored(jobRunID, error))
  }
}

export default createRequest
