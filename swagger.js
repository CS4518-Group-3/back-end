
const router = require('express').Router()
const swagger = require('express-swagger-generator')

const {version} = require('./package.json')

const options = {
	swaggerDefinition: {
		info: {
			title: 'ArtsyApp API Documentation', // Title (required)
			version: version, // Version (required)
			description: 'API Documentation for CS4518 Group 3 final project.',
			license: {
				name: 'MIT',
			},
			host: '',
			basePath: '/'
		},
		schemes: ['http', 'https'],
		securityDefinitions: {
			cookieAuth: {
				type: 'apiKey',
				in: 'cookie',
				name: 'connect.sid',
				description: 'Express session cookie',
			}
		}
	},
	
	files: ['./routes/**/*.js', './models/**/*.js'],
	basedir: process.cwd()
}

swagger(router)(options)

module.exports = router