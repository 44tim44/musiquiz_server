var socket = io('http://localhost:8040');

socket.on('AllAnswersReceived', function(msg){
    correctAnswer();
    setTimeout(redirect, 40000);
    return;
});


function correctAnswer() {
    const answer = document.getElementById('nextquest');
    var biggersizeans;
    var wronganswer;

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



function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}

window.onload = function () {
    var oneMinute = 60,
        display = document.querySelector('#time');
    startTimer(oneMinute, display);
};


function redirect(){
    document.redirectQuest.submit();
}

