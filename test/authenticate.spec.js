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
	const publickeyStub = sinon.stub();
	const validateStub = sinon.stub();
	const authenticate = proxyquire('../authenticate', {
		'./publickey': () => publickeyStub,
		'./validate': () => validateStub,
	}).authenticateToken;

	beforeEach(() => {
		publickeyStub.reset().returns(() => true);
		validateStub.reset();
	});

	it('should throw an error if public key unavailable', () => {
		try {
			publickeyStub.returns(undefined);
			authenticate('test', 'localhost', 'test-123');
		} catch(e) {
			authenticate.should.throw('Has not yet downloaded public key from S3O');
		}

		publickeyStub.should.have.been.calledTwice;
	});

	describe('normal execuation', () => {
		it('should return false on validator failure', () => {
			validateStub.returns(false);

			const result = authenticate('test', 'localhost', 'test-123');

			publickeyStub.should.have.been.calledOnce;
			result.should.equal(false);
		});

		it('should return true on validator success', () => {
			validateStub.returns(true);

			const result = authenticate('test', 'localhost', 'test-123');

			publickeyStub.should.have.been.calledOnce;
			result.should.equal(true);
		});
	});
});
