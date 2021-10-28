import { Requester, Validator } from '@chainlink/external-adapter'
import { create } from 'ipfs-http-client'
import * as fs from 'fs'
import { getEbirdUrl, getEbirdHeaders } from './ebirdHelper'

const customError = data => {
  if (data.Response === 'Error') return true
  return false
}

const customParams = {
  lat: true,
  lng: true,
  comName: true,
}

const getContentIdentifier = async data => {
  const ipfs = create()
  const { cid } = await ipfs.add(JSON.stringify(data), {
    progress: len => console.log(`Uploading file...${len}`),
  })
  console.log(`CID ${cid}`)
  return cid
}

const createRequest = async (input, callback) => {
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const { lat, lng, comName } = validator.validated.data

  try {
    const fileName = 'ebird_pic.png'
    const image = fs.readFileSync(fileName)
    const imageCid = getContentIdentifier({ path: 'ebird_pic.png', content: image })

    const url = getEbirdUrl()
    const headers = getEbirdHeaders()

    const response = await Requester.request({ url, headers }, customError)
    const recentObservables = response.data
    const recentObs = recentObservables.find(obs => (
      obs.lat === lat && obs.lng === lng && obs.comName === comName
    ))

    const metaData = {
      description: 'Ebird API Recent Observable NFT',
      external_url: 'https://ebird.org',
      image: `ipfs://${imageCid}`,
      name: `${recentObs.comName}`,
      attributes: [
        {
          trait_type: 'Latitude',
          value: recentObs.lat,
        },
        {
          trait_type: 'Longitude',
          value: recentObs.lng,
        },
      ],
    }

    const metaDataCid = getContentIdentifier(JSON.stringify(metaData))
    response.data.result = metaDataCid

    callback(response.status, Requester.success(jobRunID, response))
  } catch (error) {
    callback(500, Requester.errored(jobRunID, error))
  }
}

export default createRequest
