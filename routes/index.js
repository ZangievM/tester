var express = require('express');
var router = express.Router();
const model = require('../data/model')
const cachePath = require('../data/fileSystem').cachePath
const fs = require('fs')


/* GET users listing. */
router.get('/', function (req, res, next) {
  let testRuns = model.getTestRuns()
  res.render('index', {
    testRuns: testRuns,
    path: cachePath
  });
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