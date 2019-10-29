var socket;
if(local == 1) {
    socket = io('http://localhost:8040');
}
else {
    socket = io('https://55t.se:8040/',{secure: true, upgrade: false, transports: ['websocket']});
}

socket.emit('ClientListener', {
    PIN: pincode
});

socket.on('UsersChanged', function(participants){
    updateHTML(participants);
});


function updateHTML(participants) {

    var table = document.getElementById("pTable");

    var str = "<tbody>";
    for(var i = 0; i < participants.length; i++) {
        str = str.concat("<tr>" +
            "<td>" +
            "<div class=\"lobby-username\">" + participants[i].Username+"</div>" +
            "<div class=\"lobby-score\">" + participants[i].Score+"</div>" +
            "</td>" +
            "</tr>");
    }
    str = str.concat("</tbody>");
    table.innerHTML = str;
}

