const express = require('express')
const {
	ErrorCodes,
	ShortcodeNotFoundError
} = requireRoot('lib/errors')

const { asyncMiddleware } = require('./middleware')
const { agentLinkService } = requireRoot('lib/services')

const router = express.Router()

router.post('/', asyncMiddleware(async (req, res, next) => {
	try {
		const shortcode = agentLinkService.create(req.body)
		res.status(200).send({ shortcode })
	} catch (error) {
		res.status(500).send({ error: error.message || error, errorCode: ErrorCodes.INTERNAL_ERROR })
	}
}))

router.get('/:shortcode', asyncMiddleware(async (req, res, next) => {
	const shortcode = req.params.shortcode
	try {
		const agent = agentLinkService.get(shortcode)
		res.status(200).send(agent)
	} catch (error) {
		let status, body
		if (error instanceof ShortcodeNotFoundError) {
			status = 404
			body = { error: error.message, errorCode: ErrorCodes.SHORTCODE_NOT_FOUND_ERROR }
		} else {
			status = 500
			body = { error: error.message || error, errorCode: ErrorCodes.INTERNAL_ERROR }
		}
		res.status(status).send(body)
	}
}))

module.exports = router
