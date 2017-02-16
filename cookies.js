/**
 * Sundry utilities for cookies.
 *
 * @TODO This should probably be moved to s3o-middleware because it's all specific to Express.
 */

const cookieParser = require('cookie').parse;

/**
 * Normalise cookies coming from Express
 *
 * @param  {object} req Express Request object
 * @return {void}
 */
const normaliseExpressRequestCookies = function (req) {
	if (req.cookies === undefined || req.cookies === null) {
		const cookies = req.headers.cookie;
		if (cookies) {
			req.cookies = cookieParser(cookies);
		} else {
			req.cookies = Object.create(null);
		}
	}
}

/**
 * Sets Express request cookies
 *
 * @param {object} res      Express result object
 * @param {string} username Google username
 * @param {string} token    S3O token
 * @return {void}
 */
const setExpressCookies = function (res, username, token) {
	// Add username to res.locals, so apps can utilise it.
	res.locals.s3o_username = username;
	const cookieOptions = {
		maxAge: res.app.get('s3o-cookie-ttl') || 900000,
		httpOnly: true
	};
	res.cookie('s3o_username', username, cookieOptions);
	res.cookie('s3o_token', token, cookieOptions);
};

/**
 * Clears the cookies and sends 403 status
 *
 * @param  {object} res Express result object
 * @return {void}
 */
const clearExpressCookies = function (res) {
	res.clearCookie('s3o_username');
	res.clearCookie('s3o_token');
	res.status(403);
};

module.exports.normaliseRequestCookies = normaliseExpressRequestCookies;
module.exports.setCookies = setExpressCookies;
module.exports.clearCookies = clearExpressCookies;
