const socket = require('socket.io')(8040);
const getDB = require("../javascripts/database").getDB;

socket.on('connection', socket => {

    console.log('New user connected');

    socket.on('Join', message => {
        console.log(message);
        //Save user with username "message.Username" to mySQL DB
        var con = getDB();

        var sql = "SELECT * FROM lobby WHERE LobbyPin = ?";
        con.query(sql, message.PIN, function (err, result) {
            if (err) throw err;

            if(result[0] != undefined){
                var sql2 = "SELECT * FROM tempuser WHERE LobbyPin = ? AND Username = ?";
                con.query(sql2, [message.PIN, message.Username], function (err, result) {
                    if (err) throw err;

                    if(result[0] == undefined) {
                        var sql3 = "INSERT INTO tempuser (LobbyPin, Username) VALUES (?, ?)";
                        con.query(sql3, [message.PIN, message.Username], function (err, rows, result) {
                            if (err) throw err;
                            console.log("1 temporary user inserted.");
                        });
                    }
                    else console.log("Temporary user already exists in database.");
                });
            }
            else console.log("No Lobby with such PIN-code exists.");
        });

        var pin = message.PIN;
        socket.join(pin);

        socket.emit('fromserver', {
            response: "Your data arrived!",
            packet: "This is another packet",
            bajs: "Det här är en brun sak i porslinstronen"
        });

    });

    socket.on('Answer', message => {
        console.log(message);
        // Handle message.Username, message.Answer & message.QuestionNo
        var con = getDB();

        var sql4 = "SELECT * FROM lobby WHERE LobbyPin = ?";

        var sql = "SELECT * FROM lobby WHERE LobbyPin = ?";
        con.query(sql, message.PIN, function (err, result) {
            if (err) throw err;

            if(result[0] != undefined){
                var sql2 = "SELECT * FROM tempuser WHERE LobbyPin = ? AND Username = ?";
                con.query(sql2, [message.PIN, message.Username], function (err, result) {
                    if (err) throw err;

                    if(result[0] == undefined) {
                        var sql3 = "UPDATE tempuser SET Score = Score + 100  WHERE LobbyPin = ? AND Username = ?";
                        con.query(sql3, [message.PIN, message.Username], function (err, rows, result) {
                            if (err) throw err;
                            console.log("1 temporary user inserted.");
                        });
                    }
                    else console.log("Temporary user already exists in database.");
                });
            }
            else console.log("No Lobby with such PIN-code exists.");
        });

        socket.emit('fromserver', {
            response: "Your data arrived!"
        });
    });

    socket.on('Quit', message => {
        //Remove user with username "message.Username" from mySQL DB
        var con = getDB();
        var sql = "SELECT * FROM tempuser WHERE LobbyPin = ? AND Username = ?";

        con.query(sql, [message.PIN, message.Username], function (err, result) {
            if (err) throw err;
            console.log(result[0]);
            if(result[0] != undefined){
                var sql2 = "DELETE FROM tempuser WHERE LobbyPin = ? AND Username = ?";

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