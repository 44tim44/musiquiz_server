var con = mysql.createConnection({
    host: "158.174.101.173",
    port: 3001,
    database: "musiquizdb",
    user: "external",
    password: "mqrootex",
    multipleStatements: true
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    var quit = false;


});

function dbLoop() {
    setTimeout(function(){
        var sql = "SELECT AnswersReceived FROM lobby WHERE LobbyPin = ? ; SELECT * FROM tempuser WHERE LobbyPin = ?";
        con.query(sql, [pincode, pincode], function (err, result) {
            if (err) throw err;
            if(result[0][0] < result[1].length /*&& song.time >= song.duration */) {
                dbLoop();
            }
            else {
                correctAnswer();
                setTimeout(redirect, 4000);
                return;
            }
        });
    }, 2000);
}

function correctAnswer() {
    const answer = document.getElementById('nextquest');
    var biggersizeans;
    var wronganswer;
    var correctans = "<%= correctanswer %>";
    answer.innerHTML = correctans;
    var i;

    for (i = 1; i < 5; i++) {
        if (i == correctans) {
            console.log("kom in i correct");
            biggersizeans = document.getElementById("answer_" + correctans);
        } else {
            console.log("kom in i wrong");
            wronganswer = document.getElementById("answer_" + i).style.opacity = "0.2";
        }
    }
}



function redirect(){
    document.redirectQuest.submit();
}

