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

function isEmpty(obj) {
  return !Object.keys(obj).length > 0;
}

module.exports = {
  listVault: function(req, res, cb) {

    storj = new Environment({
      bridgeUrl: DIGIPULSE_HUB,
      bridgeUser: req.session.email,
      bridgePass: DGPCRYPTO.decrypt(SESSION_KEY, req.session.password),
      encryptionKey: 'test1',
      logLevel: 4
    });

    storj.getBuckets(function(err, result) {
      if (err) {
        return cb ({
          status: 'fail',
          message: err.message
        });
      }

      if(isEmpty(result)) {
        return cb ({
          status: 'empty',
          message: 'No vaults found.'
        });
      }
      return cb ({
        status: 'success',
        result: result
      });
    });
  },
addVault: function(req, res, vaultName, cb) {
    storj = new Environment({
      bridgeUrl: DIGIPULSE_HUB,
      bridgeUser: req.session.email,
      bridgePass: DGPCRYPTO.decrypt(SESSION_KEY, req.session.password),
      encryptionKey: 'test1',
      logLevel: 4
    });

    storj.createBucket(vaultName, function(err, result) {
      if (err) {
        return cb({
          status: 'fail',
          message: err.message
        });
      }
      return cb ({
        status: 'success',
        result: result
      });
    });
  },
deleteVault: function(req, res, vaultName, cb) {
      storj = new Environment({
        bridgeUrl: DIGIPULSE_HUB,
        bridgeUser: req.session.email,
        bridgePass: DGPCRYPTO.decrypt(SESSION_KEY, req.session.password),
        encryptionKey: 'test1',
        logLevel: 4
      });

      storj.deleteBucket(vaultName, function(err, result) {
        if (err) {
          return cb({
            status: 'fail',
            message: err.message
          });
        }
        return cb ({
          status: 'success',
          result: result
        });
      });
    },
listFiles: function(req, res, vaultID, cb) {
      storj = new Environment({
        bridgeUrl: DIGIPULSE_HUB,
        bridgeUser: req.session.email,
        bridgePass: DGPCRYPTO.decrypt(SESSION_KEY, req.session.password),
        encryptionKey: 'test1',
        logLevel: 4
      });

      storj.listFiles(vaultID, function(err, result) {
        if (err) {
          return cb({
            status: 'fail',
            message: err.message
          });
        }
        return cb({
          status: 'success',
          result: result
        });
        //storj.destroy();
      });
    }

}
