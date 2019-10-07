var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var access_token = res.app.get('access_token');
  var refresh_token = res.app.get('refresh_token');
  res.render('index.html', { title: 'Musiquiz' , access_token, refresh_token});
});

module.exports = router;
