var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('places', { title: 'Places Express' });
});
router.get('/otherplace', function(req, res, next) {
    res.send('X other place respond with a resource');
});


module.exports = router;
