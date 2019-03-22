/**
 * Basic spec for lib/publickey.js
 */

const nock = require('nock');
const lolex = require('lolex');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

chai.should();
chai.use(sinonChai);

const debugSpy = sinon.spy();
const startStub = sinon.stub();
const pollerStub = sinon.stub();

pollerStub.returns({ start: startStub });
pollerStub.yieldsTo('parseData', 'test-key');
startStub.returns(Promise.resolve());

const publicKey = proxyquire('../publickey', {
	'ft-poller': pollerStub,
});

describe('lib/publickey', () => {
	let poller;

	describe('poller', () => {

		it('returns a function', () => {
			poller = publicKey.poller(debugSpy);
			poller.should.be.a('function');
			pollerStub.should.have.been.calledOnce;
			startStub.should.have.been.calledOnce;
			debugSpy.should.have.been.calledOnce;
		});

		describe('returned function', () => {
			it('returns a string if opts.promise is falsy', () => {
				const key = poller({ promise: false });
				key.should.be.a('string');
				key.should.equal('test-key');
			});

			it('returns a promise if opts.promise is true', (done) => {
				const keyPromise = poller({ promise: true });
				keyPromise.should.be.a('promise');
				keyPromise.then(key => {
					key.should.be.a('string');
					key.should.equal('test-key');
					done();
				});
			});
		});
	});

	describe('get', () => {
			const publicKeyStub =
		'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAuh0hlN3WBqVzC2lurGxLfFlUYQCgR2UpV0k2i5czy9XUW0lhzT5e9/FOp6wPIOMoJpWHP8KwY/P5U0Z2qZUCKmVhf2M61mvfvnUFEEqNAc35wNH15GZmjGnf1n6yTNPrM2cdCUeRzk49h2Ej4LBamA6GWZdl+ReYzOVqWiTQWHjjHy+Q/UrLk77Ra/drC+jj3rDkJz4qNXs9MldjYgudPt15pbLvqRk8VSXY36TinfJeySQQQAgNwvq49/qD145I+3DYrzCrDMIs8bHKy7IGIa1XW2YiSxn/9SwnwYt2PjhI3TuID7AyBt633Tsl3hfli/goBA5z0tBpkUB9uxLiFgPdgNEUzxHCBPHD+C8pXi8XRQrn1uwpusrbjgOUZkRNhguVnyinTQPhZG0LbzaXDbjSDIwwIjSVWkBhgT6LDbHvIlu0U6czVyA1OahqHLcwvA70wR2vXmwlbVKIcvGj5wvk8v1BNxtv1MbiWHf0s6mJysd9Sy2b9gb5gpBjvlfUyw6BsIlDf9ysYXITiD4JaXJGdlmupQMxdA0pGp4C6ROmupgzEgF+H/ycyBWtIUsl4L/Ceq4Sj0XBZ/QqumW176VUQTL5fKklfKw2fv4n1JrUssOz/xmcsRA/7BGiIsiSv/l/Mwt5qE8e+1u0jd8uJKcKhmqPfXZTkK+jJR+d4fsCAwEAAQ==';
			const publicKeyTTLSeconds = 60;
			let publicKeyInterceptor;
			let publicKeyScope;
			let clock;

			const resetPublicKeyStub = (
				responseStatusCode = 200,
				responseBody = publicKeyStub,
				responseHeaders = {
					'Cache-control': `public,max-age=${publicKeyTTLSeconds},s-maxage=${publicKeyTTLSeconds}`,
				}
			) => {
				if (publicKeyInterceptor) {
					nock.removeInterceptor(publicKeyInterceptor);
				}
				publicKeyInterceptor = nock('https://s3o.ft.com')
					.persist()
					.get('/publickey');
				publicKeyScope = publicKeyInterceptor.reply(
					responseStatusCode,
					responseBody,
					responseHeaders
				);
			};


		beforeEach(() => {
			clock = lolex.install({
				toFake: ['Date'],
			});
			nock.disableNetConnect();
			nock.enableNetConnect('127.0.0.1');
			resetPublicKeyStub();
		});

		afterEach(() => {
			clock.uninstall();
			nock.enableNetConnect();
			nock.cleanAll();
		});

		it('fetches the s3o public key when making an authorisation request', async () => {
			const result = await publicKey.get();

			result.should.equal(publicKeyStub)
			publicKeyScope.isDone().should.equal(true);
		});

		it('uses the cached public key when the time between requests is under the public key Cache-Control ttl', async () => {
			const cache = new Map();
			const result = await publicKey.get({
				cache,
			});

			publicKeyScope.isDone().should.equal(true);

			clock.tick(1000 * publicKeyTTLSeconds - 1);
			resetPublicKeyStub();
			await publicKey.get({
				cache,
			});

			publicKeyScope.isDone().should.equal(false);
		});

		it('refetches the s3o public key when the time between requests is over the public key Cache-Control ttl', async () => {
			const cache = new Map();
			await publicKey.get({
				cache,
			});

			clock.tick(1000 * publicKeyTTLSeconds);
			resetPublicKeyStub();
			await publicKey.get({
				cache,
			});

			publicKeyScope.isDone().should.equal(true);
		});
	});
});
