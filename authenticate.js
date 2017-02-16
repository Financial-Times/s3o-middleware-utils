/**
 * Methods for authenticating S3O tokens
 */

const debug = require('debug')('middleware:auth:s3o');
const s3oPublicKey = require('./publickey')(debug);
const validate = require('./validate')(s3oPublicKey);

/**
 * Authenticate token and save/delete cookies as appropriate.
 *
 * @param  {string} username Google username
 * @param  {string} hostname Originating hostname of request
 * @param  {string} token    S3O token
 * @return {boolean}         Boolean indicating whether the request authenticates or not
 */
const authenticateToken = function (username, hostname, token) {
	const publicKey = s3oPublicKey();

	if (!publicKey) {
		throw new Error('Has not yet downloaded public key from S3O');
	}

	const key = username + '-' + hostname;
	const result = validate(key, token);

	if (result) {
		debug('S3O: Authentication successful: ' + username);
		return true;
	} else {
		debug('S3O: Authentication failed: ' + username);
		return false;
	}
};

module.exports.authenticateToken = authenticateToken;
module.exports.validate = validate;
module.exports.s3oPublicKeyPromise = s3oPublicKey({ promise: true });
