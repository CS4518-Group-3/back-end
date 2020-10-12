const mongoose = require('mongoose')

/**
 * @typedef Point
 * @property {enum} type.required - Type of GeoJSON location - eg: Point
 * @property {Array} coordinates.required - Longitude and Latitude of Location - eg: [-120.24, 39.21]
 */
const pointSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: ['Point'],
		required: true,
		default: 'Point'
	},
	coordinates: {
		type: [Number],
		required: true
	},
}, {_id: false})


module.exports = mongoose.model('Point', pointSchema)