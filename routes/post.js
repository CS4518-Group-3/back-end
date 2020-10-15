const router = require('express').Router()
const {Post, Point} = require('../models')
const Types = require('mongoose').Types

// Approximate conversion factors to meters from Miles and Kilometers:
const METERS_MI = 1609.344
const METERS_KM = 1000

// MIDDLEWARE HELPERS
// Ensures authentication
const auth = function(req, res, next){
	if(!req.session.user || !req.session.authenticated)
		res.status(403).json({error: 'User Authentication Required'})
	else {
		req.user_id = req.session.user._id
		next()
	}
}

// Ensures the necessary query parameters are provided
const validate_query = function(param_list){
	return function(req,res,next){
		const missing_params = param_list.filter(x => !(x in req.query))
		if(missing_params.length > 0)
			res.status(400).json({error: `Missing the following query parameters: [${missing_params}]`})
		else
			next()
	}
}

// Ensures the necessary body parameters are provided
const validate_body = function(param_list){
	return function(req,res,next){
		const missing_params = param_list.filter(x => !(x in req.body))
		if(missing_params.length > 0)
			res.status(400).json({error: `Missing the following body parameters: [${missing_params}]`})
		else
			next()
	}
}

// Converts radius from miles or kilometers into radians
const convert_radius = function(req, res, next){
	const unit = req.query.unit.toLowerCase()
	req.query.radius = parseFloat(req.query.radius)
	switch (unit){
	case 'mi':
		req.distance_multiplier = METERS_MI
		break
	case 'km':
		req.distance_multiplier = METERS_KM
		break
	default: {
		res.status(400).json({error: 'Unit must be in Miles (mi) or Kilometers (km)'})
		return
	}
	}
	req.query.radius *= req.distance_multiplier
	next()
}

// Retrieves post when specified by id in routes. Sends a 404 if no matching post was found.
router.param('id', function(req, res, next, id){
	Post.findById(id).then((result) => {
		if(result ===  null){
			res.status(404).json({error: 'Post not found.'})
			return
		}
		req.post = result
		next()
	}).catch(() => {res.status(500).json({error: `Unable to retrieve post with the following id: ${id}`})})
})

// General method to handle upvote/downvote requests
const vote_handler = function(on_state, vote_method){
	return function(req, res){
		const post = req.post
		const uid = req.user_id
		const status = post.vote_status(uid)
		if(on_state == status)
			post.unvote(Types.ObjectId(uid))
		else
			vote_method.call(post, uid)
		post.save().then((result) => {
			res.json({vote_status: result.vote_status(uid), score: result.score})
		}).catch((err) => {
			res.status(500).json({error: err})
		})
	}
}


// BEGINNING OF ROUTES
/**
 * @route POST /post
 * @group post
 * @summary Creates a new post from the user's current location and drawing bitmap.
 * @param {float} lat.required - Latitude coordinate for Post
 * @param {float} lon.required - Longitude coordinate for Post
 * @param {string} content.required - Raw bitmap data of drawing
 * @returns {Post.model} 201 - Post created successfully
 * @returns {Error.model} 400 - Missing required parameters
 * @returns {Error.model} 500 - Unable to create post (backend error)
 * @security cookieAuth
 */
router.post('/', auth, validate_body(['lat', 'lon', 'content']), function(req, res){
	const {lat, lon, content} = req.body
	const location = Point({coordinates: [parseFloat(lon), parseFloat(lat)]}) // Order MUST be [<x>, <y>]
	const post = Post({user_id: req.user_id, location: location, content: content})
	post.save().then((obj) => {
		const data = obj.as_view(req.user_id)
		res.status(201).json(data)
	}).catch((err) => {
		res.status(500).json({error: err})
	})
})

/**
 * @route GET /post/:id/upvote
 * @group post
 * @summary Upvotes as authenticated user. Acts as an unvote if user has already upvoted, and removes downvote if applicable.
 * @param {string} id.required - ID of post to upvote
 * @returns {Vote.model} 200 - The post score along with user's new vote_status for the post
 * @returns {Error.model} 403
 * @returns {Error.model} 404 - Post not found
 * @returns {Error.model} 500 - Error processing request
 * @security cookieAuth
 */
router.get('/:id/upvote', auth, vote_handler(1, Post.schema.methods.upvote))

/**
 * @route GET /post/:id/downvote
 * @group post
 * @summary Downvotes as authenticated user. Acts as an unvote if user has already downvoted, and removes upvote if applicable.
 * @param {string} id.required - ID of post to upvote
 * @returns {Vote.model} 200 - The post score along with user's new vote_status for the post
 * @returns {Error.model} 403
 * @returns {Error.model} 404 - Post not found
 * @returns {Error.model} 500 - Error processing request
 * @security cookieAuth
 */
router.get('/:id/downvote', auth, vote_handler(2, Post.schema.methods.downvote))

