const mongoose = require('mongoose')
var aggregate_paginate = require('mongoose-aggregate-paginate-v2')
const voting = require('mongoose-voting')
const Point = require('./geo')

/**
 * @typedef Vote
 * @summary a Vote response including the net "score" of a post, as well as the vote status of the requesting user.
 * @property {enum} vote_status.required - The vote status for the requesting user on corresponding post (unvoted/upvoted/downvoted) - eg: 0,1,2
 * @property {integer} score.required - The current net between upvotes and downvotes on corresponding post
 */

/**
 * @typedef Post
 * @summary A drawing post tied to a geographical location. Optional fields are provided on authenticated API endpoints (like /post/feed).
 * @property {string} id.required - ID of the post - eg: 5d7d52e543be22485d393712
 * @property {boolean} owned - True if post belongs to the requesting user
 * @property {float} lat.required - Latitude coordinate where post was created - eg: -71.8081
 * @property {float} lon.required - Longitude coordinate where post was created - eg: 42.2743
 * @property {string} content.required - Raw image data of drawing (base64)
 * @property {integer} score.required - Net score of upvotes and downvotes
 * @property {enum} vote_status - Vote status for user making call (unvoted/upvoted/downvoted) - eg: 0,1,2
 * @property {float} distance - Distance to user (only provided if querying from feed) - eg: 41.2
 * @property {float} distance_unit - Unit for the distance field (only provided if querying from feed) - eg: mi
 * @property {string} created_at - Date created - eg:2020-10-06 15:25:58.542Z
 * @property {string} updated_at - Date last updated - eg:2020-10-06 19:50:14.217Z
 */


const postSchema = mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	location: {
		type: Point.schema,
		required: true
	},
	content: {
		type: Buffer,
		required: true,
	},
	score: {
		type: Number,
		required: true,
		default: 0
	}
},
{
	timestamps: true
})
postSchema.index({ location: '2dsphere' })
postSchema.plugin(aggregate_paginate)
postSchema.plugin(voting, { ref: 'User'})
postSchema.pre('save', function(){
	this.score = this.vote.positive.length - this.vote.negative.length
})
postSchema.pre('update', function(){
	this.score = this.vote.positive.length - this.vote.negative.length
})

postSchema.methods.vote_status = function(user_id){
	if(this.upvoted(user_id))
		return 1
	if(this.downvoted(user_id))
		return 2
	return 0
}

postSchema.methods.belongs_to = function(user_id){
	return (user_id == this.user_id)
}

postSchema.methods.as_view = function(user_id=null, agg_fields = {}){
	const data = Object.assign({id: this._id}, this.toJSON({virtuals: true}))
	delete data._id
	delete data.vote
	delete data.user_id
	delete data.__v
	delete data.distance
	if(user_id !== null){
		data.owned = this.belongs_to(user_id)
		data.vote_status = this.vote_status(user_id)
	}
	Object.assign(data, agg_fields)
	data.content = this.content.toString('base64')
	data.lon = data.location.coordinates[0]
	data.lat = data.location.coordinates[1]
	delete data.location
	data.created_at = data.createdAt
	data.updated_at = data.updatedAt
	delete data.createdAt
	delete data.updatedAt
	return data
}

module.exports = mongoose.model('Post', postSchema)