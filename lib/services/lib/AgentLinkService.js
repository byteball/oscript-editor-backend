const { nanoid } = require('nanoid')
const { isString } = require('lodash')
const { ShortcodeNotFoundError } = requireRoot('lib/errors')

const LINK_EXPIRATION_TIMEOUT = 300 * 1000

class AgentLinkService {
	constructor () {
		this.links = {}
	}

	create (agentString) {
		if (!isString(agentString)) {
			throw new Error('Bad agent format')
		}
		const shortcode = nanoid(10)
		this.links[shortcode] = agentString
		setTimeout(() => this.clearShortcode(shortcode), LINK_EXPIRATION_TIMEOUT)
		return shortcode
	}

	get (shortcode) {
		if (this.links[shortcode]) {
			return this.links[shortcode]
		} else {
			throw new ShortcodeNotFoundError('Not registered shortcode')
		}
	}

	clearShortcode (shortcode) {
		delete this.links[shortcode]
	}
}
module.exports = AgentLinkService
