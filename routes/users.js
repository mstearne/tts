var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('X 300 respond with a resource');
});

module.exports = router;
