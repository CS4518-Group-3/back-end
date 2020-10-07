let mongoose = require('mongoose')

/**
 * @typedef User
 * @property {string} _id.required - ID for the user
 * @property {string} google_id.required - ID of user's corresponding Google Account
 * @property {string} email.required - Email Address (gmail) - eg:kotlin4lyfe@gmail.com
 * @property {string} name - Full name of user - eg:John Doe
 * @property {string} createdAt - Date created - eg:2020-10-06 15:25:58.542Z
 * @property {string} updatedAt - Date last updated - eg:2020-10-06 19:50:14.217Z
 */

let userSchema = mongoose.Schema({
	google_id: {
		type: String,
		unique: true
	},
	email: {
		type: String,
		unique: true
	}, 
	name: {
		type: String
	}
},
{
	timestamps: true
})


module.exports = mongoose.model('User', userSchema)