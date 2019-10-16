var mysql = require('mysql');
var con;

function initDB() {
    if(!con) {
        con = mysql.createConnection({
            host: "158.174.101.173",
            port: 3001,
            database: "musiquizdb",
            user: "external",
            password: "mqrootex"
        });

        con.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");
        });
    } else {
        console.log("SQL Connection already established.");
    }
}

function getDB() {
    return con;
}

module.exports = {
    getDB,
    initDB
};