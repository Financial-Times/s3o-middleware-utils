/**
 * Module to request public key from S3O service
 */

const got = require('got');
const Poller = require('ft-poller');

const S3O_PUBLIC_KEY_URL = 'https://s3o.ft.com/publickey';

/**
 * Begins polling the S3O public key service every 300000 ms
 * @param  {function} debug Debug logger
 * @return {function}       Returns a function that in turn returns either the public key as
 *                          as a string or a promise that resolves to the public key string.
 */
const poller = (debug) => {
	let publickey;

	const flagsPoller = new Poller({
		url: S3O_PUBLIC_KEY_URL,
		retry: 3,
		refreshInterval: 1000 * 60 * 5,
		parseData: function (data) {
			debug('event=S3O_PUBLIC_KEY_LOADED source=' + S3O_PUBLIC_KEY_URL);
			publickey = data;
		}
	});

	const promise = flagsPoller.start({ initialRequest: true });
	if (flagsPoller.poller) {
		flagsPoller.poller.unref();
	}

	return function (opts) {
		if (opts && opts.promise) {
			return promise.then(function () { return publickey; });
		}
		return publickey;
	};
};


/**
 * Fetches the S3O public key
 * @async
 * @param {Object} [options] Options object
 * @param {string} [options.debug] Debug logger
 * @param {string} [options.cache] A Map to use as a cache, or any cache compatible with got (https://github.com/sindresorhus/got#cache-1)
 * @param {integer} [options.retry] The number of retries to attempt in the event of a failure
 * @return {Promise<String} The public key
 */
const get = ({debug = () => {}, cache, retry = 3} = {}) => got(S3O_PUBLIC_KEY_URL, {
	retry,
		// obey cache-control headers on the public key endpoint
	cache: cache,
}).then((response) => {
	debug('event=S3O_PUBLIC_KEY_LOADED source=' + S3O_PUBLIC_KEY_URL);
	return response.body;
}).catch(error => {
	debug('event=S3O_PUBLIC_KEY_FAILED_TO_LOAD source=' + S3O_PUBLIC_KEY_URL + ' error=' + error);
	throw error;
})

module.exports = {
	poller,
	get,
}
