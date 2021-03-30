const express = require('express')
const app = express()

app.use((req, res, next) => {
  res.status(404).send('Http 404: Not found.')
})

module.exports = app
