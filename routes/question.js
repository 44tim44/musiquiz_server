var express = require('express');
var router = express.Router();
var numbof_questions;
var user;
var glob_lobbypin;
var glob_quizId;

const getDB = require("../public/javascripts/database").getDB;
var con;

const getSocket = require("../public/javascripts/socketConnection").getSocket;
var socket;

router.use(function(req,res,next) {
  console.log("Retrieved DB.")
  con = getDB();
  socket = getSocket();
  next();
});

function getLobbyid() {

    var lobby_pin = "SELECT LobbyPin FROM lobby WHERE SpotifyID = ?"

    con.query(lobby_pin, user ,function (err ,result) {
        if (err) throw err;
        glob_lobbypin = result[0].LobbyPin;
        console.log("lobbypin: " + result[0].LobbyPin);
        //con.end();
        //callback(err, amount_quest);
    });

}
function getquizId() {
    var quiz_id = "SELECT CurrentQuiz FROM lobby WHERE SpotifyID = ?"

    con.query(quiz_id, user ,function (err ,result) {
        if (err) throw err;
        glob_quizId = result[0].CurrentQuiz;
        console.log("quizID: " + glob_quizId);
        //con.end();
        //callback(err, amount_quest);
    });

}

function getNumbofQuestion(callback){
    var numbof_quest = "SELECT quiz, count(*) as 'countquiz' FROM question WHERE quiz = ?"
    con.query(numbof_quest, 1 ,function (err ,result) {
        if (err) throw err;
        var amount_quest = 0;
        amount_quest = result[0].countquiz;
        console.log("numberofquest: " + result[0].countquiz);
        //con.end();
        callback(err, amount_quest);
    });

}
function getQuestionNumber(callback){

    var quest_numb = "SELECT currentquestion FROM lobby WHERE lobbypin = ?"
    var qurrent_quest = 0;
    con.query(quest_numb, glob_lobbypin ,function (err ,result) {
        if (err) throw err;
        qurrent_quest = result[0].currentquestion;
        console.log("currentquestion: " + result[0].currentquestion);
        //con.end();
        callback(err, qurrent_quest);
    });

}

function getQuestion(callback) {
  var id = 1;

  var sql = "SELECT * FROM question WHERE quiz = ?"
  var participant = "SELECT * FROM tempuser where lobbypin = ?"


  con.query(participant, glob_lobbypin ,function (err ,result) {
    if (err) throw err;
    console.log("Participants: " + result.length);
    //con.end();
  });

  con.query(sql, id ,function (err ,result) {
    if (err) throw err;
    console.log("Result: " + result);
    callback(err ,result);
    //con.end();
  });
}
function getZeroquest() {
    var questto_zero = "UPDATE lobby SET currentquestion = 0  WHERE LobbyPin = ?";

    con.query(questto_zero, glob_lobbypin ,function (err ,result) {
        if (err) throw err;
        console.log("Question number: " + result);
    });
}

function getHighscore(callback) {
    var result_list = "SELECT * FROM tempuser WHERE lobbypin = ? ORDER BY Score DESC "


    con.query(result_list, glob_lobbypin ,function (err ,result) {
        if (err) throw err;
        console.log("Result: " + result);
        callback(err ,result);
        //con.end();
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var access_token = res.app.get('access_token');
  var refresh_token = res.app.get('refresh_token');
  user = res.app.get('user_id');

    getLobbyid();
    getquizId();

    console.log(user);
    getNumbofQuestion(function (err, result){
        numbof_questions = result;


        getQuestionNumber(function (err, qNumber){

          if(numbof_questions > qNumber) {
              getQuestion(function (err, sql_result) {
                  var obj = sql_result[qNumber];
                  socket.to('12345').emit('NewQuestion', obj);
                  res.render('question.html', {
                      title: 'Musiquiz',
                      access_token,
                      refresh_token,
                      question: obj.Question,
                      answer1: obj.Answer1,
                      answer2: obj.Answer2,
                      answer3: obj.Answer3,
                      answer4: obj.Answer4,
                      spotify_uri: obj.SpotifyURI,
                      correctanswer: obj.CorrectAnswer,
                      pincode: '12345'
                  });
              });
          }
          else{
              //Sätt Databas-Lobby-Currentquiz till 0 igen

              getHighscore(function (err, result) {
                  getZeroquest();
                  var result_list = result;
                  res.render('result.html', {
                      title: 'Musiquiz',
                      access_token,
                      refresh_token,
                      Result: result
                  });
              });

            };
        });
    });
});

router.post('/', function(req, res) {
    var update_quest;
    update_quest = "UPDATE lobby SET currentquestion = currentquestion + 1  WHERE LobbyPin = ?";

    con.query(update_quest, glob_lobbypin ,function (err ,result) {
        if (err) throw err;
        console.log("Question number: " + result);
    });
  res.redirect('/question');
})





/**
 * wait_for_responses(amount = amount_of_players)
 * {
 *     redirect_to("/question?id=" + next_id)
 * }
 *
 * */


module.exports = router;
