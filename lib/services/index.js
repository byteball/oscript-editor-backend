const eventBus = require('ocore/event_bus.js')
const AaService = require('./lib/AaService')
const AgentLinkService = require('./lib/AgentLinkService')
const AgentShareService = require('./lib/AgentShareService')
const db = requireRoot('lib/db')

const aaService = new AaService()
const agentLinkService = new AgentLinkService()
const agentShareService = new AgentShareService()

module.exports = {
	aaService,
	agentLinkService,
	agentShareService,

	async startServices () {
		return new Promise((resolve, reject) => {
			require('headless-obyte')
			eventBus.once('headless_wallet_ready', async () => {
				await db.start()
				resolve()
			})
		})
	}
}
