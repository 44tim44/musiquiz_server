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

function getData(id,callback) {
  var sql = "SELECT * FROM quiz;" +
      "SELECT Coins FROM user WHERE SpotifyID = ?;" +
      "SELECT * FROM user_quiz WHERE UserID = (SELECT idUser FROM user WHERE SpotifyID = ?)"
  con.query(sql,[id, id], function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    callback(err, result);
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var access_token = res.app.get('access_token');
  var refresh_token = res.app.get('refresh_token');
  var user_id = res.app.get('user_id');
  getData(user_id,function (err, sql_result) {
    var quiz = sql_result[0];
    var coins = sql_result[1];
    var owned = sql_result[2];
    res.render('store.html', { title: 'Musiquiz' , access_token, refresh_token, quiz: quiz, coins: coins, owned: owned});
  });
});


module.exports = router;
