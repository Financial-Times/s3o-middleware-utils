/**
 * Module for verifying public keys
 */

const crypto = require('crypto');
const NodeRSA = require('node-rsa');

/**
 * Factory function for creating cryptographic signature validators
 *
 * @param  {string} getS3oPublicKey function which retrieves S3O public key from public key service
 * @return {function}            Returns validator function
 */
module.exports = function (getS3oPublicKey) {
	return function (object, signature) {
		const publicKey = getS3oPublicKey();
		if (!publicKey) {
			return false;
		}

		// Convert the publicKey from DER format to PEM format
		// See: https://www.npmjs.com/package/node-rsa
		const buffer = Buffer.from(publicKey, 'base64');
		const publicDer = new NodeRSA(buffer, 'pkcs8-public-der');
		const publicPem = publicDer.exportKey('pkcs8-public-pem');

		// See: https://nodejs.org/api/crypto.html
		const verifier = crypto.createVerify('sha1');
		verifier.update(object);

		return verifier.verify(publicPem, signature, 'base64');
	};
};
