const socket = require('socket.io')(8040);
const getDB = require("../javascripts/database").getDB;

function SQLjoin(message,callback){
    var con = getDB();
    var response = "Empty";
    var flag = -1;
    /**
     *  Checks if the supplied LobbyPIN is valid
     */
    const sql = "SELECT * FROM lobby WHERE LobbyPin = ?";
    con.query(sql, message.PIN, function (err, result) {
        if (err) throw err;
        if(result[0] != undefined){

            /**
             *  Checks if the Tempuser already exists in database (in case of reconnect)
             */
            const sql2 = "SELECT * FROM tempuser WHERE LobbyPin = ? AND Username = ?";
            con.query(sql2, [message.PIN, message.Username], function (err, result) {
                if (err) throw err;
                if(result[0] == undefined) {

                    /**
                     *  Checks if the Tempuser already exists in database (in case of reconnect)
                     */
                    const sql3 = "INSERT INTO tempuser (LobbyPin, Username) VALUES (?, ?)";
                    con.query(sql3, [message.PIN, message.Username], function (err, rows, result) {
                        if (err) throw err;
                        response = "1 temporary user inserted.";
                        flag = 2;
                        console.log(response);
                        callback(err,response,flag);
                    });
                }
                else {
                    response = "Temporary user already exists in database.";
                    flag = 1;
                    console.log(response);
                    callback(err,response,flag);
                }
            });
        }
        else {
            response = "No Lobby with such PIN-code exists.";
            flag = 0;
            console.log(response);
            callback(err,response,flag);
        }
    });
}

function SQLAnswer(message, callback){
    var con = getDB();
    var response = "Empty";
    var flag = -1;

    /**
     *  Checks if the supplied LobbyPIN is valid
     */
    const sql = "SELECT * FROM lobby WHERE LobbyPin = ?";
    con.query(sql, message.PIN, function (err, result) {
        if (err) throw err;
        if(result[0] != undefined){

            /**
             *  Checks if the supplied Tempuser-data is valid
             */
            const sql2 = "SELECT * FROM tempuser WHERE LobbyPin = ? AND Username = ?";
            con.query(sql2, [message.PIN, message.Username], function (err, result) {
                if (err) throw err;
                if(result[0] != undefined) {

                    /**
                     *  Select the question currently being played in the lobby which corresponds with supplied PIN-code
                     *  Then check if the supplied answer is the same as the CorrectAnswer in said Question.
                     */
                    const sql3 = "SELECT * FROM question WHERE quiz IN (SELECT CurrentQuiz FROM lobby WHERE LobbyPin = ?)";
                    con.query(sql3, message.PIN, function (err, result) {
                        var correctAnswer = result[message.QuestionNo].CorrectAnswer;
                        if(correctAnswer == message.Answer){

                            /**
                             *  Increment Score with 100 points
                             */
                            const sql4 = "UPDATE tempuser SET Score = Score + 100  WHERE LobbyPin = ? AND Username = ?";
                            con.query(sql4, [message.PIN, message.Username], function (err, rows, result) {
                                if (err) throw err;
                                response = "Correct Answer from " + message.Username + " Score incremented.";
                                flag = 3;
                                console.log(response);
                                callback(err,response,flag);
                            });
                        }
                        else {
                            response = "Incorrect Answer from " + message.Username;
                            flag = 2;
                            console.log(response);
                            callback(err,response,flag);
                        }

                        /**
                         *  Increment Lobby AnswersReceived with 1
                         */
                        const sql5 = "UPDATE lobby SET AnswersReceived = AnswersReceived + 1  WHERE LobbyPin = ?";
                        con.query(sql5, [message.PIN, message.Username], function (err, rows, result) {
                            if (err) throw err;
                            console.log("Lobby " + message.PIN + " AnswersReceived incremented.");
                        });

                    });
                }
                else {
                    response = "Temporary user doesn't exists in database.";
                    flag = 1;
                    console.log(response);
                    callback(err,response,flag);
                }
            });
        }
        else {
            response = "No Lobby with such PIN-code exists.";
            flag = 0;
            console.log(response);
            callback(err,response,flag);
        }
    });
}

socket.on('connection', socket => {

    console.log('New connection established');

    socket.on('ClientListener', message => {
            socket.join(message.PIN);
    });

    socket.on('Join', message => {
        console.log(message);

       SQLjoin(message,function(err, response, flag){

           socket.join(message.PIN);

           socket.emit('JoinResponse', {
               response: response,
               flag: flag
           });
       });
    });

    socket.on('Answer', message => {
        console.log(message);
        // Handle message.Username, message.Answer & message.QuestionNo

        SQLAnswer(message,function(err, response, flag) {

            socket.emit('AnswerResponse', {
                response: response,
                flag: flag
            });
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

                    socket.emit('fromserver', {
                        response: "You have quit.",
                        flag: 0
                    });
                });
            }
        });
    });
});


function getSocket() {
    return socket;
}

module.exports = {
    getSocket
};