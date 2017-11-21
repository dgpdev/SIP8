var session = require('express-session');
var DGPCRYPTO = require("../DGP_MODULES/DGP_CRYPTO.js");
var DGPCONFIG = require("../DGP_MODULES/DGP_CONFIG.js");

// SIP5
var storjlib = require('storj-lib');
var DIGIPULSE_HUB = DGPCONFIG.bridgeUrl;
var SESSION_KEY = DGPCONFIG.SessionKey;
var client;
var keypair;

// SIP6
const {Environment} = require('storj');
var storj;

/**
 * Private
**/

function storeSessionKey(req, key, user) {
  req.session.authed = true;
  req.session.keypair = key;
  req.session.email = user.email;
  req.session.password = DGPCRYPTO.encrypt(SESSION_KEY, user.password);
}

function storeSessionPassphrase(req, key, user) {
  req.session.passphrase = DGPCRYPTO.encrypt(SESSION_KEY, user.password);
}

/**
 * Public
**/

module.exports = {
  login: function(req, res, userObject, cb) {
    var user = {email: userObject.email ,password: userObject.password};
    console.log(user);
    var client = storjlib.BridgeClient(DIGIPULSE_HUB, {basicAuth: user});
    var keypair = storjlib.KeyPair();

    client.addPublicKey(keypair.getPublicKey(), function(err) {

      if (err) {
        return cb({
          status: 'fail',
          message: err.message
        });
      }

      storeSessionKey(req, keypair.getPrivateKey(), user);

      storj = new Environment({
        bridgeUrl: DIGIPULSE_HUB,
        bridgeUser: req.session.email,
        bridgePass: DGPCRYPTO.decrypt(SESSION_KEY, req.session.password),
        encryptionKey: 'test',
        logLevel: 4
      });

      storj.getBuckets(function(err, result) {
        if (err) {
          req.session.destroy();
          return cb({
            status: 'fail',
            message: 'Invalid password'
          });
        }

        return cb({
          status: 'success',
          message: 'Login success'
        });
      });
    });
  },
  logout: function(req, res, cb) {
    req.session.destroy(function(err) {
      return cb({
        status: 'success',
        message: 'Logged out'
      });
    });
  }
}
