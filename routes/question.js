var express = require('express');
var router = express.Router();
var numbof_questions;

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

function getNumbofQuestion(callback){
    var numbof_quest = "SELECT quiz, count(*) as 'countquiz' FROM question WHERE quiz = 1"
    var amount_quest = 0;
    con.query(numbof_quest ,function (err ,result) {
        if (err) throw err;
        amount_quest = result[0].countquiz;
        console.log("numberofquest: " + result[0].countquiz);
        //con.end();
        callback(err, amount_quest);
    });

}
function getQuestionNumber(callback){
    var pin_lobby = 12345;

    var quest_numb = "SELECT currentquestion FROM lobby WHERE lobbypin = ?"
    var qurrent_quest = 0;
    con.query(quest_numb, pin_lobby ,function (err ,result) {
        if (err) throw err;
        qurrent_quest = result[0].currentquestion;
        console.log("currentquestion: " + result[0].currentquestion);
        //con.end();
        callback(err, qurrent_quest);
    });

}

function getQuestion(callback) {
  var id = 1;
  var pin_lobby = 12345;

  var sql = "SELECT * FROM question WHERE quiz = ?"
  var participant = "SELECT * FROM tempuser where lobbypin = 12345"


  con.query(participant ,function (err ,result) {
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

    con.query(questto_zero, 12345 ,function (err ,result) {
        if (err) throw err;
        console.log("Question number: " + result);
    });
}

function getHighscore(callback) {
    var id = 1;
    var pin_lobby = 12345;

    var result_list = "SELECT * FROM tempuser WHERE lobbypin = ? ORDER BY Score DESC "


    con.query(result_list, pin_lobby ,function (err ,result) {
        if (err) throw err;
        console.log("Result: " + result);
        callback(err ,result);
        //con.end();
    });
}


function dbLoop() {
    var pin_lobby = 12345;
    var interval = setInterval(function(){

        var sql = "SELECT AnswersReceived FROM lobby WHERE LobbyPin = ? ; SELECT * FROM tempuser WHERE LobbyPin = ?";
        con.query(sql, [pin_lobby, pin_lobby], function (err, result) {
            if (err) throw err;
            if (result[0][0].AnswersReceived >= result[1].length /*&& song.time >= song.duration */) {

                var sql2 = "UPDATE lobby SET AnswersReceived = 0 WHERE LobbyPin = ?";
                con.query(sql2, pin_lobby, function (err, result) {
                    if (err) throw err;
                    socket.emit('AllAnswersReceived', "Hej");
                    clearInterval(interval);
                });

            }
        });
    }, 2000);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var access_token = res.app.get('access_token');
  var refresh_token = res.app.get('refresh_token');

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
                  dbLoop();
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
    //currentquestion +1 i databas
    var lobby_pin = 12345;
    var update_quest;
    update_quest = "UPDATE lobby SET currentquestion = currentquestion + 1  WHERE LobbyPin = ?";

    con.query(update_quest, lobby_pin ,function (err ,result) {
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
