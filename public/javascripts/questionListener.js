var socket = io('http://localhost:8040');

socket.on('AllAnswersReceived', function(msg){
    correctAnswer();
    setTimeout(redirect, 4000);
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



function redirect(){
    document.redirectQuest.submit();
}

