var express = require('express');
var router = express.Router();

const getDB = require("../public/javascripts/database").getDB;
var con;

router.use(function(req,res,next) {
  console.log("Retrieved DB.")
  con = getDB();
  next();
});

function getQuestion(callback) {
  var sql = "SELECT * FROM question"

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    callback(err, result);
    con.end();
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var access_token = res.app.get('access_token');
  var refresh_token = res.app.get('refresh_token');

  getQuestion(function (err, sql_result) {
    var obj = sql_result[0];
    res.render('question.html', { title: 'Musiquiz' , access_token, refresh_token, question: obj.Question, answer1: obj.Answer1, answer2: obj.Answer2, answer3: obj.Answer3, answer4: obj.Answer4, spotify_uri: obj.SpotifyURI});
  });
});

/**
 * wait_for_responses(amount = amount_of_players)
 * {
 *     redirect_to("/question?id=" + next_id)
 * }
 *
 * */


module.exports = router;
