const express = require('express')
const GraphDB = require('./graphDB')
const router = express.Router()

router.get('/states', async (req, res) => {
  try {
    res.json(await new GraphDB().states())
  } catch (err) {
    return res.status(500).send({
      message: err.message
    })
  }
})

router.get('/transitions', async (req, res) => {
  try {
    res.json(await new GraphDB().transitions())
  } catch (err) {
    return res.status(500).send({
      message: err.message
    })
  }
})
module.exports = router
