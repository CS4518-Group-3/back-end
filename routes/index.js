const express = require('express')
const router = express.Router()
const auth = require('./auth')
const post = require('./post')

/**
 * @typedef Error
 * @property {string} error - Error message - eg:Error message
 */

router.use('/auth', auth)
router.use('/post', post)

module.exports = router
