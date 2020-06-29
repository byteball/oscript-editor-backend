const ErrorCodes = require('./lib/ErrorCodes')
const ParsingError = require('./lib/ParsingError')
const InternalError = require('./lib/InternalError')
const ValidationError = require('./lib/ValidationError')
const ShortcodeNotFoundError = require('./lib/ShortcodeNotFoundError')
const SharedAgentNotFoundError = require('./lib/SharedAgentNotFoundError')
const AgentAlreadyDeployedError = require('./lib/AgentAlreadyDeployedError')

module.exports = {
	ParsingError,
	InternalError,
	ValidationError,
	ShortcodeNotFoundError,
	SharedAgentNotFoundError,
	AgentAlreadyDeployedError,

	ErrorCodes
}
