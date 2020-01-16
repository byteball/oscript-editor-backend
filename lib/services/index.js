const eventBus = require('ocore/event_bus.js')
const AaService = require('./lib/AaService')
const AgentLinkService = require('./lib/AgentLinkService')

const aaService = new AaService()
const agentLinkService = new AgentLinkService()

module.exports = {
	aaService,
	agentLinkService,

	async startServices () {
		return new Promise((resolve, reject) => {
			require('headless-obyte')
			eventBus.once('headless_wallet_ready', resolve)
		})
	}
}
