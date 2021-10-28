import axios from 'axios'

export const getEbirdUrl = () => {
  const regionCode = 'US'
  return `https://api.ebird.org/v2/data/obs/${regionCode}/recent/notable`
}

export const getEbirdHeaders = () => (
  { 'X-eBirdApiToken': process.env.EBIRD_API_KEY }
)

export const fetchEbird = async () => {
  const res = await axios.get(getEbirdUrl(), {
    headers: getEbirdHeaders(),
  })
  return res.data.slice(0, 10)
}
