var express = require('express');
var router = express.Router();

var user;
var glob_lobbypin;
var glob_quizId;

const getDB = require("../public/javascripts/database").getDB;
var con;

const getSocket = require("../public/javascripts/socketConnection").getSocket;
var socket;

router.use(function (req, res, next) {
    if(res.app.get('user_id') == undefined){
        res.redirect("/");
        return;
    }
    glob_quizId =  res.app.get('quiz_id');
    console.log("Retrieved DB.");
    con = getDB();
    socket = getSocket();
    next();
});

function getLobbyAndQuizid(callback) {

    var lobby_pin = "SELECT LobbyPin FROM lobby WHERE SpotifyID = ?"

    con.query(lobby_pin, user ,function (err ,result) {
        if (err) throw err;
        if(result[0] == undefined) {

            /**
             *  Insert new Lobby in Database
             */
            const insert_lobby = "INSERT INTO lobby (SpotifyID, CurrentQuiz) VALUES (?, ?)";
            con.query(insert_lobby, [user, glob_quizId], function (err, rows, result) {
                if (err) throw err;

                /**
                 *  Get PIN from new Lobby in Database
                 */
                const lobby_pin = "SELECT LobbyPin FROM lobby WHERE SpotifyID = ?";
                con.query(lobby_pin, user ,function (err ,result) {
                    if (err) throw err;
                    glob_lobbypin = result[0].LobbyPin;

                    /**
                     *  Get quizID from Lobby in Database
                     */
                    var quiz_id = "SELECT CurrentQuiz FROM lobby WHERE SpotifyID = ?"
                    con.query(quiz_id, user ,function (err ,result) {
                        glob_quizId = result[0].CurrentQuiz;

                        console.log("lobbypin: " + glob_lobbypin);
                        console.log("quizID: " + glob_quizId);
                        callback(err, "Done");
                    });
                });
            });

        }
        else {
            glob_lobbypin = result[0].LobbyPin;

            /**
             *  Get quizID from Lobby in Database
             */
            var quiz_id = "SELECT CurrentQuiz FROM lobby WHERE SpotifyID = ?"
            con.query(quiz_id, user ,function (err ,result) {
                glob_quizId = result[0].CurrentQuiz;

                console.log("lobbypin: " + glob_lobbypin);
                console.log("quizID: " + glob_quizId);
                callback(err, "Done");
            });
        }
    });

}

function getParticipants(callback) {
    var sql = "SELECT * FROM tempuser where lobbypin = ? ORDER BY Score DESC, idTempuser ASC";

    con.query(sql, glob_lobbypin,function (err ,result) {
        if (err) throw err;
        console.log("Participants: " + result.length);
        callback(err, result);
        //con.end();
    });
}

function getQuizData(user,callback) {
    var sql = "SELECT quiz.* FROM quiz INNER JOIN user_quiz ON quiz.idquiz = user_quiz.QuizID INNER JOIN user ON user_quiz.UserID = user.idUser WHERE user.SpotifyID = ?"
    con.query(sql,[user], function (err, result) {
        if (err) throw err;
        console.log("Result: " + result);
        callback(err, result);
    });
}

function dbLoop(participants) {
    var lobbyLoop = setInterval(function(){

        var sql = "SELECT * FROM tempuser where lobbypin = ? ORDER BY Score DESC, idTempuser ASC";
        con.query(sql, glob_lobbypin, function (err, result) {
            if (err) throw err;
            if (result != participants){
                socket.to(glob_lobbypin).emit('UsersChanged', result);
            }
        });
    }, 2000);
}

router.get('/', function (req, res) {
    user = res.app.get('user_id');
    getLobbyAndQuizid(function (err, result) {
        getParticipants(function (err, participants) {
            getQuizData(user,function (err, results) {
                res.app.set('quiz_id', glob_quizId);
                res.render('lobby.html', {
                    title: 'Musiquiz',
                    participants: participants,
                    pincode: glob_lobbypin,
                    quizzes: results,
                    currentQuiz:glob_quizId
                });
                dbLoop(participants);
            })
        });
    });
});

function setLobbyData(play,callback) {
    var sql = "UPDATE lobby SET CurrentQuiz = ? WHERE SpotifyID = ? AND LobbyPin = ?";
    con.query(sql, [play, user, glob_lobbypin], function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
        callback(err, result);
    });
}
router.post('/start', function (req, res) {
    var play = req.body.quizToPlay;

    if(play != undefined){
        setLobbyData(play,function (err, sql_result) {
            updateScore(function (err, result) {
                console.log("PLAYING THIS SHIT: " + play);
                res.app.set('quiz_id',play);
                res.redirect('/question');
            });
        });
    }
    else{
        res.redirect('lobby');
    }
});
function updateScore(callback){
    var update_score = "UPDATE tempuser SET Score = 0 WHERE LobbyPin = ?";
    con.query(update_score, glob_lobbypin, function (err, result) {
        if (err) throw err;
        console.log("Lobby score changed: " + result);
        callback(err ,result);
    });
}

router.post('/exit', function (req, res) {

    var getLobby = "SELECT * FROM lobby WHERE lobbypin = ?"
    con.query(getLobby, glob_lobbypin, function (err, result) {
        if (err) throw err;

        if(result[0] != undefined){
            var deleteLobby = "DELETE FROM lobby WHERE LobbyPin = ? ";
            con.query(deleteLobby, glob_lobbypin, function (err, rows, result) {
                if (err) throw err;
                socket.to(glob_lobbypin).emit('LobbyEnd', "Lobby has ended");
                console.log("Lobby successfully deleted");
                res.redirect('/store');
            });
        }
    });
});

module.exports = router;