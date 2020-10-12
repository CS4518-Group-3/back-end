const mongoose = require('mongoose')

/**
 * @typedef User
 * @property {string} id.required - ID for the user - eg: 5f824707c871eb58cd61740a
 * @property {string} google_id.required - ID of corresponding Google Account
 * @property {string} email.required - Email Address (gmail) - eg:kotlin4lyfe@gmail.com
 * @property {string} name.required - Full name of user - eg:John Doe
 * @property {string} profile_url - URL to profile picture of corresponding Google Account
 * @property {string} created_at.required - Date created - eg:2020-10-06 15:25:58.542Z
 * @property {string} updated_at.required - Date last updated - eg:2020-10-06 19:50:14.217Z
 */

const userSchema = mongoose.Schema({
	google_id: {
		type: String,
		unique: true
	},
	email: {
		type: String,
		unique: true
	}, 
	name: {
		type: String,
		required: true
	}, 
	profile_url: {
		type: String
	},
},
{
	timestamps: true
})

userSchema.methods.as_view = function(){
	const data = Object.assign({id: this._id}, this.toJSON({virtuals: true})) 
	delete data._id
	delete data.__v
	data.created_at = data.createdAt
	data.updated_at = data.updatedAt
	delete data.createdAt
	delete data.updatedAt
	return data
}


module.exports = mongoose.model('User', userSchema)