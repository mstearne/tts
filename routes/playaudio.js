var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('playaudio', { title: 'Playing',audiofile: req.query.id });
});

module.exports = router;
