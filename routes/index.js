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

module.exports = router;