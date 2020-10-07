require('dotenv').config()
const express = require('express')
const body_parser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const cors = require('cors')


const MongoStore = require('connect-mongo')(session)
const mongoose_connection = require('./db')
const routes = require('./routes')

function launch() {
	const app = express()
	const port = process.env.PORT || 6567

	app.use(body_parser.urlencoded({ extended: true }))
	app.use(body_parser.json())
	app.use(cors())
	app.use(session({
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
		secret: process.env.SESSION_SECRET,
		saveUninitialized: false,
		resave: false,
		cookie: {
			maxAge: 1000*60*60*24*7 // Sessions are to expire after 1 week
		}
	})
	)
	
	// Map API endpoints
	app.use(routes)

	// Map API documentation
	const swagger = require('./swagger')
	app.use(swagger)

	app.listen(port, () =>
		console.log(`server listening on port ${port}!`)
	)
}

mongoose_connection(launch)