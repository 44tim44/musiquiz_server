var mysql = require('mysql');
var con;

function initDB() {
    if(!con) {
        con = mysql.createConnection({
            host: "localhost",
            database: "musiquizdb",
            user: "root",
            password: "musiquizroot"
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