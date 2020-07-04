const express = require('express')
const {
	ErrorCodes,
	SharedAgentNotFoundError
} = requireRoot('lib/errors')

const { asyncMiddleware } = require('./middleware')
const { agentShareService } = requireRoot('lib/services')

const router = express.Router()

router.post('/', asyncMiddleware(async (req, res, next) => {
	try {
		const shortcode = await agentShareService.create(req.body)
		res.status(200).send({ shortcode })
	} catch (error) {
		res.status(500).send({ error: error.message || error, errorCode: ErrorCodes.INTERNAL_ERROR })
	}
}))

router.get('/:shortcode', asyncMiddleware(async (req, res, next) => {
	const shortcode = req.params.shortcode
	try {
		const agent = await agentShareService.get(shortcode)
		res.status(200).send(agent)
	} catch (error) {
		let status, body
		if (error instanceof SharedAgentNotFoundError) {
			status = 400
			body = { error: error.message, errorCode: ErrorCodes.SHARED_AGENT_NOT_FOUND_ERROR }
		} else {
			status = 500
			body = { error: error.message || error, errorCode: ErrorCodes.INTERNAL_ERROR }
		}
		res.status(status).send(body)
	}
}))

module.exports = router
