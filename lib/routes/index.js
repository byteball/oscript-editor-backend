const express = require('express')
const aaRouter = require('./lib/aa')
const agentLink = require('./lib/agentLink')

const router = express.Router()

router.use('/aa/', aaRouter)
router.use('/link/', agentLink)

module.exports = router
