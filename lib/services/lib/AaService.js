const { promisify } = require('util')
const headlessWallet = require('headless-obyte')
const { ValidationError, AgentAlreadyDeployedError } = requireRoot('lib/errors')
const ValidationUtils = require('ocore/validation_utils')
const aaValidation = require('ocore/aa_validation')
const objectHash = require('ocore/object_hash')

class AaService {
	async validate (data) {
		const template = data[1]

		if ('messages' in template) {
			try {
				await promisify(aaValidation.validateAADefinition)(data)
			} catch (err) {
				throw new ValidationError(err)
			}
		} else {
			validateParameterizedAA(template)
		}
	}

	async deploy (data) {
		await this.validate(data)

		const aaAddress = objectHash.getChash160(data)
		await this.checkAgentAlreadyDeployed(aaAddress)

		const payload = {
			address: aaAddress,
			definition: data
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

	async checkAgentAlreadyDeployed (address) {
		return new Promise((resolve, reject) => {
			const db = require('ocore/db')
			const storage = require('ocore/storage')
			const units = Object.keys(storage.assocUnstableMessages)
			for (const unit of units) {
				const messages = storage.assocUnstableMessages[unit]
				for (const message of messages) {
					if (message.app === 'definition' && message.payload.address === address) {
						return reject(new AgentAlreadyDeployedError(`Agent is waiting for stabilization with address ${address}`))
					}
				}
			}
			storage.readAADefinition(db, address, (arrDefinition) => {
				if (arrDefinition) {
					return reject(new AgentAlreadyDeployedError(`Agent already deployed with address ${address}`))
				}
				return resolve(false)
			})
		})
	}

	composeContentJoint (fromAddress, app, payload, signer, callbacks) {
		const composer = require('ocore/composer.js')

		const objMessage = {
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

function validateParameterizedAA (template) {
	if (ValidationUtils.hasFieldsExcept(template, ['base_aa', 'params'])) {
		throw new ValidationError('foreign fields in parameterized AA definition')
	}
	if (!ValidationUtils.isNonemptyObject(template.params)) {
		throw new ValidationError('no params in parameterized AA')
	}
	if (!ValidationUtils.isValidAddress(template.base_aa)) {
		throw new ValidationError('base_aa is not a valid address')
	}
}

module.exports = AaService
