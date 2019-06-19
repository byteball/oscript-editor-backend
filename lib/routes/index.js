const express = require('express')
const aaRouter = require('./lib/aa')

const router = express.Router()

router.use('/aa/', aaRouter)

module.exports = router
