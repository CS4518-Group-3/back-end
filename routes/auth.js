const router = require('express').Router()
const {OAuth2Client} = require('google-auth-library')
const User = require('../models/user')

const CLIENT_ID = process.env.GOOGLE_OAUTH_ID
const oauth_client = new OAuth2Client(CLIENT_ID)

/**
 * @typedef AuthenticationResponse
 * @property {boolean} authenticated - True if user is authenticated. False otherwise
 * @property {User.model} user - User instance (if authenticated)
 */

/**
 * @route GET /auth/check
 * @group auth - User authentication and accout management
 * @summary Check if user is currently authenticated. 
 * @tags auth
 * @returns {AuthenticationResponse.model} 200 - Includes user if authenticated
 */
router.get('/check', function(req, res){
	if(req.session.authenticated) {
		const response = Object.assign({authenticated: true}, {user: req.session.user})
		res.json(response)
	}
	else {
		res.json({authenticated: false})
	}
})

/**
 * @route GET /auth/callback
 * @group auth
 * @summary Validates a user with Google credentials. Creates a new account if no matching account exists
 * @param {string} id_token.query.required - Google OAuth2 idToken.
 * @returns {AuthenticationResponse.model} 200 - Successful login
 * @returns {AuthenticationResponse.model} 201 - New user account was created and authenticated
 * @returns {Error.model} 400 - id_token is missing, invalid, or expired
 * @returns {Error.model} 500 - Unable to verify with Google, or persist new user account
 */
router.get('/callback', async function(req, res){
	const {id_token} = req.query
	if (id_token == undefined) {
		res.status(400).json({error: 'OAuth id_token parameter required'})
		return
	}
	const ticket = await oauth_client.verifyIdToken({idToken: id_token, audience: CLIENT_ID})
		.catch((err) => {
			res.status(500).status({error: err})
			return
		})
	if(ticket === undefined){
		res.status(400).json({error: 'Invalid or expired id_token.'})
		return
	}

	const ginfo = ticket.getPayload()

	let user = await User.findOne({google_id: ginfo.sub})
	let new_user = false
	if(user == null) {
		new_user = true
		user = new User({google_id: ginfo.sub, email: ginfo.email, name: (ginfo.name || 'Unnamed User'), profile_url: ginfo.picture})
		await user.save().catch((err) => {res.status(500).json({error: err}); return})
	}
	req.session.user = user
	req.session.authenticated = true
	const result = Object.assign({authenticated: true}, {user: user.toJSON()})
	if(new_user)
		res.status(201).json(result)
	else
		res.json(result)
})


/**
 * @route DELETE /auth/account
 * @group auth
 * @summary Deletes the account of the attached user session
 * @returns 200 - Account deleted successfully
 * @returns {Error.model} 500 - Error deleting user
 * @returns {Error.model} 400 - Unable to find user attached to session
 * @security cookieAuth
 */
router.delete('/account', async function(req, res){
	const {user} = req.session
	if(user === undefined || user._id === undefined) {
		res.status(400).json({error: 'No user found in attached session.'})
		return
	}
	const deleted = await User.findByIdAndDelete(user._id).exec().catch((err) => {
		res.status(500).json({error: err})
		return
	})

	if(deleted === null){
		res.status(400).json({error: 'Unable to find user in database. Perhaps the account is already deleted?'})
	}
	req.session.destroy()
	res.status(200).send()
})

/**
 * @route GET /auth/signout
 * @group auth
 * @summary Signs out user
 * @returns 200 - Sign out successful
 * @security cookieAuth
 */
router.get('/signout', function(req, res){
	req.session.destroy()
	res.status(200).send()
})

module.exports = router