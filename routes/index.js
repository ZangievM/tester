var express = require('express');
var router = express.Router();
var path = require('path')
var fs = require('fs')
var formidable = require('formidable')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/', function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if(err) {
      console.log(err);
      return
      
    }
    
    var filePath = files.file.path;
    var testFilePath = files.testFile.path;
    // fs.rename(oldpath, newpath, function (err) {
    //   if (err) throw err;
    //   res.write('File uploaded and moved!');
    //   res.end();
    // })


  })
})
module.exports = router
