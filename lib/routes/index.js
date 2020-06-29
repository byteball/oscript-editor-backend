const express = require('express')
const aaRouter = require('./lib/aa')
const agentLink = require('./lib/agentLink')
const agentShare = require('./lib/agentShare')

const router = express.Router()

router.use('/aa/', aaRouter)
router.use('/link/', agentLink)
router.use('/s/', agentShare)

module.exports = router
