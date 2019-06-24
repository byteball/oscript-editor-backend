const { promisify } = require('util')
const headlessWallet = require('headless-obyte')
const aaValidation = require('ocore/aa_validation.js')
const objectHash = require('ocore/object_hash.js')
const { ValidationError } = requireRoot('lib/errors')

class AaService {
	async validate (data) {
		try {
			return promisify(aaValidation.validateAADefinition)([
				'autonomous agent',
				data
			])
		} catch (err) {
			throw new ValidationError(err)
		}
	}

	async deploy (data) {
		const arrDefinition = [
			'autonomous agent',
			data
		]

		await this.validate(data)

		const aaAddress = objectHash.getChash160(arrDefinition)
		const payload = {
			address: aaAddress,
			definition: arrDefinition
		}
		const myAddress = await getWalletAddress()

		const composer = require('ocore/composer.js')
		const network = require('ocore/network.js')
		const headlessWallet = require('headless-obyte')
		return new Promise((resolve, reject) => {
			const callbacks = composer.getSavingCallbacks({
				ifNotEnoughFunds: reject,
				ifError: reject,
				ifOk: function (objJoint) {
					network.broadcastJoint(objJoint)
					resolve(objJoint)
				}
			})

			this.composeContentJoint(myAddress, 'definition', payload, headlessWallet.signer, callbacks)
		})
	}

	composeContentJoint (fromAddress, app, payload, signer, callbacks) {
		var composer = require('ocore/composer.js')
		var objMessage = {
			app: app,
			payload_location: 'inline',
			payload_hash: objectHash.getBase64Hash(payload),
			payload: payload
		}
		composer.composeJoint({
			paying_addresses: [fromAddress],
			outputs: [{ address: fromAddress, amount: 0 }],
			messages: [objMessage],
			signer: signer,
			callbacks: callbacks
		})
	}
}

async function getWalletAddress () {
	return new Promise((resolve, reject) => {
		headlessWallet.readFirstAddress(address => resolve(address))
	})
}

module.exports = AaService
