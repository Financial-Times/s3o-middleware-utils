/**
 * Methods for authenticating S3O tokens
 */

const debug = require('debug')('middleware:auth:s3o');
const validateFactory = require('./validate');

/**
 * Returns a token authenticator
 *
 * @param  {function} getPublicKey an s3o public key getter
 * @param  {function} validate an s3o signature validator
 *
 * @returns {function(string, string, string): boolean} A token authenticator
 */
const authenticateToken = (getPublicKey, validate) =>
/**
 * Authenticate token and save/delete cookies as appropriate.
 *
 * @param  {string} username Google username
 * @param  {string} hostname Originating hostname of request
 * @param  {string} token    S3O token
 * @return {boolean}         Boolean indicating whether the request authenticates or not
 */
function (username, hostname, token) {
	const publicKey = getPublicKey();

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

module.exports = (getPublicKey) => {
	const validate = validateFactory(getPublicKey);
	return {
		authenticateToken: authenticateToken(getPublicKey, validate),
		validate,
	};
}
