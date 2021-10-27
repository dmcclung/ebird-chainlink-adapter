import axios from 'axios'

const fetchEbird = async () => {
  const regionCode = 'US'
  const ebirdApiCall = `https://api.ebird.org/v2/data/obs/${regionCode}/recent/notable`
  const res = await axios.get(ebirdApiCall, {
    headers: { 'X-eBirdApiToken': process.env.EBIRD_API_KEY },
  })
  return res.data.slice(0, 10)
}

export default fetchEbird
