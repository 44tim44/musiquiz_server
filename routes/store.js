var express = require('express');
var router = express.Router();

const initDB = require("../public/javascripts/database").initDB;
const getDB = require("../public/javascripts/database").getDB;
var con;

router.use(function(req,res,next) {
  console.log("Retrieved DB.")
  con = getDB();
  next();
});

function getQuiz(callback) {
  var sql = "SELECT * FROM quiz"
  con.query(sql, function (err, result) {
    if (err) throw err;
    //numRows = result.length;
    console.log("Result: " + result);
    callback(err, result, result.length);
    con.end();
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var access_token = res.app.get('access_token');
  var refresh_token = res.app.get('refresh_token');
  getQuiz(function (err, sql_result,numRows) {
    var obj = sql_result;
    /*for(i = 0; i < numRows; i++){
      obj = sql_result[i];
    }*/

    res.render('store.html', { title: 'Musiquiz' , access_token, refresh_token, quiz: obj, spotify_uri: obj.SpotifyURI});
  });
  //res.render('store.html', { title: 'Musiquiz' , access_token, refresh_token});
});


module.exports = router;
