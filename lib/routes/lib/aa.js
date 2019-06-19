const express = require('express')

const { asyncMiddleware } = require('./middleware')
const { aaService } = requireRoot('lib/services')

const router = express.Router()

router.post('/deploy', asyncMiddleware(async (req, res, next) => {
	const data = JSON.parse(req.body.data)
	console.log('data :', data)
	try {
		const validation = await aaService.deploy(data)
		console.log('deploy :', validation)
		res.send({ validation })
	} catch (err) {
		console.log('deploy err :', err)
		res.send({ validation: err })
	}
}))

router.post('/validate', asyncMiddleware(async (req, res, next) => {
	const data = JSON.parse(req.body.data)
	console.log('data :', data)
	try {
		const validation = await aaService.validate(data)
		console.log('validation :', validation)
		res.send({ validation })
	} catch (err) {
		console.log('err :', err)
		res.send({ validation: err })
	}
}))

module.exports = router
