const express = require('express')
const { ValidationError } = requireRoot('lib/errors')

const { asyncMiddleware } = require('./middleware')
const { aaService } = requireRoot('lib/services')

const router = express.Router()

router.post('/deploy', asyncMiddleware(async (req, res, next) => {
	const data = JSON.parse(req.body.data)
	try {
		const result = await aaService.deploy(data)
		res.send({ result })
	} catch (error) {
		if (error instanceof ValidationError) {
			res.status(422).send({ error })
		}
		res.status(500).send({ error })
	}
}))

router.post('/validate', asyncMiddleware(async (req, res, next) => {
	const data = JSON.parse(req.body.data)
	try {
		await aaService.validate(data)
		res.status(200).send()
	} catch (error) {
		res.status(422).send({ error })
	}
}))

module.exports = router
