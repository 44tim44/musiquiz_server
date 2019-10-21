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

router.get('/', function(req, res) {
    res.render('lobby.html', { title: 'Musiquiz'});
});

module.exports = router;
