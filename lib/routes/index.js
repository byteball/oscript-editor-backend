const express = require('express')
const { promisify } = require('util')
const aaValidation = require('ocore/aa_validation.js')
const { asyncMiddleware } = require('./middleware')

const router = express.Router()

router.post('/ojson/deploy', asyncMiddleware(async (req, res, next) => {
	const data = JSON.parse(req.body.data)
	console.log('data :', data)
	try {
		const validation = await promisify(aaValidation.validateAADefinition)([
			'autonomous agent',
			data
		])
		console.log('validation :', validation)
		res.send({ validation })
	} catch (err) {
		console.log('err :', err)
		res.send({ validation: err })
	}
}))

module.exports = router
