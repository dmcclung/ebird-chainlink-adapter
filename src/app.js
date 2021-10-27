import express from 'express'
import createRequest from './createRequest'
import fetchEbird from './fetchEbird'

const app = express()
const port = 3000

app.use(express.json())

app.post('/', (req, res) => {
  console.log('POST Data: ', req.body)
  createRequest(req.body, (status, result) => {
    console.log('Result: ', result)
    res.status(status).json(result)
  })
})

app.get('/', async (req, res) => {
  const result = await fetchEbird()
  res.status(200).json(result)
})

app.listen(port, () => console.log(`Listening on port ${port}!`))
