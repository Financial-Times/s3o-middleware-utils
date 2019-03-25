/**
 * Spec for authenticate.js
 */

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

chai.should();
chai.use(sinonChai);

describe('authenticateToken', () => {
	const publickeyPollerStub = sinon.stub();
	const validateStub = sinon.stub();
	const authenticateFactory = proxyquire('../authenticate', {
		'./validate': () => validateStub,
	});
	const getAuthenticateToken = () => authenticateFactory(publickeyPollerStub).authenticateToken;

	beforeEach(() => {
		publickeyPollerStub.reset();
		publickeyPollerStub.returns(() => true)
		validateStub.reset();
	});

	it('should throw an error if public key unavailable', () => {
		let authenticateToken;
		try {
			publickeyPollerStub.returns(undefined);
			authenticateToken = getAuthenticateToken();
			authenticateToken('test', 'localhost', 'test-123');
		} catch(e) {
			authenticateToken.should.throw('Has not yet downloaded public key from S3O');
		}

		publickeyPollerStub.should.have.been.calledTwice;
	});

	describe('normal execution', () => {
		it('should return false on validator failure', () => {
			validateStub.returns(false);
			const authenticateToken = getAuthenticateToken();

			const result = authenticateToken('test', 'localhost', 'test-123');

			publickeyPollerStub.should.have.been.calledOnce;
			result.should.equal(false);
		});

		it('should return true on validator success', () => {
			validateStub.returns(true);
			const authenticateToken = getAuthenticateToken();

			const result = authenticateToken('test', 'localhost', 'test-123');

			publickeyPollerStub.should.have.been.calledOnce;
			result.should.equal(true);
		});
	});
});
