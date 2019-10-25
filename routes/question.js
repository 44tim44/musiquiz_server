var express = require('express');
var router = express.Router();

var numbof_questions;
var user;
var glob_lobbypin;
var glob_quizId;

var xml = require("xmlhttprequest").XMLHttpRequest;

const getDB = require("../public/javascripts/database").getDB;
var con;

const getSocket = require("../public/javascripts/socketConnection").getSocket;
var socket;

router.use(function(req,res,next) {
    if(res.app.get('user_id') == undefined){
        res.redirect("/");
        return;
    }
    console.log("Retrieved DB.")
    con = getDB();
    socket = getSocket();
    next();
});

function getLobbyAndQuizid(callback) {

    var lobby_pin_quiz_id = "SELECT LobbyPin FROM lobby WHERE SpotifyID = ?; SELECT CurrentQuiz FROM lobby WHERE SpotifyID = ?"

    con.query(lobby_pin_quiz_id, [user, user] ,function (err ,result) {
        if (err) throw err;
        glob_lobbypin = result[0][0].LobbyPin;
        console.log("lobbypin: " + glob_lobbypin);
        glob_quizId = result[1][0].CurrentQuiz;
        console.log("quizID: " + glob_quizId);
        //con.end();
        callback(err, "Done");
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


function resetQuestionCounter(callback) {
    var questto_zero = "UPDATE lobby SET currentquestion = 0  WHERE LobbyPin = ?";

    con.query(questto_zero, glob_lobbypin ,function (err ,result) {
        if (err) throw err;
        console.log("Question number: " + result);
        callback();
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
function getduration(access_token, spotify_uri,callback) {
    const Http = new xml();
    var str = spotify_uri.split(":");
    var spotify_id = str[str.length - 1];
    const url='https://api.spotify.com/v1/audio-features/'+spotify_id;
    Http.open("GET", url);
    Http.setRequestHeader('Authorization','Bearer ' + access_token);
    Http.send();

    Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && (Http.status == 200)) {

            console.log("ready")
            var Data = JSON.parse(Http.responseText);
            console.log(Data.duration_ms);
            callback("no duration",Data.duration_ms);
        } else {
            console.log("not ready yet")
        }
    }

}

function dbLoop() {
    var interval = setInterval(function(){

        var sql = "SELECT AnswersReceived FROM lobby WHERE LobbyPin = ? ; SELECT * FROM tempuser WHERE LobbyPin = ?";
        con.query(sql, [glob_lobbypin, glob_lobbypin], function (err, result) {
            if (err) throw err;
            if (result[0][0].AnswersReceived >= result[1].length /*&& song.time >= song.duration */) {

                var sql2 = "UPDATE lobby SET AnswersReceived = 0 WHERE LobbyPin = ?";
                con.query(sql2, glob_lobbypin, function (err, result) {
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
    user = res.app.get('user_id');
    /*getquizId();*/

    getLobbyAndQuizid(function (err, result){

        console.log(user);
        getNumbofQuestion(function (err, result){
            numbof_questions = result;


            getQuestionNumber(function (err, qNumber){

                if(numbof_questions > qNumber) {
                    getQuestion(function (err, sql_result) {
                        var obj = sql_result[qNumber];
                        getduration(access_token, obj.SpotifyURI, function (err,duration) {
                        socket.to(glob_lobbypin).emit('NewQuestion', {
                            Question: obj,
                            QuestionNo: qNumber,
                            TimeStart: Date.now() + 1000,
                            TimeStop: Date.now() + 1000 + duration
                        });
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
                            pincode: glob_lobbypin,
                            duration: duration
                        });
                        dbLoop();
                        });

                    });
                }
                else{
                    //Sätt Databas-Lobby-Currentquiz till 0 igen

                    getHighscore(function (err, result) {
                        resetQuestionCounter(function (err){
                            socket.to(glob_lobbypin).emit('QuizEnd', "Quiz has ended");
                            res.render('result.html', {
                                title: 'Musiquiz',
                                access_token,
                                refresh_token,
                                Result: result
                            });

                        });
                    });
                }
            });
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
