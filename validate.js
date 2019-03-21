/**
 * Module for verifying public keys
 */
const crypto = require('crypto');
const NodeRSA = require('node-rsa');

/**
 * Factory function for creating token validators
 *
 * @param  {string} s3oPublicKey S3O public key from public key service
 * @return {function}            Returns validator function
 */
module.exports = function (s3oPublicKey) {
	return function (key, signedToken) {
		const publicKey = s3oPublicKey();
		if (!publicKey) {
			return false;
		}

		// Convert the publicKey from DER format to PEM format
		// See: https://www.npmjs.com/package/node-rsa
		const buffer = new Buffer(publicKey, 'base64');
		const derKey = new NodeRSA(buffer, 'pkcs8-public-der');
		const publicPem = derKey.exportKey('pkcs8-public-pem');

		// See: https://nodejs.org/api/crypto.html
		const verifier = crypto.createVerify('sha1');
		verifier.update(key);

		return verifier.verify(publicPem, signedToken, 'base64');
	};
};
