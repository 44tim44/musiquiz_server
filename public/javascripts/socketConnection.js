const socket = require('socket.io')(8040);
const getDB = require("../javascripts/database").getDB;

socket.on('connection', socket => {

    console.log('New user connected');

    socket.on('Join', message => {
        console.log(message);
        //Save user with username "message.Username" to mySQL DB
        var con = getDB();
        var sql = "SELECT * FROM lobby WHERE lobbypin = ?";

        con.query(sql, message.PIN, function (err, result) {
            if (err) throw err;
            console.log(result[0]);
            if(result[0] != undefined){
                var sql2 = "INSERT INTO tempuser (lobbypin, username) VALUES (?, ?)";

                con.query(sql2,[message.PIN, message.Username], function (err, rows, result) {
                    if (err) throw err;
                    console.log("1 record inserted");
                });
            }
        });

        var pin = message.PIN;
        socket.join(pin);

        socket.emit('fromserver', {
            response: "Your data arrived!"
        });

    });

    socket.on('Answer', message => {
        console.log(message);
        // Handle message.Username, message.Answer & message.QuestionNo
        socket.emit('fromserver', {
            response: "Your data arrived!"
        });
    });

    socket.on('Quit', message => {
        //Remove user with username "message.Username" from mySQL DB
        var con = getDB();
        var sql = "SELECT * FROM tempuser WHERE lobbypin = ? AND username = ?";

        con.query(sql, [message.PIN, message.Username], function (err, result) {
            if (err) throw err;
            console.log(result[0]);
            if(result[0] != undefined){
                var sql2 = "DELETE FROM tempuser WHERE lobbypin = ? AND username = ?";

                con.query(sql2,[message.PIN, message.Username], function (err, rows, result) {
                    if (err) throw err;
                    console.log("1 record deleted");
                });
            }
        });

        socket.emit('fromserver', {
            response: "Your data arrived!"
        });
    });

});


function getSocket() {
    return socket;
}

module.exports = {
    getSocket
};