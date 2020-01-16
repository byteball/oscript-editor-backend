const ErrorCodes = require('./lib/ErrorCodes')
const ParsingError = require('./lib/ParsingError')
const InternalError = require('./lib/InternalError')
const ValidationError = require('./lib/ValidationError')
const ShortcodeNotFoundError = require('./lib/ShortcodeNotFoundError')
const AgentAlreadyDeployedError = require('./lib/AgentAlreadyDeployedError')

module.exports = {
	ParsingError,
	InternalError,
	ValidationError,
	ShortcodeNotFoundError,
	AgentAlreadyDeployedError,

	ErrorCodes
}
