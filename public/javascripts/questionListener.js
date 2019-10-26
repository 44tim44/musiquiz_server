var socket = io('http://localhost:8040');

socket.on('AllAnswersReceived', function(msg){
    correctAnswer();
    setTimeout(redirect, 400);
    return;
});


function correctAnswer() {
    var biggersizeans;
    var wronganswer;

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



function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = 0;
        }
    }, 1000);
}
function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

window.onload = function () {
    var song_length = Math.floor(duration / 1000),
        display = document.querySelector('#time');
    startTimer(song_length, display);
};


function redirect(){
    document.redirectQuest.submit();
}

