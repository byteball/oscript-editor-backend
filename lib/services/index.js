const eventBus = require('ocore/event_bus.js')
const AaService = require('./lib/AaService')

const aaService = new AaService()

module.exports = {
	aaService,

	async startServices () {
		return new Promise((resolve, reject) => {
			require('headless-obyte')
			eventBus.once('headless_wallet_ready', resolve)
		})
	}
}
