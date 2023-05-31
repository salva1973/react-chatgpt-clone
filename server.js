const express = require('express')
const cors = require('cors')
require('dotenv').config()

const PORT = process.env.PORT
const API_KEY = process.env.OPENAI_API_KEY

const app = express()
app.use(express.json())
app.use(cors())

app.post('/completions', async (req, res) => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: req.body.message,
        },
      ],
      max_tokens: 100,
    }),
  }
  try {
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      options
    )
    const data = await response.json()
    res.send(data)
  } catch (error) {
    console.error(error)
  }
})

app.listen(PORT, () => console.log(`Server listening to port ${PORT}`))
