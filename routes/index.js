var express = require('express');
var fs = require('fs-extra');
var router = express.Router();

/********************************************************************************
 *                                  AUTH SECTION                                *
 *                                                                              *
 *                        @dev Uses the DGP_AUTH.js module                      *
 ********************************************************************************
 /* Info only, these calls need binding.
Nan::SetPrototypeMethod(constructor, "getInfo", GetInfo);


Nan::SetPrototypeMethod(constructor, "storeFile", StoreFile);
Nan::SetPrototypeMethod(constructor, "storeFileCancel", StoreFileCancel);
Nan::SetPrototypeMethod(constructor, "resolveFile", ResolveFile);
Nan::SetPrototypeMethod(constructor, "resolveFileCancel", ResolveFileCancel);
Nan::SetPrototypeMethod(constructor, "deleteFile", DeleteFile);
Nan::SetPrototypeMethod(constructor, "destroy", DestroyEnvironment);
*/


var DGPAUTH = require("../DGP_MODULES/DGP_AUTH.js");
var DGPCONFIG = require("../DGP_MODULES/DGP_CONFIG.js");
var DGPCRYPTO = require("../DGP_MODULES/DGP_CRYPTO.js");

var multer = require('multer');

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






router.get('/login/:user/:pass', function(req, res, next) {
  var user = {email: req.params.user,password: req.params.pass};
  DGPAUTH.login(req,res, user, function(result){
    return res.json(result);
  });
  // next() if you plan to continue code.
});

router.get('/logout', function(req, res, next) {
  DGPAUTH.logout(req,res, function(result){
    return res.json(result);
  });
});

/********************************************************************************
 *                                  FILE SECTION                                *
 *                                                                              *
 *                        @dev Uses the DGP_FILE.js module                      *
 *******************************************************************************/

var DGPFILE = require("../DGP_MODULES/DGP_FILE.js");

 router.get('/vault', function(req, res, next) {
   DGPFILE.listVault(req,res, function(result){
     return res.json(result);
   });
 });

 router.post('/vault/create', function(req, res, next) {
   DGPFILE.addVault(req,res, req.body.vaultName, function(result){
     return res.json(result);
   });
 });

 router.post('/vault/delete/', function(req, res, next) {
   DGPFILE.deleteVault(req,res, req.body.vaultID, function(result){
     return res.json(result);
   });
 });

 router.post('/vault/list', function(req, res, next) {
   DGPFILE.listFiles(req,res, req.body.vaultID, function(result){
     return res.json(result);
   });
 });

//  @Todo
 router.get('/vault/:vaultID/delete/:fileID', function(req, res, next) {
   DGPAUTH.logout(req,res, function(result){
     return res.json(result);
   });
 });

 router.post('/vault/upload', upload.any(), function(req, res, next) {
   DGPFILE.storeFile(req,res, req.body.vaultID, function(result){
     return res.json(result);
   });
 });

 router.post('/vault/download/file', function(req, res, next) {
   console.log("requested: " + req.body.driveID);
   DGPFILE.resolveFile(req,res, req.body.vaultID, function(result){
     return res.json(result);
   });
 });


 /**
  * @dev global method to check if a user is logged in before accessing the route
  */
 var auth = function(req, res, next) {
   DGPAUTH.authed(req,res, function(result){
     if(result.auth == true) return next();
     return res.render('login');
   });
 };

 /* GET home page. */
 router.get('/', auth, function(req, res, next) {
   return res.render('index', {title: 'test'});
   res.json({status: "Success", message:"Frontpage", data:"none"});
 });

module.exports = router;
