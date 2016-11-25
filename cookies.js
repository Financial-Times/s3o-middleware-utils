/**
 * Sundry utilities for cookies
 */

const cookieParser = require('cookie').parse;

const normaliseExpressRequestCookies = function (req) {
	if (req.cookies === undefined || req.cookies === null) {
		let cookies = req.headers.cookie;
		if (cookies) {
			req.cookies = cookieParser(cookies);
		} else {
			req.cookies = Object.create(null);
		}
	}
}

const setExpressCookies = function (res, username, token) {
  // Add username to res.locals, so apps can utilise it.
  res.locals.s3o_username = username;
  let cookieOptions = {
    maxAge: res.app.get('s3o-cookie-ttl') || 900000,
    httpOnly: true
  };
  res.cookie('s3o_username', username, cookieOptions);
  res.cookie('s3o_token', token, cookieOptions);
};

const clearExpressCookies = function (res) {
  res.clearCookie('s3o_username');
  res.clearCookie('s3o_token');
  res.status(403);
};

module.exports.normaliseRequestCookies = normaliseExpressRequestCookies;
module.exports.setCookies = setExpressCookies;
module.exports.clearCookies = clearExpressCookies;
