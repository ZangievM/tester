var express = require('express');
var router = express.Router();
const model = require('../data/model')
const cachePath = require('../data/fileSystem').cachePath
const fs = require('fs')
const util = require('util')
let reader = util.promisify(fs.readFile)
const launcher = require('../data/launcher')

router.get('/', function (req, res, next) {
  let testRuns = model.getTestRuns()
  res.render('index', {
    testRuns: testRuns,
    path: cachePath
  });
});
router.get('/report/:id', function (req, res, next) {
  let id = req.params.id
  let path = cachePath+id
  //on Windows
  launcher.execute('start index.html',path)

  //TO-DO Add execute on linux and MacOs
  // launcher.execute('start index.html',path)

  // launcher.execute('start index.html',path)
  res.redirect('/')
  
});
router.get('/apk/:id/:type', function (req, res, next) {
  let id = req.params.id
  let type = req.params.type
  let test = model.getTest(id)
  let file = ''
  if (type == 'apk') file = test.apkPath
  else file = test.testApkPath
  res.download(file)
});
router.post('/', (req, res, next) => {
  let action = req.body.action
  if (action === 'update') {
    let testRuns = model.getTestRuns()
    res.render('index', {
      testRuns: testRuns,
      path: cachePath
    });
    return
  }
})

module.exports = router;