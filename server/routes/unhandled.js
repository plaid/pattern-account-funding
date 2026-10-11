/**
 * @file Defines the unhandled route handler.
 */

const express = require('express');
const Boom = require('@hapi/boom');

const router = express.Router();

/**
 * Throws a 404 not found error for all requests.
 */
router.all('/{*splat}', () => {
  throw Boom.boomify(new Error('not found'), { statusCode: 404 });
});

module.exports = router;
