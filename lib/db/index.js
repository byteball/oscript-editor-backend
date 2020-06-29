const path = require('path')
const sqlite3 = require('sqlite3')
const desktopApp = require('ocore/desktop_app')
const migrations = require('./migrations')

let connection

async function start () {
	const appDataDir = desktopApp.getAppDataDir()
	const dbPath = path.join(appDataDir, 'oscript-backend.sqlite')
	const conn = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE)
	connection = conn
	await migrations.migrate(connection)
}

function getConnection () {
	return connection
}

module.exports = {
	start,
	getConnection
}
