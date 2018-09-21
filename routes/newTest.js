var express = require('express');
var router = express.Router();
var path = require('path')
var fs = require('fs')
var formidable = require('formidable')
var launcher = require('../data/launcher')
var fileSystem = require('../data/fileSystem')
var model = require('../data/model')
/* GET home page. */
router.get('/', function(req, res, next) {
  launcher.getConnectedDevices()
  .then(result=>{
    res.render('newTest', { title: 'Express',devices:result });
  })
  
});
router.post('/', function(req, res, next) {
  let x = req.body.devices
  var form = new formidable.IncomingForm({ 
    uploadDir: fileSystem.cachePath,
    keepExtensions: true
  });
  let devices = []
  form.on('field', function(name, value) {
    devices.push(value)
    
  });
  form.parse(req, function (err, fields, files) {
    if(err) {
      console.log(err);
      return
      
    }
    var file = files.file
    var testFile = files.testFile
    model.createTestRuns(devices,file.path,testFile.path)
    .then(result=>{
      res.json(result)
    })
  })
})
module.exports = router
