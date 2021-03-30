const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const path = require('path')

const app = express()
app.enable('trust proxy')

app.use(morgan('tiny'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/cosmos', require('./cosmos'))
app.use('/', express.static(path.join(__dirname, '../app')))
module.exports.apiServer = app

if (require.main === module) {
  const PORT = process.env.PORT || 3000
  const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
    console.log('Press Ctrl+C to quit.')
  })
}
