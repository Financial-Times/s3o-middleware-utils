# Migration guide

## Migrating from v1 to v2

### Dropping node 6 support

This library uses `ft-poller` to offer polling of the s3o public key. The [ft-poller](https://github.com/Financial-Times/ft-polller) library used for this functionality introduced `async/await` support in version `3.0.0`. This means that node.js 6 is no longer supported without compilation.

### Removal of Express cookie utilities

Cookie utilities specific to express have been removed. These are expected to be re-introduced into `s3o-middleware` as they're implementation specific.

These have been replaced by constants specifying cookie names and a default TTL which should be consumed to make s3o tokens consistent across implenentations.

```diff
- const { normaliseRequestCookies, setCookies, clearCookies } = require('@financial-times/s3o-middleware-utils/cookies');
+ const { normaliseRequestCookies, setCookies, clearCookies } = require('./cookie-utils');
```

### API changes to authenticate

Authenticate is now a factory function which takes a function which returns an s3o public key. This is to prevent the immediate instantiation of a poller upon requiring `s3o-middleware-utils`.

```diff
const debug = require('debug')('middleware:auth:s3o');
- const { authenticateToken, validate, s3oPublicKeyPromise } = require('@financial-times/s3o-middleware-utils/authenticate');
+ const { authenticate, publickey } = require('@financial-times/s3o-middleware-utils');
+ const publickeyPoller = publickey.poller(debug);
+ const { authenticateToken, validate } = authenticate(publickeyPoller);

...

module.exports.validate = validate;
- module.exports.ready = s3oPublicKeyPromise.then(function () { return true; });
+ module.exports.ready = publickeyPoller({promise: true}).then(function () { return true; });
```
