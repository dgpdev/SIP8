var express = require('express');
var router = express.Router();

var DGPAUTH = require("../DGP_MODULES/DGP_AUTH.js");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({status: "Success", message:"Frontpage", data:"none"});
});


router.get('/login/:user/:pass', function(req, res, next) {
  var user = {email: req.params.user,password: req.params.pass};
  DGPAUTH.login(req,res, user, function(result){      //    console.log('response',result);
    return res.json(result);
  });
  // next() if you plan to continue code.
});




router.get('/logout', function(req, res, next) {
  res.json({status: "Success", message:"Logout", data:"none"});
});



module.exports = router;
