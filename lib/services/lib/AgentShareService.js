const { isString } = require('lodash')
const { customAlphabet } = require('nanoid')
const chash = require('ocore/chash')
const { SharedAgentNotFoundError } = requireRoot('lib/errors')
const db = requireRoot('lib/db')

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 32)

class AgentShareService {
	create ({ text, label }) {
		return new Promise(async (resolve, reject) => {
			if (!isString(text) && !isString(label)) {
				reject(new Error('Bad agent share format'))
			}

			const hash = chash.getChash160(text)
			try {
				const agentTextId = await this.getAgentTextIdByHashOrCreate(hash, text)
				const shortcode = await this.getShortcodeByAgentTextIdByLabel(agentTextId, label)
				if (shortcode) {
					resolve(shortcode)
				} else {
					resolve(await this.insertSharedAgent(agentTextId, label))
				}
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log('Error create agent for hash', hash, err.message || err)
				reject(new Error('Error saving agent'))
			}
		})
	}

	get (shortcode) {
		const conn = db.getConnection()

		return new Promise((resolve, reject) => {
			conn.get(`SELECT label, text FROM shared_agents INNER JOIN agent_texts ON shared_agents.agent_text_id = agent_texts.agent_text_id WHERE shortcode=(?)`, [shortcode], (err, row) => {
				if (err) {
					// eslint-disable-next-line no-console
					console.log('Error retrieving agent for shortcode', shortcode, err.message || err)
					reject(new Error('Error retrieving agent'))
				} else if (!row) {
					reject(new SharedAgentNotFoundError('Not found shared agent for shortcode', shortcode))
				} else {
					resolve({ text: row.text, label: row.label })
				}
			})
		})
	}

	getAgentTextIdByHashOrCreate (hash, text) {
		return new Promise((resolve, reject) => {
			const conn = db.getConnection()

			conn.serialize(() => {
				conn.get(`SELECT agent_text_id FROM agent_texts WHERE text_hash = ?`, [hash], (err, row) => {
					if (err) {
						reject(err.message || err)
					} else if (!row) {
						conn.run(`INSERT INTO agent_texts (text, text_hash) VALUES (?, ?)`, [text, hash], function (err) {
							if (err) {
								reject(err.message || err)
							} else {
								resolve(this.lastID)
							}
						})
					} else {
						resolve(row.agent_text_id)
					}
				})
			})
		})
	}

	getShortcodeByAgentTextIdByLabel (agentTextId, label) {
		return new Promise((resolve, reject) => {
			const conn = db.getConnection()

			conn.get(`SELECT shortcode FROM shared_agents WHERE agent_text_id = ? AND label = ?`, [agentTextId, label], (err, row) => {
				if (err) {
					reject(err.message || err)
				} else if (!row) {
					resolve(null)
				} else {
					resolve(row.shortcode)
				}
			})
		})
	}

	insertSharedAgent (agentTextId, label) {
		return new Promise((resolve, reject) => {
			const conn = db.getConnection()

			const shortcode = nanoid()
			conn.run(`INSERT INTO shared_agents (agent_text_id, label, shortcode) VALUES	(?, ?, ?)`, [agentTextId, label, shortcode], (err) => {
				if (err && err.message && err.message.indexOf('UNIQUE constraint failed: shared_agents.shortcode') !== -1) {
					this.insertSharedAgent()
				} else if (err) {
					reject(err.message || err)
				} else {
					resolve(shortcode)
				}
			})
		})
	}
}
module.exports = AgentShareService
