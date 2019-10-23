const socket = require('socket.io')(8040);
const getDB = require("../javascripts/database").getDB;

socket.on('connection', socket => {

    console.log('New user connected');

    socket.on('Join', message => {
        console.log(message);
        //Save user with username "message.Username" to mySQL DB
        var con = getDB();
        var response = "Empty";

        /**
         *  Checks if the supplied LobbyPIN is valid
         */
        var sql = "SELECT * FROM lobby WHERE LobbyPin = ?";
        con.query(sql, message.PIN, function (err, result) {
            if (err) throw err;
            if(result[0] != undefined){

                /**
                 *  Checks if the Tempuser already exists in database (in case of reconnect)
                 */
                var sql2 = "SELECT * FROM tempuser WHERE LobbyPin = ? AND Username = ?";
                con.query(sql2, [message.PIN, message.Username], function (err, result) {
                    if (err) throw err;
                    if(result[0] == undefined) {

                        /**
                         *  Checks if the Tempuser already exists in database (in case of reconnect)
                         */
                        var sql3 = "INSERT INTO tempuser (LobbyPin, Username) VALUES (?, ?)";
                        con.query(sql3, [message.PIN, message.Username], function (err, rows, result) {
                            if (err) throw err;
                            response = "1 temporary user inserted.";
                            console.log(response);
                        });
                    }
                    else {
                        response = "Temporary user already exists in database.";
                        console.log(response);
                    }
                });
            }
            else {
                response = "No Lobby with such PIN-code exists.";
                console.log(response);
            }
        });

        var pin = message.PIN;
        socket.join(pin);

        socket.emit('JoinResponse', {
            response: response
        });

    });

    socket.on('Answer', message => {
        console.log(message);
        // Handle message.Username, message.Answer & message.QuestionNo
        var con = getDB();

        /**
         *  Checks if the supplied LobbyPIN is valid
         */
        var sql = "SELECT * FROM lobby WHERE LobbyPin = ?";
        con.query(sql, message.PIN, function (err1, result) {
            if (err1) throw err1;
            if(result[0] != undefined){

                /**
                 *  Checks if the supplied Tempuser-data is valid
                 */
                var sql2 = "SELECT * FROM tempuser WHERE LobbyPin = ? AND Username = ?";
                con.query(sql2, [message.PIN, message.Username], function (err2, result) {
                    if (err2) throw err2;
                    if(result[0] != undefined) {

                        /**
                         *  Select the question currently being played in the lobby which corresponds with supplied PIN-code
                         *  Then check if the supplied answer is the same as the CorrectAnswer in said Question.
                         */
                        var sql3 = "SELECT * FROM question WHERE quiz IN (SELECT CurrentQuiz FROM lobby WHERE LobbyPin = ?)";
                        con.query(sql3, message.PIN, function (err3, result) {
                            var correctAnswer = result[message.QuestionNo].CorrectAnswer;
                            if(correctAnswer == message.Answer){

                                /**
                                 *  Increment Score with 100 points
                                 */
                                var sql4 = "UPDATE tempuser SET Score = Score + 100  WHERE LobbyPin = ? AND Username = ?";
                                con.query(sql4, [message.PIN, message.Username], function (err4, rows, result) {
                                    if (err4) throw err4;
                                    console.log("Correct Answer from " + message.Username + " Score incremented.");
                                });
                            }
                            else console.log("Incorrect Answer from " + message.Username);

                            /**
                             *  Increment Lobby AnswersReceived with 1
                             */
                            var sql5 = "UPDATE lobby SET AnswersReceived = AnswersReceived + 1  WHERE LobbyPin = ?";
                            con.query(sql5, [message.PIN, message.Username], function (err5, rows, result) {
                                if (err5) throw err5;
                                console.log("Lobby " + message.PIN + " AnswersReceived incremented.");
                            });

                        });
                    }
                    else {
                        console.log("Temporary user doesn't exists in database.");
                    }
                });
            }
            else {
                console.log("No Lobby with such PIN-code exists.");
            }
        });

        socket.emit('AnswerResponse', {
            response: "Your data arrived!"
        });
    });

    socket.on('Quit', message => {
        var con = getDB();

        /**
         *  Checks if the supplied Tempuser-data is valid
         */
        var sql = "SELECT * FROM tempuser WHERE LobbyPin = ? AND Username = ?";
        con.query(sql, [message.PIN, message.Username], function (err, result) {
            if (err) throw err;
            console.log(result[0]);
            if(result[0] != undefined){

                /**
                 *  Removes Tempuser-data from Database
                 */
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