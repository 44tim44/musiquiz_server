var express = require('express');
var router = express.Router();

const getDB = require("../public/javascripts/database").getDB;
var con;

router.use(function (req, res, next) {
    console.log("Retrieved DB.")
    con = getDB();
    next();
});


function getParticipants(callback) {
    var pin_lobby = 12345;

    var sql = "SELECT * FROM tempuser where lobbypin = ? ORDER BY Score DESC, idTempuser ASC"

    con.query(sql, [pin_lobby],function (err ,result) {
        if (err) throw err;
        console.log("Participants: " + result.length);
        callback(err, result);
        //con.end();
    });
}

router.get('/', function (req, res) {
    getParticipants(function(err, sql_result){
        res.render('lobby.html', {title: 'Musiquiz', userName:sql_result});
    });
});

module.exports = router;