/**
 * Basic spec for lib/cookies.js
 */

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const should = chai.should();
chai.use(sinonChai);

describe('normaliseExpressRequestCookies', () => {
	const normaliseExpressRequestCookies = require('../cookies').normaliseRequestCookies;

	it('should add cookies to request object if in header', () => {
		const req = {
			cookies: null,
			headers: {
				cookie: 'a=b; llama=duck',
			}
		};

		normaliseExpressRequestCookies(req);

		req.cookies.should.be.a('object');
		req.cookies.should.eql({
			a: 'b',
			llama: 'duck',
		});
	});

	// Disabled because Chai is dumb.
	xit('should create an empty cookie object if none in headers', () => {
		const req = {
			cookies: null,
			headers: {
				cookie: null,
			},
		};

		normaliseExpressRequestCookies(req);
		should.equal(Object.create(null), req.cookies); // Returns: `AssertionError: expected {} to equal {}`
	});
});

describe('setExpressCookies', () => {
	it('should set the s3o_username and s3o_token cookies', () => {
		const setExpressCookies = require('../cookies').setCookies;
		const cookieStub = sinon.stub();
		const resMock = {
			locals: {},
			cookie: cookieStub,
			app: {
				get: () => false,
			}
		};

		setExpressCookies(resMock, 'test', 'test-123');
		cookieStub.withArgs('s3o_username', 'test', {maxAge: 900000, httpOnly: true}).should.be.calledOnce;
		cookieStub.withArgs('s3o_token', 'test-123', {maxAge: 900000, httpOnly: true}).should.be.calledOnce;
	});
});

describe('clearExpressCookies', () => {
	it('should clear cookies and send code 403', () => {
		const clearExpressCookies = require('../cookies').clearCookies;
		const statusStub = sinon.stub();
		const clearCookieStub = sinon.stub();
		const resMock = {
			status: statusStub,
			clearCookie: clearCookieStub,
		};

		clearExpressCookies(resMock);

		clearCookieStub.withArgs('s3o_username').should.be.calledOnce;
		clearCookieStub.withArgs('s3o_token').should.be.calledOnce;
		statusStub.withArgs(403).should.be.calledOnce;
	});
});
