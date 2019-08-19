const express = require('express')
const {
	ErrorCodes,
	ParsingError,
	ValidationError,
	AgentAlreadyDeployedError
} = requireRoot('lib/errors')

const { asyncMiddleware } = require('./middleware')
const { aaService } = requireRoot('lib/services')

const router = express.Router()

router.post('/deploy', asyncMiddleware(async (req, res, next) => {
	const data = JSON.parse(req.body.data)
	try {
		const result = await aaService.deploy(data)
		res.status(200).send({ result })
	} catch (error) {
		let status, body
		if (error instanceof ValidationError) {
			status = 400
			body = { error: error.message, errorCode: ErrorCodes.VALIDATION_ERROR }
		} else if (error instanceof ParsingError) {
			status = 400
			body = { error: error.message, errorCode: ErrorCodes.PARSING_ERROR }
		} else if (error instanceof AgentAlreadyDeployedError) {
			status = 500
			body = { error: error.message, errorCode: ErrorCodes.AGENT_ALREADY_DEPLOYED_ERROR }
		} else {
			status = 500
			body = { error: error.message || error, errorCode: ErrorCodes.INTERNAL_ERROR }
		}
		res.status(status).send(body)
	}
}))

router.post('/validate', asyncMiddleware(async (req, res, next) => {
	const data = JSON.parse(req.body.data)
	try {
		let body = await aaService.validate(data)
		res.status(200).send(body ? body : 'AA validated')
	} catch (error) {
		let status, body
		if (error instanceof ValidationError) {
			status = 400
			body = { error: error.message, errorCode: ErrorCodes.VALIDATION_ERROR }
		} else if (error instanceof ParsingError) {
			status = 400
			body = { error: error.message, errorCode: ErrorCodes.PARSING_ERROR, line: error.line, column: error.column }
		} else {
			status = 500
			body = { error: error.message, errorCode: ErrorCodes.INTERNAL_ERROR }
		}
		res.status(status).send(body)
	}
}))

module.exports = router
