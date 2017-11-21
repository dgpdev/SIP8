var session = require('express-session');
// NPM INSTALL NODE-FS-EXTRA
var fs = require('fs-extra');

var DGPCRYPTO = require("../DGP_MODULES/DGP_CRYPTO.js");
var DGPCONFIG = require("../DGP_MODULES/DGP_CONFIG.js");

// SIP5
var storjlib = require('storj-lib');
var DIGIPULSE_HUB = DGPCONFIG.bridgeUrl;
var SESSION_KEY = DGPCONFIG.SessionKey;
var client;
var keypair;

// SIP6
const {
  Environment
} = require('storj');
var storj;

function isEmpty(obj) {
  return !Object.keys(obj).length > 0;
}

var multer = require('multer');

const tmpDir = '/temp';

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    var randomFolder = DGPCRYPTO.genRandomString(24);
    var tmpPath = DGPCONFIG.uploadDirPath + DGPCONFIG.uploadTempDir + '/' + randomFolder;
    fs.mkdirsSync(tmpPath)
    cb(null, tmpPath)
  },
  filename: function(req, file, callback) {
    console.log(file)
    callback(null, file.originalname)
  }
});

var upload = multer({
  storage: storage
});

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
        return cb({
          status: 'fail',
          message: err.message
        });
      }

      if (isEmpty(result)) {
        return cb({
          status: 'empty',
          message: 'No vaults found.'
        });
      }

      return cb({
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
      return cb({
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
      return cb({
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
  },
  storeFile: function(req, res, vaultID, cb) {
    var bucketId = req.body.driveID;
    var files = req.files;

    if (files) {
      files.forEach(function(file) {
        console.log('-----------------------------------------');
        console.log(file);
        console.log('-----------------------------------------');

        var uploadFilePath = file.path;
        var fileName = file.filename;

        storj = new Environment({
          bridgeUrl: DIGIPULSE_HUB,
          bridgeUser: req.session.email,
          bridgePass: DGPCRYPTO.decrypt(SESSION_KEY, req.session.password),
          encryptionKey: 'test1',
          logLevel: 4
        });

        storj.storeFile(bucketId, uploadFilePath, {
          filename: fileName,
          progressCallback: function(progress, uploadedBytes, totalBytes) {
            console.log('Progress: %d, uploadedBytes: %d, totalBytes: %d',
              progress, uploadedBytes, totalBytes);
          },
          finishedCallback: function(err, fileId) {
            if (err) {
              return res.send({
                status: 'fail',
                message: err.message
              });
            }
            // Remove file stored on system
            fs.removeSync(file.destination);
            return res.send({
              status: 'success',
              result: fileId
            });
          }
        });
      });
    }
  },
  resolveFile: function(req, res, vaultID, cb) {
    var randomFolder = DGPCRYPTO.genRandomString(24);
    var tmpPath = DGPCONFIG.uploadDirPath + DGPCONFIG.uploadTempDir + '/' + randomFolder;
    console.log(tmpPath);
    if (!fs.existsSync(tmpPath)) {
      fs.mkdirSync(tmpPath);
    }

    var bucketId = req.body.driveID;
    var fileId = req.body.fileID;
    var downloadFilePath = tmpPath + '/' + req.body.fileNAME;

    console.log('bucket: ' + bucketId);

    console.log('init download' + downloadFilePath);

    storj = new Environment({
      bridgeUrl: DIGIPULSE_HUB,
      bridgeUser: req.session.email,
      bridgePass: DGPCRYPTO.decrypt(SESSION_KEY, req.session.password),
      encryptionKey: 'test1',
      logLevel: 4
    });

    storj.resolveFile(bucketId, fileId, downloadFilePath, {
      progressCallback: function(progress, downloadedBytes, totalBytes) {
        console.log('Progress: %d, downloadedBytes: %d, totalBytes: %d',
          progress, downloadedBytes, totalBytes);
      },
      finishedCallback: function(err) {
        if (err) {
          return res.send({
            status: 'fail',
            message: err.message
          });
        }

        //res.download(downloadFilePath);
        //fsextra.removeSync(tmpPath);
        return res.send({
          status: 'success',
          message: 'download complete',
          tmp: randomFolder
        });

        //return res.send({ result: 'fileId' });
        //storj.destroy();
      }
    });
  },
  deleteFile: function(req, res, cb) {

    storj = new Environment({
      bridgeUrl: DIGIPULSE_HUB,
      bridgeUser: req.session.email,
      bridgePass: DGPCRYPTO.decrypt(SESSION_KEY, req.session.password),
      encryptionKey: 'test1',
      logLevel: 4
    });

    console.log(req.body.vaultID);
    console.log(req.body.fileID);

    storj.deleteFile(req.body.vaultID, req.body.fileID, function(err, result) {
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
    });
  }
}
