/**
 * Basic spec for lib/authenticate.js
 */

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

chai.should();
chai.use(sinonChai);

describe('authenticateToken', () => {
	it('should throw an error if public key unavailable', () => {

	});

	it('should return false on validator failure', () => {

	});

	it('should return true on validator success', () => {

	});
});
