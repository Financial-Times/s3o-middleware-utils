let debug = require('debug')('middleware:auth:s3o');
let s3oPublicKey = require('./publickey')(debug);
let validate = require('./validate')(s3oPublicKey);

// Authenticate token and save/delete cookies as appropriate.
const authenticateToken = function (username, hostname, token) {
	let publicKey = s3oPublicKey();

	if (!publicKey) {
		throw new Error('Has not yet downloaded public key from S3O');
	}

	let key = username + '-' + hostname;
	let result = validate(key, token);

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
