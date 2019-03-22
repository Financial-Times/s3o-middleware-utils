/**
 * Basic spec for lib/validate.js
 */

const NodeRSA = require('node-rsa');
const crypto = require('crypto');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const validatorFactory = require('../validate');

chai.should();
chai.use(sinonChai);

// s3o uses rsa to generate key pairs
// https://github.com/Financial-Times/s3o/blob/992be3a122006210013da64aa2ceee65e03a479d/src/main/java/com/ft/s3o/util/KeyGenerator.java#L19
const generateRSAKeyPair = () => new NodeRSA().generateKeyPair(512);

const sign = (data, keyPair) => {
	const privatePem = keyPair.exportKey('pkcs8-private-pem');
	const s = crypto.createSign('sha1');
	s.update(data);
	s.end();
	return s.sign(privatePem);
}

const keyFactory = sinon.stub();

describe('lib/validate.js', () => {
	let publicKey
	let keyPair

	before(() => {
		keyPair = generateRSAKeyPair(4096)
		publicKey = keyPair.exportKey('pkcs8-public-der');
	})

	beforeEach(() => {
		keyFactory.reset();
		keyFactory.returns(publicKey)
	});

	it('returns a function', () => {
		const validator = validatorFactory(keyFactory);
		validator.should.be.a('function');
	});

	describe('validator function', () => {
		['', false, undefined, null].forEach((value) => {
			it(`returns false if publicKey is "${value}"`, () => {
				keyFactory.returns(value);

				const validator = validatorFactory(keyFactory);
				const result = validator('test-key', 'test-token');

				keyFactory.should.have.been.calledOnce;
				result.should.equal(false);
			});
		});

		it('returns false if the supplied key is empty', () => {
			const token = sign('', keyPair)

			const validator = validatorFactory(keyFactory);
			const result = validator('charlie.briggs', token);

			keyFactory.should.have.been.calledOnce;
			result.should.equal(false);
		});

		it('returns false if supplied key does not validate against public key', () => {
			const token = sign('charlie.briggs-lantern.ft.com', keyPair)

			const validator = validatorFactory(keyFactory);
			const result = validator('charlie.briggs', token);

			keyFactory.should.have.been.calledOnce;
			result.should.equal(false);
		});

		it('returns true if supplied key validates against the public key', () => {
			const token = sign('charlie.briggs-lantern.ft.com', keyPair)

			const validator = validatorFactory(keyFactory);
			const result = validator('charlie.briggs-lantern.ft.com', token);

			keyFactory.should.have.been.calledOnce;
			result.should.equal(true);
		});
	});
});
