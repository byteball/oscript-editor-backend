const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')

const fs = require('fs')
const logger = require('morgan')
const desktopApp = require('ocore/desktop_app.js')
const appDataDir = desktopApp.getAppDataDir()
const logFilename = appDataDir + '/backend.txt'

const router = requireRoot('lib/routes')
const services = requireRoot('lib/services')

function createApp () {
	const app = express()

	app.startAsync = async function () {
		// eslint-disable-next-line no-console
		console.log('starting services')
		await services.startServices()
		setupExpress(app)
		setupServer(app)
	}

	app.stopAsync = async function () {
		// eslint-disable-next-line no-console
		console.log('stopping services')
	}

	return app
}

module.exports = createApp

function setupExpress (app) {
	// view engine setup
	app.set('views', path.join(__dirname, 'views'))
	app.set('view engine', 'jade')

	// eslint-disable-next-line no-console
	console.log('Backend output redirected to', logFilename)
	app.use(logger('common', {
		stream: fs.createWriteStream(logFilename)
	}))
	app.use(express.json())
	app.use(express.urlencoded({ extended: false }))
	app.use(cookieParser())
	app.use(express.static(path.join(__dirname, 'public')))

	app.use(function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*')
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
		next()
	})

	app.use('/api/v1/', router)

	// catch 404 and forward to error handler
	app.use(function (req, res, next) {
		next(createError(404))
	})

	// error handler
	app.use(function (err, req, res, next) {
		// set locals, only providing error in development
		res.locals.message = err.message
		res.locals.error = req.app.get('env') === 'development' ? err : {}

		// render the error page
		res.status(err.status || 500)
		res.render('error')
	})
}

function setupServer (app) {
	const http = require('http')
	const port = normalizePort(process.env.PORT || '3000')
	app.set('port', port)

	// eslint-disable-next-line no-console
	console.log('onListening', onListening)

	const server = http.createServer(app)
	server.listen(port)
	server.on('error', onError)
	server.on('listening', onListening)

	function normalizePort (val) {
		const port = parseInt(val, 10)

		if (isNaN(port)) {
		// named pipe
			return val
		}

		if (port >= 0) {
		// port number
			return port
		}

		return false
	}

	function onError (error) {
		if (error.syscall !== 'listen') {
			throw error
		}

		const bind = typeof port === 'string'
			? 'Pipe ' + port
			: 'Port ' + port

		// handle specific listen errors with friendly messages
		switch (error.code) {
		case 'EACCES':
			// eslint-disable-next-line no-console
			console.error(bind + ' requires elevated privileges')
			process.exit(1)
		case 'EADDRINUSE':
			// eslint-disable-next-line no-console
			console.error(bind + ' is already in use')
			process.exit(1)
		default:
			throw error
		}
	}

	function onListening () {
		const addr = server.address()
		// eslint-disable-next-line no-console
		console.log('Server started on', addr.address, addr.port)
	}
}
