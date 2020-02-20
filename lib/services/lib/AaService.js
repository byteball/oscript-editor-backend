const { promisify } = require('util')
const headlessWallet = require('headless-obyte')
const { ValidationError, AgentAlreadyDeployedError, InternalError } = requireRoot('lib/errors')
const ValidationUtils = require('ocore/validation_utils')
const aaValidation = require('ocore/aa_validation')
const objectHash = require('ocore/object_hash')
const conf = require('ocore/conf')
const constants = require('ocore/constants')
const obyte = require('obyte')

class AaService {
	async validate (data) {
		const template = data[1]

		if ('messages' in template) {
			try {
				return await promisify(aaValidation.validateAADefinition)(data)
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

	async checkAgentAlreadyDeployed (data) {
		return new Promise((resolve, reject) => {
			const address = objectHash.getChash160(data)
			const client = new obyte.Client(conf.WS_PROTOCOL + conf.hub, { testnet: constants.bTestnet })

			client.api.getDefinition(address, function (err, result) {
				client.close()
				if (err) {
					reject(new InternalError(err))
				} else if (result) {
					reject(new AgentAlreadyDeployedError(`Agent already deployed with address ${address}`))
				} else {
					resolve(false)
				}
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
