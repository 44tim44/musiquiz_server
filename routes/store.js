var express = require('express');
var router = express.Router();

const initDB = require("../public/javascripts/database").initDB;
const getDB = require("../public/javascripts/database").getDB;
var con;

router.use(function(req,res,next) {
  if(res.app.get('user_id') == undefined){
    res.redirect("/");
    return;
  }
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
function setData(user_id, quiz_id,callback) {
  var sql = "INSERT INTO user_quiz (UserID, QuizID) VALUES ((SELECT idUser FROM user WHERE SpotifyID = ?), ?);" +
      "UPDATE user SET Coins = (Coins - (SELECT CostCoin FROM quiz where idquiz= ?)) WHERE SpotifyID = ?";
  con.query(sql, [user_id, quiz_id, quiz_id, user_id], function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
    callback(err, result);
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var access_token = res.app.get('access_token');
  var refresh_token = res.app.get('refresh_token');
  var user_id = res.app.get('user_id');
  res.app.set('quiz_id', 1);
  getData(user_id,function (err, sql_result) {
    var quiz = sql_result[0];
    var coins = sql_result[1];
    var owned = sql_result[2];
    res.render('store.html', { title: 'Musiquiz' , access_token, refresh_token, quiz: quiz, coins: coins, owned: owned});
  });
});

router.post('/', function (req, res) {
  var play = req.body.playThisQuiz;
  var buy = req.body.buyThisQuiz;
  if(play != undefined){
    //go to lobby with play as quiz-id
    res.app.set('quiz_id', play);
    res.redirect('lobby');
  }
  if(buy != undefined){
    //update database with user-id and buy as quiz-id
    var user_id = res.app.get('user_id');

    setData(user_id, buy, function (err, sql_result) {
      res.redirect('store');
    });
  }
  console.log(play + ", " + buy);
})
module.exports = router;
