/**
 * Basic spec for lib/cookies.js
 */

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

chai.should();
chai.use(sinonChai);

describe('normaliseExpressRequestCookies', () => {
	it('should add cookies to request object if in header', () => {

	});

	it('should create an empty cookie object if none in headers', () => {

	});
});

describe('setExpressCookies', () => {
	it('should set the s3o_username and s3o_token cookies', () => {

	});
});

describe('clearExpressCookies', () => {
	it('should clear cookies and send code 403', () => {

	});
});
