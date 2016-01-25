var express = require('express');
var multer 			= require('multer');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var uploading = multer({
  dest: __dirname + '/public/media/',
  limits: {fileSize: 1000000, files:1},
})

router.post('/upload', uploading.any(), function (req, res, next) 
{
	console.log(req.body);
});


module.exports = router;
