var express = require('express');
var router = express.Router();
const model = require('../data/model')
const cachePath = require('../data/fileSystem').cachePath


/* GET users listing. */
router.get('/', function (req, res, next) {
  let testRuns = model.getTestRuns()
  res.render('index', {
    testRuns: testRuns,
    path: cachePath
  });
});

router.post('/', (req, res, next) => {
  let action = req.body.action
  if (action === 'download') {
    let id = req.body.id
    let type = req.body.type
    let test = model.getTest(id)
    if (type == 'apk') res.download(test.apkPath)
    else res.download(test.tesApkPath)
    return
  }

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