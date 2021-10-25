import { Requester, Validator } from '@chainlink/external-adapter'
import { create } from 'ipfs-http-client'
import * as fs from 'fs'
import { fetch } from 'node-fetch'

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

  // store ebird api key in environment variable
  // call ebird recent notable observations
  // add image to ipfs
  // create json doc for first ebird result
  // add json to ipfs, await cid
  // return cid which is tokenUri

  const ipfs = create()

  const fileName = 'ebird_pic.png'
  const image = fs.readFileSync(fileName)
  const { imageCid } = await ipfs.add({ path: fileName, content: image }, {
    progress: len => console.log(`Uploading file...${len}`),
  })
  console.log(`Picture CID ${imageCid}`)

  const regionCode = 'US'
  const ebirdApiCall = `https://api.ebird.org/v2/data/obs/${regionCode}/recent/notable`
  const ebirdRes = await fetch(ebirdApiCall, {
    headers: { 'X-eBirdApiToken': process.env.EBIRD_API_KEY },
  }).json()

  /*const recentNotable = ebirdRes[0]
  {
    "speciesCode": "rocwre",
    "comName": "Rock Wren",
    "sciName": "Salpinctes obsoletus",
    "locId": "L16718749",
    "locName": "Unicoi State Park",
    "obsDt": "2021-10-23 19:21",
    "howMany": 1,
    "lat": 34.72398,
    "lng": -83.724401,
    "obsValid": false,
    "obsReviewed": false,
    "locationPrivate": true,
    "subId": "S96617251"
}*/

  const metadata = toMetaData()


  // convert ebirdRes to metadata structure

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

const 

export default createRequest
