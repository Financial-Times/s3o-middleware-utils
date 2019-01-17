/**
 * Module to request public key from S3O service
 */

const Poller = require('ft-poller');
const S3O_PUBLIC_KEY_URL = 'https://s3o.ft.com/publickey';

/**
 * Begins polling the S3O public key service every 300000 ms
 * @param  {function} debug Debug logger
 * @return {function}       Returns a function that in turn returns either the public key as
 *                          as a string or a promise that resolves to the public key string.
 */
module.exports = function (debug) {
	let publicKey;

	const flagsPoller = new Poller({
		url: S3O_PUBLIC_KEY_URL,
		retry: 3,
		refreshInterval: 1000 * 60 * 5,
		parseData: function (data) {
			debug('event=S3O_PUBLIC_KEY_LOADED source=' + S3O_PUBLIC_KEY_URL);
			publicKey = data;
		}
	});

	const promise = flagsPoller.start({ initialRequest: true });
	flagsPoller.poller.unref();

	return function (opts) {
		if (opts && opts.promise) {
			return promise.then(function () { return publicKey; });
		}
		return publicKey;
	};
};
