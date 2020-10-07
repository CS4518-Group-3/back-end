const express = require('express')
const router = express.Router()
const auth = require('./auth')

/**
 * @typedef Error
 * @property {string} error - Error message - eg:Error message
 */

router.use('/auth', auth)

module.exports = router
