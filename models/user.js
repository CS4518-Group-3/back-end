let mongoose = require('mongoose')

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