/**
 * @route GET /post/feed
 * @group post
 * @summary Paginates through a feed of posts around the specified coordinates
 * @param {float} lat.query.required - Current latitude cooridnate of user
 * @param {float} lon.query.required - Current longitude cooridnate of user
 * @param {number} radius.query.required - Distance radius to find posts within
 * @param {string} unit.query.required - Unit for distance radius option (enum: mi,km)
 * @param {string} sort_by.query - Determines whether to sort by popularity, distance, or just by date (enum: popular, proximity, date)
 * @param {integer} page.query - Current page of feed to request (defaults to 1)
 * @param {integer} limit.query - Number of posts to retrieve per page (defaults to 10)
 * @returns {Array.<Post.model>} 200 - Resulting page of feed
 * @returns {Error.model} 400 - Missing required parameters
 * @returns {Error.model} 500 - Unable to request feed (backend error)
 * @security cookieAuth
 */
router.get('/feed', auth, validate_query(['lat', 'lon', 'radius', 'unit']), convert_radius, 
	function(req, res) {
		let {lat, lon, radius, page, limit, sort_by} = req.query
		lat = parseFloat(lat)
		lon = parseFloat(lon)
		sort_by = sort_by || 'popular'
		let page_opts
		
		// If neither page nor limit are specified, respond with all results
		if(page === undefined && limit === undefined){
			page_opts = {pagination: false}
		}
		// Otherwise if either is not specified, use default values.
		else {
			page_opts = {page: parseInt(page) || 1, limit: parseInt(limit) || 10}
		}

		// $geoNear aggregation (this is where the magic happens)
		const geo_near = {$geoNear: {
			near: {
				type: 'Point',
				coordinates: [lon, lat]
			},
			distanceField: 'distance',
			distanceMultiplier: 1 / req.distance_multiplier,
			spherical: true,
			maxDistance: radius
		}}

		// $group agg to $round distances to the nearest mi (or km)
		const round_distance = {
			$addFields: {
				distance: {
					$round: ['$distance', 1]
				}
			}
		}

		// Three different sort options
		let sort
		switch(sort_by){
		case 'popular':
			sort = { 'score': 'desc', 'createdAt': 'desc' }
			break
		case 'proximity':
			sort = { 'distance': 'asc', 'createdAt': 'desc' }
			break
		case 'date':
		default:
			sort = {'createdAt': 'desc'}
			break
		}

		const aggregate = Post.aggregate([geo_near, round_distance])
		const options = Object.assign(page_opts, {sort: sort})

		// Perform aggregation with pagination and sort options. Return formatted JSON.
		Post.aggregatePaginate(aggregate, options).then((results) => {
			const data = results.docs.map((doc) => {
				return Post.schema.methods.as_view.call(Post.hydrate(doc), req.user_id, {distance: doc.distance, distance_unit: req.query.unit
				})})
			res.json(data)
		}).catch((err) => {res.status(500).json({error: err})})
	})


/**
 * @route GET /post/user
 * @group post
 * @summary Retrieves all posts created by the reqesting user (pagination optional)
 * @param {integer} page - Page number for pagination
 * @param {integer} limit - Number of entries sent per page
 * @returns {Array.<Post.model>} 200 - Resulting page of feed
 * @returns {Error.model} 500 - Unable to request feed (backend error)
 * @security cookieAuth
 */
router.get('/user', auth, function(req, res){
	let {page, limit} = req.query
	let page_opts
	// If neither page nor limit are specified, respond with all results
	if(page === undefined && limit === undefined){
		page_opts = {pagination: false}
	}
	// Otherwise if either is not specified, use default values.
	else {
		page_opts = {page: parseInt(page) || 1, limit: parseInt(limit) || 10}
	}

	const aggregate = Post.aggregate([{$match: {'user_id': Types.ObjectId(req.user_id)} }])
	const options = Object.assign(page_opts, {sort: {'updatedAt': 'desc'}})
	Post.aggregatePaginate(aggregate, options).then((results) => {
		const data = results.docs.map((doc) => {
			return Post.schema.methods.as_view.call(Post.hydrate(doc), req.user_id)
		})
		res.json(data)
	}).catch((err) => {res.status(500).json({error: err})})
})

/**
 * @route GET /post/:id
 * @group post
 * @summary Retrieves post by its ID. If Authenticated, vote related information will be shown.
 * @param {string} id.required - ID of post to request
 * @returns {Post.model} 200 - Post data retrieved
 * @returns {Error.model} 404 - Post not found
 */
router.get('/:id', function(req, res){
	const post = req.post
	if(req.session.authenticated)
		res.json(post.as_view(req.session.user._id))
	else
		res.json(post.as_view())
})

/**
 * @route DELETE /post/:id
 * @group post
 * @summary Deletes a post. A post may only be deleted by the user who created it.
 * @param {string} id.required - ID of post to delete
 * @returns 200 - Deletion completed successfully
 * @returns {Error.model} 404 - Post not found
 * @returns {Error.model} 403 - Not authorized to delete post
 * @returns {Error.model} 500 - Failed to process request
 * @security cookieAuth
 */
router.delete('/:id', function(req, res){
	const post = req.post
	if(post.user_id != req.user_id){
		res.status(403).send({error: 'You are unauthorized to delete this post'})
		return
	}
	Post.findByIdAndDelete(post._id).then(() => {
		res.status(200).send()
	}).catch((err) => {res.status(500).json({error: err})})
})


module.exports = router