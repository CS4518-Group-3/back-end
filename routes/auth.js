const router = require('express').Router()
const {OAuth2Client} = require('google-auth-library')
const User = require('../models/user')

const CLIENT_ID = process.env.GOOGLE_OAUTH_ID
const oauth_client = new OAuth2Client(CLIENT_ID)

router.get('/check', function(req, res){
	if(req.session.authenticated) {
		const response = Object.assign({authenticated: true}, req.session.user)
		res.json(response)
	}
	else {
		res.json({authenticated: false})
	}
})

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
	if(user == null) {
		user = new User({google_id: ginfo.sub, email: ginfo.email, name: (ginfo.name || 'Unnamed User')})
		await user.save().catch((err) => {res.status(500).json({error: err}); return})
	}
	req.session.user = user
	req.session.authenticated = true
	res.json(user.toJSON())
})

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

router.get('/signout', function(req, res){
	req.session.destroy()
	res.status(200).send()
})

module.exports = router