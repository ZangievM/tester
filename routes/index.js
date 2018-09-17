var express = require('express');
var router = express.Router();
var path = require('path')
var fs = require('fs')
var formidable = require('formidable')
var launcher = require('../data/launcher')
/* GET home page. */
router.get('/', function(req, res, next) {
  launcher.getConnectedDevices()
  .then(result=>{
    res.render('index', { title: 'Express',devices:result });
  })
  
});
router.post('/', function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if(err) {
      console.log(err);
      return
      
    }
    let devices = [].concat(fields.devices)
    var filePath = files.file.path+'.apk';
    var testFilePath = files.testFile.path+'.apk';
    fs.renameSync(files.file.path, filePath)
    fs.renameSync(files.testFile.path, testFilePath)
    launcher.enqueue(devices,filePath,testFilePath)
    .then(result=>{
      res.json(result)
    })
    


  })
})
module.exports = router
