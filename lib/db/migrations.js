function migrate (connection) {
	connection.serialize(function () {
		connection.run(`CREATE TABLE IF NOT EXISTS agent_texts (
			agent_text_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
			text TEXT NOT NULL,
			text_hash CHAR(32) NOT NULL UNIQUE,
			creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`)

		connection.run(`CREATE TABLE IF NOT EXISTS shared_agents (
			shared_agent_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
			shortcode CHAR(32) NOT NULL UNIQUE,
			label CHAR(1024) NOT NULL,
			agent_text_id INTEGER NOT NULL,
			creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (agent_text_id) REFERENCES agent_texts(agent_text_id)
		)`)

		connection.run(`CREATE INDEX IF NOT EXISTS agentTextByHash ON agent_texts(text_hash)`)
		connection.run(`CREATE INDEX IF NOT EXISTS sharedAgentByShortcode ON shared_agents(shortcode)`)
	})
}

module.exports = {
	migrate
}
